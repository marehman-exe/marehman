"use client";

import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { ROLES, type RoleKey } from "@/data/profile";
import { useRef } from "react";

const ROLE_LABELS: Record<RoleKey, string> = {
  ai: "AI Engineer (Part-time, Remote)",
  backend: "Python Backend Developer",
  projects: "Project Portfolio",
};

/**
 * Thin client island — only the role-switcher tabs and print button.
 * The actual CV content is rendered server-side in CvPage.
 */
export function CvRoleSwitcher() {
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
    }
  }

  return (
    <div className="no-print mx-auto mb-6 flex max-w-cv flex-wrap items-center justify-between gap-3 px-4">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-ink"
      >
        ← back to site
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        {/* Role tabs */}
        <div
          role="tablist"
          aria-label="CV variant"
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
              {r}
            </button>
          ))}
        </div>
        {/* Print */}
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border border-signal bg-signal px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-paper transition-opacity hover:opacity-90"
        >
          Download PDF ↓
        </button>
      </div>
    </div>
  );
}

/** Client wrapper that reads role and re-renders CvContent children via context */
export function CvRoleTitle() {
  const { role } = useRole();
  return (
    <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-[#0a6e68]">
      {ROLE_LABELS[role]}
    </p>
  );
}

export function CvRoleSummary({ summaryByRole }: { summaryByRole: Record<RoleKey, string> }) {
  const { role } = useRole();
  return (
    <section className="mt-5">
      <p className="font-body text-sm leading-relaxed text-[#2c332f]">
        {summaryByRole[role]}
      </p>
    </section>
  );
}
