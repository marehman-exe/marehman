"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JourneyNode } from "@/data/journey";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

interface Props {
  nodes: JourneyNode[];
}

const HORIZON_YEAR = 2030;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getNowLabel() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildAllYears(nodes: JourneyNode[]): number[] {
  const first = Math.min(...nodes.map((n) => parseInt(n.start)));
  const years: number[] = [];
  for (let y = first; y <= HORIZON_YEAR; y++) years.push(y);
  return years;
}

function getNodeMeta(node: JourneyNode): { tone: "flagship" | "live" | "default"; r: number } {
  if (!node.end) return { tone: "live", r: node.weight === 3 ? 9 : 7 };
  if (node.weight === 3) return { tone: "flagship", r: 7 };
  return { tone: "default", r: node.weight === 2 ? 5 : 3.5 };
}

/**
 * Returns the slug and display name of the featured "now building" project.
 * Source of truth is profile.featuredProjectSlug — an explicit field that
 * avoids fragile URL-substring detection through journey-node links.
 * Falls back gracefully if the slug doesn't match any known project.
 */
function getFeaturedProject(): { slug: string; name: string } {
  const slug = profile.featuredProjectSlug;
  const project = projects.find((p) => p.slug === slug);
  if (project) return { slug, name: project.name };
  // Fallback: first in-progress flagship, or first flagship
  const fallback =
    projects.find((p) => p.weight === 3 && p.status === "in-progress") ??
    projects.find((p) => p.weight === 3);
  return fallback
    ? { slug: fallback.slug, name: fallback.name }
    : { slug: "lexbase-legal-rag", name: "LexBase" };
}

