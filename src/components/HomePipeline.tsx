"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JourneyNode } from "@/data/journey";

interface Props {
  nodes: JourneyNode[];
}

const HORIZON_YEAR = 2030;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getNowLabel() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Build fixed timeline: first node year → HORIZON_YEAR, ~7 visible points
function buildTimelinePoints(nodes: JourneyNode[]) {
  const nodeYears = Array.from(
    new Set(nodes.map((n) => parseInt(n.start)))
  ).sort((a, b) => a - b);

  const first = nodeYears[0];
  // Fixed intermediate years evenly spread between first and horizon
  const count = 6; // intermediate points
  const span = HORIZON_YEAR - first;
  const intermediates: number[] = [];
  for (let i = 1; i <= count; i++) {
    intermediates.push(Math.round(first + (span * i) / (count + 1)));
  }

  return [first, ...intermediates, HORIZON_YEAR];
}

function getNodeMeta(node: JourneyNode): { tone: "flagship" | "live" | "default"; r: number } {
  if (!node.end) return { tone: "live", r: node.weight === 3 ? 9 : 7 };
  if (node.weight === 3) return { tone: "flagship", r: 7 };
  return { tone: "default", r: node.weight === 2 ? 5 : 3.5 };
}

// Find the most recently started active (no end) project node with a slug
function getMostRecentLiveProject(nodes: JourneyNode[]) {
  return nodes
    .filter((n) => !n.end && n.links?.some((l) => l.url.includes("/projects/")))
    .sort((a, b) => b.start.localeCompare(a.start))[0] ?? null;
}

// Get slug from project links or fall back to lexbase
function getLiveProjectSlug(nodes: JourneyNode[]): string {
  const node = getMostRecentLiveProject(nodes);
  if (node?.links) {
    const link = node.links.find((l) => l.url.includes("/projects/"));
    if (link) {
      const parts = link.url.split("/projects/");
      if (parts[1]) return parts[1];
    }
  }
  // fallback — hardcoded most recent flagship
  return "lexbase-legal-rag";
}

function getLiveProjectName(nodes: JourneyNode[]): string {
  const node = getMostRecentLiveProject(nodes);
  if (node) return node.title;
  return "LexBase";
}

