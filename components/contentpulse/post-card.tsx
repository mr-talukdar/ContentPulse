"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GeneratedPost } from "@/utils/contentpulse/types";
import { normalizeHashtags } from "@/utils/contentpulse/normalize";
import {
  Button,
  PlatformTag,
  Status,
  Tag,
  panelClass,
  platformNames,
  platformRatio,
} from "@/components/contentpulse/primitives";
type CreativeResponse = {
  error?: string;
  details?: string[];
  imageData?: string;
  creativeUrl?: string;
};
export function PostCard({
  post,
  autoGenerate = false,
  staggerIndex = 0,
}: {
  post: GeneratedPost;
  autoGenerate?: boolean;
  staggerIndex?: number;
}) {
  const hashtags = normalizeHashtags(post.hashtags);
  const [creativeUrl, setCreativeUrl] = useState(post.creativeUrl);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const triggered = useRef(false);
  const generate = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/creative/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const text = await response.text();
      const result = (text ? JSON.parse(text) : {}) as CreativeResponse;
      if (!response.ok || !result.imageData)
        throw new Error(
          result.details?.[0] ?? result.error ?? "Visual generation failed.",
        );
      setCreativeUrl(result.imageData);
      setBusy(false);
      setSaving(true);
      const storage = await fetch("/api/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, imageData: result.imageData }),
      });
      const storedText = await storage.text();
      const stored = (
        storedText ? JSON.parse(storedText) : {}
      ) as CreativeResponse;
      if (!storage.ok || !stored.creativeUrl) {
        setError("Visual generated, but Storage persistence failed.");
        return;
      }
      setCreativeUrl(stored.creativeUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Visual generation failed.",
      );
    } finally {
      setBusy(false);
      setSaving(false);
    }
  }, [post.id]);
  useEffect(() => {
    if (!autoGenerate || creativeUrl || triggered.current) return;
    triggered.current = true;
    const timer = setTimeout(() => void generate(), staggerIndex * 1500);
    return () => clearTimeout(timer);
  }, [autoGenerate, creativeUrl, generate, staggerIndex]);
  return (
    <article
      className={`${panelClass} flex min-h-160 w-120 shrink-0 flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <PlatformTag platform={post.platform} />
          <div className="flex gap-2">
            <Tag>
              {post.language === "bn"
                ? "Bengali · Native generation"
                : "English"}
            </Tag>
            <Status status={post.status} />
          </div>
        </div>
        <code className="text-xs text-zinc-600">{post.id}</code>
      </div>
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden border border-dashed border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-3 text-center text-xs text-zinc-600">
        {creativeUrl ? (
          <Image
            src={creativeUrl}
            alt={post.title ?? `${platformNames[post.platform]} creative`}
            width={600}
            height={450}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : busy ? (
          <div className="flex flex-col items-center gap-3 text-blue-300">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />
            <span>Generating visual...</span>
            <span className="text-[10px] text-zinc-500">
              {platformRatio[post.platform]} composition
            </span>
          </div>
        ) : (
          <span className="max-w-45">
            Creative preview
            <br />
            <span className="text-zinc-500">{post.creativePrompt}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={busy || saving}
          onClick={generate}
          className="border-blue-500/60 text-blue-300">
          {busy
            ? "Generating visual..."
            : saving
              ? "Saving visual..."
              : creativeUrl
                ? "Regenerate visual"
                : "Generate visual ✦"}
        </Button>
        {error && <span className="text-[10px] text-red-300">{error}</span>}
      </div>
      {post.title && (
        <h3 className="font-semibold text-zinc-100">{post.title}</h3>
      )}
      <div className="space-y-3 text-sm leading-6 text-zinc-300">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Caption
          </p>
          <p className="mt-1 whitespace-pre-wrap">{post.caption}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Creative direction
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {post.creativePrompt}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Rationale
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {post.rationale}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {hashtags.map((tag) => (
          <span key={tag} className="text-xs text-blue-300">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