export function HomePipeline({ nodes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [nowHover, setNowHover] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
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
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allYears = buildAllYears(nodes);

  // ── Layout constants ─────────────────────────────────────────────────────
  const W      = 1000;
  const H      = 160;
  const LINE_Y = 88;
  const ML     = 36;
  const MR     = 60;
  const trackW = W - ML - MR;

  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  function xOfYear(year: number): number {
    const frac = (year - allYears[0]) / (HORIZON_YEAR - allYears[0]);
    return ML + frac * trackW;
  }

  const currentFrac = (currentYear + currentMonth / 12 - allYears[0]) / (HORIZON_YEAR - allYears[0]);
  const currentX    = ML + currentFrac * trackW;
  const horizonX    = ML + trackW;

  // Deduplicate: one node per year (highest weight wins)
  const byYear = new Map<number, JourneyNode>();
  for (const node of nodes) {
    const year = parseInt(node.start);
    const existing = byYear.get(year);
    if (!existing || node.weight > existing.weight) byYear.set(year, node);
  }

  const nowLabel = getNowLabel();
  const { slug: liveSlug, name: liveName } = getFeaturedProject();
  const liveHref = `/projects/${liveSlug}`;

  // Years to show a label below (every 2 years to avoid crowding)
  const labelYears = new Set(
    allYears.filter((y) => (y - allYears[0]) % 2 === 0)
  );

  // Clamp tooltip x so it never spills outside the SVG
  function tooltipX(x: number, halfW: number): number {
    return Math.min(Math.max(x, ML + halfW), horizonX - halfW);
  }

  return (
    <div
      ref={containerRef}
      className="pipeline rounded-sm border border-line bg-panel/60 p-4"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Career pipeline from ${allYears[0]} to ${HORIZON_YEAR}. Currently at ${nowLabel}.`}
      >
        {/* ── Base line ────────────────────────────────────────── */}
        <line
          className="stroke-line"
          x1={ML} y1={LINE_Y}
          x2={horizonX} y2={LINE_Y}
          strokeWidth={1.5}
        />

        {/* ── Dashed future overlay: now → horizon ─────────────── */}
        <line
          className="pedge"
          style={{ "--i": allYears.length + 1 } as React.CSSProperties}
          x1={currentX} y1={LINE_Y}
          x2={horizonX} y2={LINE_Y}
          strokeWidth={1}
          stroke="var(--color-line)"
          strokeDasharray="4 4"
          pathLength={1}
          opacity={0.35}
        />

        {/* ── Every-year dots + year labels + hover tooltips ────── */}
        {allYears.map((yr) => {
          const x         = xOfYear(yr);
          const isFuture  = yr > currentYear;
          const isHovered = hoveredYear === yr;
          const node      = byYear.get(yr) ?? null;
          const hasMilestone = node !== null;
          // Skip rendering a plain year dot when there's already a milestone dot
          // (the milestone dot is rendered in the next layer and covers it)
          const showYearDot = !hasMilestone;
          const isLabelYear = labelYears.has(yr) && yr !== HORIZON_YEAR;

          // Tooltip text: node title if exists, else just the year
          const tipText = node ? node.title : String(yr);
          const tipHalf = Math.min(Math.max(tipText.length * 3.3 + 16, 60), 200);
          const tipCx   = tooltipX(x, tipHalf);

          return (
            <g
              key={`yr-${yr}`}
              style={{ cursor: "pointer" } as React.CSSProperties}
              onMouseEnter={() => setHoveredYear(yr)}
              onMouseLeave={() => setHoveredYear(null)}
              onClick={() => router.push("/journey")}
            >
              {/* Invisible wide hit area so hover is easy to trigger */}
              <rect
                x={x - 8} y={LINE_Y - 12}
                width={16} height={24}
                fill="transparent"
              />

              {/* Small year dot — only for years without a milestone */}
              {showYearDot && (
                <circle
                  cx={x} cy={LINE_Y} r={isFuture ? 2 : 2.5}
                  fill={isFuture ? "transparent" : "var(--color-ink)"}
                  stroke="var(--color-line)"
                  strokeWidth={1}
                  opacity={isFuture ? 0.25 : 0.45}
                />
              )}

              {/* Year label below — only every 2 years */}
              {isLabelYear && (
                <text
                  x={x} y={LINE_Y + 18}
                  textAnchor="middle"
                  className="fill-muted font-mono"
                  style={{ fontSize: 10, opacity: isFuture ? 0.25 : 0.6, pointerEvents: "none" }}
                >
                  {yr}
                </text>
              )}

              {/* Hover tooltip — floats above */}
              {isHovered && (
                <g>
                  <rect
                    x={tipCx - tipHalf} y={LINE_Y - 46}
                    width={tipHalf * 2} height={22}
                    rx={3}
                    fill="var(--color-ink)" opacity={0.92}
                  />
                  <text
                    x={tipCx} y={LINE_Y - 31}
                    textAnchor="middle"
                    fill="var(--color-paper)"
                    style={{ fontSize: 10, fontFamily: "var(--font-mono)", pointerEvents: "none" }}
                  >
                    {tipText}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Horizon year label ───────────────────────────────── */}
        <text
          x={horizonX} y={LINE_Y + 18}
          textAnchor="middle"
          className="fill-muted font-mono"
          style={{ fontSize: 10, opacity: 0.25 }}
        >
          {HORIZON_YEAR}
        </text>

        {/* ── Milestone dots (sized by weight, rendered on top) ─── */}
        {Array.from(byYear.entries()).map(([yr, node], nodeIdx) => {
          const meta       = getNodeMeta(node);
          const x          = xOfYear(yr);
          const isLive     = meta.tone === "live";
          const isFlagship = meta.tone === "flagship";
          return (
            <g
              key={`node-${yr}`}
              className="pnode"
              style={{ "--i": nodeIdx + allYears.length, cursor: "pointer", pointerEvents: "none" } as React.CSSProperties}
            >
              {isLive && (
                <circle cx={x} cy={LINE_Y} r={meta.r + 5}
                  className="fill-none stroke-live" strokeWidth={1} opacity={0.35} />
              )}
              <circle
                cx={x} cy={LINE_Y} r={meta.r}
                fill={
                  isFlagship ? "var(--color-signal)"
                  : isLive   ? "var(--color-live)"
                  :            "var(--color-ink)"
                }
              />
            </g>
          );
        })}

        {/* ── NOW dot — clickable, tooltip on hover ────────────── */}
        <g
          className="pnode"
          style={{ "--i": allYears.length, cursor: "pointer" } as React.CSSProperties}
          onClick={() => router.push(liveHref)}
          onMouseEnter={() => setNowHover(true)}
          onMouseLeave={() => setNowHover(false)}
          role="button"
          aria-label={`Most recent project: ${liveName}. Click to view.`}
        >
          <circle cx={currentX} cy={LINE_Y} r={15}
            fill="transparent"
            className="stroke-live" strokeWidth={1} opacity={0.2}
          />
          <circle cx={currentX} cy={LINE_Y} r={9}
            fill="transparent"
            className="stroke-live" strokeWidth={1} opacity={0.45}
          />
          <circle cx={currentX} cy={LINE_Y} r={5} className="fill-live" />

          <text
            x={currentX} y={LINE_Y + 18}
            textAnchor="middle"
            className="fill-live font-mono"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            {nowLabel}
          </text>

          {nowHover && (
            <g>
              <rect
                x={tooltipX(currentX, 84) - 84} y={LINE_Y - 52}
                width={168} height={24}
                rx={3}
                fill="var(--color-ink)" opacity={0.9}
              />
              <text
                x={tooltipX(currentX, 84)} y={LINE_Y - 35}
                textAnchor="middle"
                fill="var(--color-paper)"
                style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              >
                {liveName} →
              </text>
            </g>
          )}
        </g>

      </svg>

      {/* ── Legend + full-journey link ─────────────────────────── */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-signal" aria-hidden />
            flagship
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-live" aria-hidden />
            present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[1px] bg-ink" aria-hidden />
            shipped
          </span>
        </div>
        <Link
          href="/journey"
          className="font-mono text-xs text-signal hover:underline"
        >
          full journey →
        </Link>
      </div>
    </div>
  );
}
