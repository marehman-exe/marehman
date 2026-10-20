"use client";

import { useRole } from "@/context/RoleContext";
import { ROLES, type RoleKey } from "@/data/profile";
import Link from "next/link";
import { useRef } from "react";

const ROLE_LABELS: Record<RoleKey, string> = {
  ai: "AI / RAG",
  backend: "backend",
  projects: "projects",
};

export function ViewFilter() {
  const { role, setRole } = useRole();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      const next = (index + 1) % ROLES.length;
      tabRefs.current[next]?.focus();
      setRole(ROLES[next]);
    } else if (e.key === "ArrowLeft") {
      const prev = (index - 1 + ROLES.length) % ROLES.length;
      tabRefs.current[prev]?.focus();
      setRole(ROLES[prev]);
    } else if (e.key === "Home") {
      tabRefs.current[0]?.focus();
      setRole(ROLES[0]);
    } else if (e.key === "End") {
      const last = ROLES.length - 1;
      tabRefs.current[last]?.focus();
      setRole(ROLES[last]);
    }
  }

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted" id="viewfilter-label">
        view as
      </span>
      <div
        role="tablist"
        aria-labelledby="viewfilter-label"
        className="inline-flex flex-wrap gap-1 rounded-sm border border-line bg-panel/60 p-1"
      >
        {ROLES.map((r, i) => (
          <button
            key={r}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={r === role}
            tabIndex={r === role ? 0 : -1}
            onClick={() => setRole(r)}
            onKeyDown={(e) => handleKeyDown(e, i)}
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
