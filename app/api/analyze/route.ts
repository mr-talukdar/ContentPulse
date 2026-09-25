import { GoogleGenAI, MediaResolution } from "@google/genai";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  contentAnalysisJsonSchema,
  contentAnalysisSchema,
} from "@/utils/contentpulse/analysis-schema";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const supportedVideoTypes = new Set([
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
]);

const analysisPrompt = `You are an AI content operations analyst for a streaming platform.

Analyze the supplied video and return only valid JSON matching the provided schema.
Build a factual, operational understanding for editorial, marketing, compliance, and content operations.

Include timestamps for every observation tied to a moment. Do not invent events, characters, dialogue, or timestamps. When uncertain, describe the uncertainty in the relevant explanation. Identify scenes, important narrative moments, promotional opportunities, metadata, and content-review flags. Every review flag is a recommendation for human review.`;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "GEMINI_API_KEY is not configured on the server.",
      500,
    );
  }

  const formData = await request.formData();
  const video = formData.get("video");

  if (!(video instanceof File)) {
    return errorResponse("Upload a video using the 'video' form field.", 400);
  }

  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "100");
  if (video.size > maxUploadMb * 1024 * 1024) {
    return errorResponse(
      `Video exceeds the ${maxUploadMb} MB upload limit.`,
      413,
    );
  }

  if (!supportedVideoTypes.has(video.type)) {
    return errorResponse(
      "Unsupported video format. Use a supported video file such as MP4 or WebM.",
      415,
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const uploadedFile = await ai.files.upload({
      file: new Blob([await video.arrayBuffer()], { type: video.type }),
      config: { displayName: video.name, mimeType: video.type },
    });

    if (!uploadedFile.name || !uploadedFile.uri || !uploadedFile.mimeType) {
      return errorResponse(
        "Gemini accepted the upload but did not return a usable file reference.",
        502,
      );
    }

    let processedFile = uploadedFile;
    for (
      let attempt = 0;
      processedFile.state === "PROCESSING" && attempt < 60;
      attempt += 1
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      processedFile = await ai.files.get({ name: uploadedFile.name });
    }

    if (processedFile.state !== "ACTIVE") {
      return errorResponse(
        "Gemini could not finish processing the video.",
        502,
      );
    }

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
      contents: [
        {
          fileData: {
            fileUri: processedFile.uri,
            mimeType: processedFile.mimeType,
          },
        },
        analysisPrompt,
      ],
      config: {
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_LOW,
        responseMimeType: "application/json",
        responseJsonSchema: contentAnalysisJsonSchema,
      },
    });

    const text = response.text;
    if (!text) {
      return errorResponse("Gemini returned an empty analysis.", 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return errorResponse(
        "Gemini returned invalid JSON for the analysis.",
        502,
      );
    }

    const analysis = contentAnalysisSchema.safeParse(parsed);
    if (!analysis.success) {
      return NextResponse.json(
        {
          error: "Gemini returned JSON that failed ContentPulse validation.",
          issues: analysis.error.issues,
        },
        { status: 502 },
      );
    }

    if (process.env.CONTENTPULSE_DEMO_MODE !== "true") {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const projectName = String(formData.get("projectName") || video.name);
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          video_name: video.name,
          video_uri: processedFile.uri,
        })
        .select("id")
        .single();

      if (projectError || !project) {
        console.error("ContentPulse project persistence failed", projectError);
        return errorResponse(
          "Analysis completed, but the project could not be saved to Supabase.",
          502,
        );
      }

      const { data: savedAnalysis, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          project_id: project.id,
          analysis_json: analysis.data,
          model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
        })
        .select("id, project_id, created_at")
        .single();

      if (analysisError || !savedAnalysis) {
        console.error(
          "ContentPulse analysis persistence failed",
          analysisError,
        );
        return errorResponse(
          "Analysis completed, but the analysis could not be saved to Supabase.",
          502,
        );
      }

      return NextResponse.json({
        analysis: analysis.data,
        model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
        project: savedAnalysis,
        sourceFile: {
          name: video.name,
          mimeType: video.type,
          size: video.size,
        },
      });
    }

    return NextResponse.json({
      analysis: analysis.data,
      model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
      sourceFile: { name: video.name, mimeType: video.type, size: video.size },
    });
  } catch (error) {
    console.error("ContentPulse analysis failed", error);
    return errorResponse(
      "Video analysis failed. Check Gemini credentials, quota, and file format.",
      502,
    );
  }
}
