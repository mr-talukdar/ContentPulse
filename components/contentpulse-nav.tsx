"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Command Center", href: "/", icon: "⊞" },
  { label: "Generative Studio", href: "/studio", icon: "✦" },
  { label: "Approval Queue", href: "/approval", icon: "✓" },
  { label: "Publisher", href: "/publisher", icon: "🚀" },
  { label: "Analytics", href: "/analytics", icon: "📊" },
  { label: "Insights", href: "/insights", icon: "💡" },
  { label: "Reports", href: "/reports", icon: "📋" },
] as const;

export function ContentPulseNav() {
  const pathname = usePathname();

  return (
    <nav className="cp-nav" aria-label="ContentPulse navigation">
      {navigation.map(({ label, href, icon }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            data-active={isActive ? "true" : undefined}
            className={`group relative flex items-center justify-between rounded-md px-3 py-2.5 text-xs transition-all ${
              isActive
                ? "bg-red-500/15 font-semibold text-white shadow-xs shadow-red-950/40"
                : "font-medium text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
            }`}>
            <span className="flex items-center gap-2.5">
              <span
                className={`text-[12px] transition-colors ${
                  isActive
                    ? "font-bold text-red-400"
                    : "text-zinc-500 group-hover:text-zinc-400"
                }`}>
                {icon}
              </span>
              <span>{label}</span>
            </span>

            {isActive && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
