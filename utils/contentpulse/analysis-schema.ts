import { z } from "zod";

const timestamp = z
  .string()
  .regex(/^\d{2}:\d{2}:\d{2}$/, "Expected HH:MM:SS timestamp");

export const contentAnalysisSchema = z.object({
  executiveSummary: z.string().min(1),
  suggestedTitle: z.string().min(1),
  description: z.string().min(1),
  genres: z.array(z.string()).min(1),
  discoveryTags: z.array(z.string()),
  viewerHooks: z.array(z.string()),
  scenes: z.array(
    z.object({
      start: timestamp,
      end: timestamp,
      title: z.string().min(1),
      description: z.string().min(1),
      characters: z.array(z.string()),
      narrativeImportance: z.string().min(1),
    }),
  ),
  characters: z.array(
    z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
  keyMoments: z.array(
    z.object({
      start: timestamp,
      end: timestamp,
      type: z.string().min(1),
      description: z.string().min(1),
      emotionalState: z.string().min(1),
    }),
  ),
  promotionalOpportunities: z.array(
    z.object({
      start: timestamp,
      end: timestamp,
      momentType: z.string().min(1),
      hook: z.string().min(1),
      whyItWorks: z.string().min(1),
      emotionalState: z.string().min(1),
      curiosityGap: z.string().min(1),
      promoStructure: z.string().min(1),
      socialCaption: z.string().min(1),
      callToAction: z.string().min(1),
    }),
  ),
  reviewFlags: z.array(
    z.object({
      timestamp: timestamp,
      category: z.enum([
        "Language",
        "Violence",
        "Sexual content",
        "Substance reference",
        "Sensitive themes",
      ]),
      severity: z.enum(["Low", "Medium", "High"]),
      explanation: z.string().min(1),
    }),
  ),
});

export type ContentAnalysis = z.infer<typeof contentAnalysisSchema>;

export const contentAnalysisJsonSchema = {
  type: "object",
  properties: {
    executiveSummary: { type: "string" },
    suggestedTitle: { type: "string" },
    description: { type: "string" },
    genres: { type: "array", items: { type: "string" } },
    discoveryTags: { type: "array", items: { type: "string" } },
    viewerHooks: { type: "array", items: { type: "string" } },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: { type: "string" },
          end: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          characters: { type: "array", items: { type: "string" } },
          narrativeImportance: { type: "string" },
        },
        required: [
          "start",
          "end",
          "title",
          "description",
          "characters",
          "narrativeImportance",
        ],
      },
    },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          description: { type: "string" },
        },
        required: ["name", "role", "description"],
      },
    },
    keyMoments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: { type: "string" },
          end: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          emotionalState: { type: "string" },
        },
        required: ["start", "end", "type", "description", "emotionalState"],
      },
    },
    promotionalOpportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: { type: "string" },
          end: { type: "string" },
          momentType: { type: "string" },
          hook: { type: "string" },
          whyItWorks: { type: "string" },
          emotionalState: { type: "string" },
          curiosityGap: { type: "string" },
          promoStructure: { type: "string" },
          socialCaption: { type: "string" },
          callToAction: { type: "string" },
        },
        required: [
          "start",
          "end",
          "momentType",
          "hook",
          "whyItWorks",
          "emotionalState",
          "curiosityGap",
          "promoStructure",
          "socialCaption",
          "callToAction",
        ],
      },
    },
    reviewFlags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timestamp: { type: "string" },
          category: {
            type: "string",
            enum: [
              "Language",
              "Violence",
              "Sexual content",
              "Substance reference",
              "Sensitive themes",
            ],
          },
          severity: { type: "string", enum: ["Low", "Medium", "High"] },
          explanation: { type: "string" },
        },
        required: ["timestamp", "category", "severity", "explanation"],
      },
    },
  },
  required: [
    "executiveSummary",
    "suggestedTitle",
    "description",
    "genres",
    "discoveryTags",
    "viewerHooks",
    "scenes",
    "characters",
    "keyMoments",
    "promotionalOpportunities",
    "reviewFlags",
  ],
} as const;
