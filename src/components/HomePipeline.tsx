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

function buildTimelinePoints(nodes: JourneyNode[]) {
  const first = Math.min(...nodes.map((n) => parseInt(n.start)));
  const count = 6;
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

function getMostRecentLiveProject(nodes: JourneyNode[]) {
  return nodes
    .filter((n) => !n.end && n.links?.some((l) => l.url.includes("/projects/")))
    .sort((a, b) => b.start.localeCompare(a.start))[0] ?? null;
}

function getLiveProjectSlug(nodes: JourneyNode[]): string {
  const node = getMostRecentLiveProject(nodes);
  if (node?.links) {
    const link = node.links.find((l) => l.url.includes("/projects/"));
    if (link) {
      const parts = link.url.split("/projects/");
      if (parts[1]) return parts[1];
    }
  }
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

  // ── Layout constants ────────────────────────────────────────────────────
  const W      = 1000;   // viewBox width
  const H      = 160;    // viewBox height
  const LINE_Y = 88;     // vertical centre of the timeline line
  const ML     = 36;     // left margin
  const MR     = 60;     // right margin — room for "2030  ongoing"
  const trackW = W - ML - MR;

  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  function xOfYear(year: number): number {
    const frac = (year - years[0]) / (HORIZON_YEAR - years[0]);
    return ML + frac * trackW;
  }

  const currentFrac = (currentYear + currentMonth / 12 - years[0]) / (HORIZON_YEAR - years[0]);
  const currentX    = ML + currentFrac * trackW;
  const horizonX    = ML + trackW; // exact x of 2030

  // Deduplicate to one node per year (highest weight wins)
  const byYear = new Map<number, JourneyNode>();
  for (const node of nodes) {
    const year = parseInt(node.start);
    const existing = byYear.get(year);
    if (!existing || node.weight > existing.weight) byYear.set(year, node);
  }

  const nowLabel  = getNowLabel();
  const liveSlug  = getLiveProjectSlug(nodes);
  const liveName  = getLiveProjectName(nodes);
  const liveHref  = `/projects/${liveSlug}`;

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
        aria-label={`Career pipeline from ${years[0]} to ${HORIZON_YEAR}. Currently at ${nowLabel}.`}
      >

        {/* ── Full base line (solid) ───────────────────────── */}
        <line
          className="stroke-line"
          x1={ML} y1={LINE_Y}
          x2={horizonX} y2={LINE_Y}
          strokeWidth={1.5}
        />

        {/* ── Dashed overlay: currentX → horizon ──────────── */}
        <line
          className="pedge"
          style={{ "--i": years.length + 1 } as React.CSSProperties}
          x1={currentX} y1={LINE_Y}
          x2={horizonX} y2={LINE_Y}
          strokeWidth={1}
          stroke="var(--color-line)"
          strokeDasharray="4 4"
          pathLength={1}
          opacity={0.35}
        />

        {/* ── Animated solid segments: start → now ────────── */}
        {years.slice(0, -1).map((yr, i) => (
          <line
            key={yr}
            className="pedge stroke-line"
            style={{ "--i": i } as React.CSSProperties}
            x1={xOfYear(yr)}   y1={LINE_Y}
            x2={xOfYear(years[i + 1])} y2={LINE_Y}
            strokeWidth={1.5}
            pathLength={1}
          />
        ))}

        {/* ── Year tick marks (below the line) ────────────── */}
        {years.map((yr, i) => {
          const x        = xOfYear(yr);
          const isPast   = yr < currentYear;
          const isFuture = yr > currentYear;
          // Hide the last tick — 2030 is rendered separately with "ongoing"
          if (yr === HORIZON_YEAR) return null;
          return (
            <g key={yr} className="pnode" style={{ "--i": i } as React.CSSProperties}>
              {/* tick stub */}
              <line
                x1={x} y1={LINE_Y} x2={x} y2={LINE_Y + 6}
                stroke="var(--color-line)"
                strokeWidth={1}
                opacity={isFuture ? 0.25 : 0.5}
              />
              <text
                x={x} y={LINE_Y + 18}
                textAnchor="middle"
                className="fill-muted font-mono"
                style={{ fontSize: 10, opacity: isFuture ? 0.25 : isPast ? 0.6 : 0.85 }}
              >
                {yr}
              </text>
            </g>
          );
        })}

        {/* ── Horizon: "2030  ongoing" inline at right end ── */}
        <line
          x1={horizonX} y1={LINE_Y} x2={horizonX} y2={LINE_Y + 6}
          stroke="var(--color-line)"
          strokeWidth={1}
          opacity={0.2}
        />
        <text
          x={horizonX} y={LINE_Y + 18}
          textAnchor="middle"
          className="fill-muted font-mono"
          style={{ fontSize: 10, opacity: 0.25 }}
        >
          {HORIZON_YEAR}
        </text>
        <text
          x={horizonX} y={LINE_Y + 30}
          textAnchor="middle"
          className="fill-muted font-mono"
          style={{ fontSize: 9, opacity: 0.35, fontStyle: "italic" }}
        >
          ongoing
        </text>

        {/* ── Journey milestone dots ───────────────────────── */}
        {Array.from(byYear.entries()).map(([yr, node], i) => {
          const meta      = getNodeMeta(node);
          const x         = xOfYear(yr);
          const isLive    = meta.tone === "live";
          const isFlagship = meta.tone === "flagship";
          const isEdu     = node.kind === "education";
          const isProject = node.kind === "project";
          const tag       = isEdu ? "Completed" : isProject ? "Deployed" : null;

          return (
            <g
              key={`node-${yr}`}
              className="pnode"
              style={{ "--i": i + years.length, cursor: "pointer" } as React.CSSProperties}
              onClick={() => router.push("/journey")}
            >
              {/* pulse ring for live nodes */}
              {isLive && (
                <circle cx={x} cy={LINE_Y} r={meta.r + 5}
                  className="fill-none stroke-live" strokeWidth={1} opacity={0.35} />
              )}

              {/* main dot */}
              <circle
                cx={x} cy={LINE_Y} r={meta.r}
                fill={
                  isFlagship ? "var(--color-signal)"
                  : isLive   ? "var(--color-live)"
                  :            "var(--color-ink)"
                }
              />

              {/* tag label — rendered in the UPPER zone, well above the line */}
              {tag && (
                <text
                  x={x}
                  y={LINE_Y - meta.r - 14}
                  textAnchor="middle"
                  className="fill-muted font-mono"
                  style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.02em" }}
                >
                  {tag}
                </text>
              )}
            </g>
          );
        })}

        {/* ── NOW dot — clickable, tooltip on hover ────────── */}
        <g
          className="pnode"
          style={{ "--i": years.length, cursor: "pointer" } as React.CSSProperties}
          onClick={() => router.push(liveHref)}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          role="button"
          aria-label={`Most recent project: ${liveName}. Click to view.`}
        >
          {/* outer pulse ring */}
          <circle cx={currentX} cy={LINE_Y} r={15}
            fill="transparent"
            className="stroke-live" strokeWidth={1} opacity={0.2}
          />
          {/* inner ring */}
          <circle cx={currentX} cy={LINE_Y} r={9}
            fill="transparent"
            className="stroke-live" strokeWidth={1} opacity={0.45}
          />
          {/* solid centre */}
          <circle cx={currentX} cy={LINE_Y} r={5} className="fill-live" />

          {/* "now" label — below the line, same row as year ticks */}
          <text
            x={currentX} y={LINE_Y + 18}
            textAnchor="middle"
            className="fill-live font-mono"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            {nowLabel}
          </text>

          {/* Hover tooltip — floats above the dot */}
          {hovering && (
            <g>
              <rect
                x={currentX - 84} y={LINE_Y - 52}
                width={168} height={24}
                rx={3}
                fill="var(--color-ink)" opacity={0.9}
              />
              <text
                x={currentX} y={LINE_Y - 35}
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

      {/* ── Legend + full-journey link ───────────────────────── */}
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
