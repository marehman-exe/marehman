"use client";

import { useRole } from "@/context/RoleContext";
import { ROLES, type RoleKey } from "@/data/profile";
import Link from "next/link";

const ROLE_LABELS: Record<RoleKey, string> = {
  ai: "AI / RAG",
  backend: "backend",
  projects: "projects",
};

export function ViewFilter() {
  const { role, setRole } = useRole();

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">view as</span>
      <div
        role="tablist"
        aria-label="View as role"
        className="inline-flex flex-wrap gap-1 rounded-sm border border-line bg-panel/60 p-1"
      >
        {ROLES.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={r === role}
            onClick={() => setRole(r)}
            className={[
              "rounded-[3px] px-3 py-1.5 font-mono text-xs transition-colors",
              r === role ? "bg-signal text-paper" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>
      <Link
        href={`/cv?role=${role}`}
        className="inline-flex items-center gap-1 rounded-sm border border-signal px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-signal transition-colors hover:bg-signal hover:text-paper"
      >
        Download CV ↓
      </Link>
    </div>
  );
}
