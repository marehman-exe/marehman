"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { JourneyNode, JourneyRole } from "@/data/journey";
import { ROLES } from "@/data/profile";
import type { RoleKey } from "@/data/profile";

interface Props {
  nodes: JourneyNode[];
}

const TONE_DOT: Record<string, string> = {
  flagship: "bg-signal",
  live: "bg-live",
  education: "bg-muted",
  default: "bg-ink",
};
const TONE_BORDER: Record<string, string> = {
  flagship: "border-signal",
  live: "border-live",
  education: "border-line",
  default: "border-line",
};

function getTone(node: JourneyNode) {
  if (!node.end && (node.kind === "role" || node.kind === "project")) return "live";
  if (node.weight === 3) return "flagship";
  if (node.kind === "education") return "education";
  return "default";
}

function dotSize(node: JourneyNode) {
  if (node.weight === 3) return "h-3.5 w-3.5";
  if (node.weight === 2) return "h-3 w-3";
  return "h-2.5 w-2.5";
}

function fmtDate(iso: string) {
  const [y, m] = iso.split("-");
  if (!m) return y;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mi = parseInt(m) - 1;
  return `${months[mi]} ${y}`;
}

function dateRange(start: string, end?: string) {
  return `${fmtDate(start)} – ${end ? fmtDate(end) : "Present"}`;
}

function JourneyNodeCard({ node, index, dim }: { node: JourneyNode; index: number; dim: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const tone = getTone(node);
  const hasDetail = (node.detail && node.detail.length > 0) || (node.links && node.links.length > 0);

  return (
    <li
      className="pnode-card pnode relative pl-11 transition-opacity duration-300"
      style={{ "--i": index, opacity: dim ? 0.35 : undefined } as React.CSSProperties}
    >
      {/* Node dot */}
      <span
        aria-hidden
        className={`absolute left-4 top-2 -translate-x-1/2 rounded-[2px] ${dotSize(node)} ${TONE_DOT[tone]}`}
      />
      {/* Live ring */}
      {tone === "live" && (
        <span
          aria-hidden
          className="absolute left-4 top-2 -mt-1 -translate-x-1/2 h-5 w-5 rounded-full border border-live opacity-50"
        />
      )}

      {/* Card */}
      <div className={`rounded-sm border bg-panel/60 p-4 ${TONE_BORDER[tone]}`}>
        {/* Date + kind row */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            {node.end ? dateRange(node.start, node.end) : `${fmtDate(node.start)} · present`}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            {node.kind}
          </span>
          {node.draft && (
            <span
              className="inline-flex items-center rounded-sm border border-live px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-live"
              title="Draft content — awaiting confirmation"
            >
              draft
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-1.5 font-display text-lg text-ink">
          {node.title}
          {node.org && <span className="text-muted"> · {node.org}</span>}
        </h3>

        {/* Summary */}
        <p className="mt-1.5 max-w-2xl font-body text-sm leading-relaxed text-muted">
          {node.summary}
        </p>

        {/* Stack tags */}
        {node.stack && node.stack.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {node.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-sm border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        {/* Expand / collapse */}
        {hasDetail && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-signal hover:underline"
            >
              {expanded ? "collapse ↑" : "detail ↓"}
            </button>

            {expanded && (
              <div className="mt-3 border-t border-line pt-3">
                {node.detail && node.detail.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {node.detail.map((d, i) => (
                      <li key={i} className="flex gap-2 font-body text-sm leading-relaxed text-muted">
                        <span aria-hidden className="mt-1 text-signal">·</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {node.links && node.links.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-3">
                    {node.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-signal hover:underline"
                        >
                          {link.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}

const FILTER_OPTIONS = [
  { id: "all" as const, label: "all" },
  ...ROLES.map((r) => ({ id: r as string, label: r })),
];

export function JourneyMap({ nodes }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const pipelineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = pipelineRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("powered");
      return;
    }
    el.classList.add("arm");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("powered");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Filter row */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">filter</span>
        <div className="flex flex-wrap gap-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              aria-pressed={filter === opt.id}
              className={[
                "rounded-sm border px-2.5 py-1 font-mono text-xs transition-colors",
                filter === opt.id
                  ? "border-signal text-signal"
                  : "border-line text-muted hover:text-ink",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div ref={pipelineRef} className="pipeline relative">
        {/* Spine */}
        <span
          aria-hidden
          className="pspine absolute bottom-2 left-4 top-2 w-px bg-line"
        />
        <ol className="flex flex-col gap-4">
          {nodes.map((node, i) => (
            <JourneyNodeCard
              key={node.id}
              node={node}
              index={i}
              dim={filter !== "all" && !(node.roles as string[]).includes(filter)}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
