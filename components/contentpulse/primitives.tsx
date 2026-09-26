"use client";
import type { ReactNode } from "react";
import type { Platform } from "@/utils/contentpulse/types";
export const platformNames: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};
export const platformRatio: Record<Platform, string> = {
  instagram: "9:16",
  youtube: "16:9",
  facebook: "1:1",
};
export const platformIcon: Record<Platform, string> = {
  instagram: "◎",
  youtube: "▶",
  facebook: "f",
};
export const toneBar: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
};
export const toneText: Record<string, string> = {
  red: "text-red-300",
  blue: "text-blue-300",
  amber: "text-amber-300",
  green: "text-green-300",
};
export const inputClass =
  "w-full border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-red-500";
export const panelClass = "border border-zinc-800 bg-zinc-950/70 p-5";
export function Button({
  children,
  className = "",
  disabled = false,
  onClick,
  title,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}
export function Tag({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "zinc" | "red" | "blue" | "amber" | "green";
}) {
  const colors = {
    zinc: "border-zinc-700 bg-zinc-900 text-zinc-400",
    red: "border-red-500/40 bg-red-500/10 text-red-300",
    blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    green: "border-green-500/40 bg-green-500/10 text-green-300",
  };
  return (
    <span
      className={`inline-flex border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${colors[tone]}`}>
      {children}
    </span>
  );
}
export function Status({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "green"
      : status === "approved" || status === "scheduled"
        ? "blue"
        : status === "rejected"
          ? "red"
          : "amber";
  return <Tag tone={tone}>{status}</Tag>;
}
export function PlatformTag({
  platform,
  ratio = true,
}: {
  platform: Platform;
  ratio?: boolean;
}) {
  return (
    <Tag
      tone={
        platform === "instagram"
          ? "red"
          : platform === "youtube"
            ? "blue"
            : "amber"
      }>
      {platformIcon[platform]} {platformNames[platform]}
      {ratio ? ` · ${platformRatio[platform]}` : ""}
    </Tag>
  );
}
