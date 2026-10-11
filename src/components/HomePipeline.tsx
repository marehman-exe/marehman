"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import type { JourneyNode } from "@/data/journey";

interface Props {
  nodes: JourneyNode[];
}

// Build timeline data from journey nodes
function buildTimelinePoints(nodes: JourneyNode[]) {
  // Use unique years from nodes, sorted ascending
  const years = Array.from(
    new Set(nodes.map((n) => parseInt(n.start)))
  ).sort((a, b) => a - b);

  // Add current year if not there and last node has no end
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) years.push(currentYear);

  return years;
}

function getNodeMeta(node: JourneyNode): { tone: "flagship" | "live" | "default"; r: number } {
  if (!node.end) return { tone: "live", r: node.weight === 3 ? 9 : 7 };
  if (node.weight === 3) return { tone: "flagship", r: 7 };
  return { tone: "default", r: node.weight === 2 ? 5 : 3.5 };
}

export function HomePipeline({ nodes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

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
  const H = 132;
  const Y = 58;
  const margin = 28;
  const step = (W - margin * 2) / (years.length - 1);

  function xOf(year: number) {
    const idx = years.indexOf(year);
    return margin + idx * step;
  }

  // Deduplicate to one node per year (take highest weight)
  const byYear = new Map<number, JourneyNode>();
  for (const node of nodes) {
    const year = parseInt(node.start);
    const existing = byYear.get(year);
    if (!existing || node.weight > existing.weight) byYear.set(year, node);
  }

  return (
    <div
      ref={containerRef}
      className="pipeline rounded-sm border border-line bg-panel/60 p-4"
    >
      <Link
        href="/journey"
        aria-label="Open the full career journey pipeline"
        className="group block rounded-sm transition-opacity hover:opacity-90 focus-visible:opacity-90"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Career pipeline from ${years[0]} to present. Open the full journey.`}
        >
          {/* Edges */}
          {years.slice(0, -1).map((yr, i) => (
            <line
              key={yr}
              className="pedge stroke-line"
              style={{ "--i": i } as React.CSSProperties}
              x1={xOf(yr)}
              y1={Y}
              x2={xOf(years[i + 1])}
              y2={Y}
              strokeWidth={1.5}
              pathLength={1}
            />
          ))}

          {/* Nodes */}
          {years.map((yr, i) => {
            const node = byYear.get(yr);
            const meta = node ? getNodeMeta(node) : { tone: "default" as const, r: 3.5 };
            const x = xOf(yr);
            const isLive = meta.tone === "live";
            const isFlagship = meta.tone === "flagship";
            const isCurrent = yr === new Date().getFullYear();

            return (
              <g
                key={yr}
                className="pnode"
                style={{ "--i": i, opacity: isCurrent || !node ? 0.3 : 1 } as React.CSSProperties}
              >
                {isLive && (
                  <circle
                    cx={x}
                    cy={Y}
                    r={meta.r + 4}
                    className="fill-none stroke-live"
                    strokeWidth={1}
                    opacity={0.6}
                  />
                )}
                <circle
                  cx={x}
                  cy={Y}
                  r={meta.r}
                  className={
                    isFlagship
                      ? "fill-signal"
                      : isLive
                      ? "fill-live"
                      : "fill-ink"
                  }
                />
                <text
                  x={x}
                  y={Y + 24}
                  textAnchor="middle"
                  className="fill-muted font-mono"
                  style={{ fontSize: 11 }}
                >
                  {yr}
                </text>
                {/* Invisible hit target */}
                <circle cx={x} cy={Y} r={13} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </Link>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
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
    </div>
  );
}