export function HomePipeline({ nodes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hovering, setHovering] = useState(false);

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

  const years = buildTimelinePoints(nodes);
  const W = 1000;
  const H = 160;
  const Y = 68;
  const margin = 28;
  const nowX = W - 14; // x position of the "now" dot
  const stepW = (nowX - margin - 20) / (years.length - 1);

  function xOf(idx: number) {
    return margin + idx * stepW;
  }

  // Map node years onto the timeline x positions
  // For each milestone year, find the closest timeline slot
  function xOfYear(year: number) {
    const span = HORIZON_YEAR - years[0];
    const frac = (year - years[0]) / span;
    return margin + frac * (nowX - margin - 20);
  }

  // Deduplicate to one node per year (take highest weight)
  const byYear = new Map<number, JourneyNode>();
  for (const node of nodes) {
    const year = parseInt(node.start);
    const existing = byYear.get(year);
    if (!existing || node.weight > existing.weight) byYear.set(year, node);
  }

  const hasLiveNode = nodes.some((n) => !n.end);
  const nowLabel = getNowLabel();
  const liveSlug = getLiveProjectSlug(nodes);
  const liveName = getLiveProjectName(nodes);
  const liveHref = `/projects/${liveSlug}`;

  // Current year fraction along the timeline for the "now" dot position
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed
  const currentFrac = (currentYear + currentMonth / 12 - years[0]) / (HORIZON_YEAR - years[0]);
  const currentX = margin + currentFrac * (nowX - margin - 20);

  return (
    <div
      ref={containerRef}
      className="pipeline rounded-sm border border-line bg-panel/60 p-4"
    >
      {/* SVG is NOT a link — we handle clicks per element */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Career pipeline from ${years[0]} to ${HORIZON_YEAR}. Currently at ${nowLabel}.`}
      >
        {/* ── Base timeline line ───────────────────────────── */}
        <line
          className="stroke-line"
          x1={margin}
          y1={Y}
          x2={nowX + 14}
          y2={Y}
          strokeWidth={1.5}
        />

        {/* ── Dashed future line: now → horizon ───────────── */}
        <line
          className="pedge"
          style={{ "--i": years.length + 1 } as React.CSSProperties}
          x1={currentX}
          y1={Y}
          x2={nowX + 14}
          y2={Y}
          strokeWidth={1}
          stroke="var(--color-line)"
          strokeDasharray="4 4"
          pathLength={1}
          opacity={0.4}
        />

        {/* ── Solid line: start → now ──────────────────────── */}
        {years.slice(0, -1).map((yr, i) => (
          <line
            key={yr}
            className="pedge stroke-line"
            style={{ "--i": i } as React.CSSProperties}
            x1={xOfYear(yr)}
            y1={Y}
            x2={xOfYear(years[i + 1])}
            y2={Y}
            strokeWidth={1.5}
            pathLength={1}
          />
        ))}

        {/* ── Year tick marks ──────────────────────────────── */}
        {years.map((yr, i) => {
          const x = xOfYear(yr);
          const isPast = yr < currentYear;
          const isFuture = yr > currentYear;
          return (
            <g key={yr} className="pnode" style={{ "--i": i } as React.CSSProperties}>
              <circle
                cx={x}
                cy={Y}
                r={3}
                fill={isFuture ? "transparent" : "var(--color-ink)"}
                stroke="var(--color-line)"
                strokeWidth={1}
                opacity={isFuture ? 0.3 : isPast ? 0.5 : 1}
              />
              <text
                x={x}
                y={Y + 22}
                textAnchor="middle"
                className="fill-muted font-mono"
                style={{ fontSize: 10, opacity: isFuture ? 0.3 : 0.7 }}
              >
                {yr}
              </text>
            </g>
          );
        })}

        {/* ── Journey milestone dots ───────────────────────── */}
        {Array.from(byYear.entries()).map(([yr, node], i) => {
          const meta = getNodeMeta(node);
          const x = xOfYear(yr);
          const isLive = meta.tone === "live";
          const isFlagship = meta.tone === "flagship";
          const isEdu = node.kind === "education";
          const isProject = node.kind === "project";
          const nodeLabel = isEdu ? "Completed" : isProject ? "Deployed" : null;
          return (
            <g
              key={`node-${yr}`}
              className="pnode"
              style={{ "--i": i + years.length, cursor: "pointer" } as React.CSSProperties}
              onClick={() => router.push("/journey")}
            >
              {isLive && (
                <circle cx={x} cy={Y} r={meta.r + 4}
                  className="fill-none stroke-live" strokeWidth={1} opacity={0.4} />
              )}
              <circle
                cx={x} cy={Y} r={meta.r}
                fill={isFlagship ? "var(--color-signal)" : isLive ? "var(--color-live)" : "var(--color-ink)"}
              />
              {nodeLabel && (
                <text
                  x={x}
                  y={Y - meta.r - 6}
                  textAnchor="middle"
                  className="fill-muted font-mono"
                  style={{ fontSize: 8, opacity: 0.65 }}
                >
                  {nodeLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* ── NOW dot — clickable, shows tooltip ──────────── */}
        <g
          className="pnode"
          style={{ "--i": years.length, cursor: "pointer" } as React.CSSProperties}
          onClick={() => router.push(liveHref)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          role="button"
          aria-label={`Most recent project: ${liveName}. Click to view.`}
        >
          {/* Outer ring */}
          <circle cx={currentX} cy={Y} r={14}
            fill="transparent"
            className="stroke-live" strokeWidth={1} opacity={0.25}
          />
          {/* Inner ring */}
          <circle cx={currentX} cy={Y} r={9}
            fill="transparent"
            className="stroke-live" strokeWidth={1} opacity={0.5}
          />
          {/* Solid dot */}
          <circle cx={currentX} cy={Y} r={5} className="fill-live" />

          {/* Month/year label below */}
          <text
            x={currentX} y={Y + 22}
            textAnchor="middle"
            className="fill-live font-mono"
            style={{ fontSize: 10, fontWeight: 500 }}
          >
            {nowLabel}
          </text>

          {/* Tooltip on hover */}
          {hovering && (
            <g>
              {/* Tooltip box */}
              <rect
                x={currentX - 90}
                y={Y - 46}
                width={180}
                height={26}
                rx={3}
                fill="var(--color-ink)"
                opacity={0.92}
              />
              {/* Project name */}
              <text
                x={currentX}
                y={Y - 28}
                textAnchor="middle"
                fill="var(--color-paper)"
                style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              >
                {liveName} →
              </text>
            </g>
          )}
        </g>

        {/* ── 2030 horizon label ───────────────────────────── */}
        <text
          x={nowX + 14}
          y={Y + 22}
          textAnchor="middle"
          className="fill-muted font-mono"
          style={{ fontSize: 10, opacity: 0.25 }}
        >
          {HORIZON_YEAR}
        </text>

        {/* ── "ongoing" end label ──────────────────────────── */}
        <text
          x={nowX + 14}
          y={Y + 35}
          textAnchor="middle"
          className="fill-muted font-mono"
          style={{ fontSize: 9, opacity: 0.4, fontStyle: "italic" }}
        >
          ongoing
        </text>
      </svg>

      {/* Journey link */}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
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
