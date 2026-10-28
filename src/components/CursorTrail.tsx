"use client";

import { useEffect, useRef } from "react";

const TRAIL_LENGTH = 20;

// Colors that cycle across the trail head → tail, using portfolio CSS vars
// resolved at runtime so they respect dark/light mode automatically.
function getTrailColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  const signal = style.getPropertyValue("--color-signal").trim();
  const live   = style.getPropertyValue("--color-live").trim();
  const muted  = style.getPropertyValue("--color-muted").trim();
  // Head: signal (teal), mid: live (green), tail: muted (grey)
  return Array.from({ length: TRAIL_LENGTH }, (_, i) => {
    const t = i / (TRAIL_LENGTH - 1); // 0 at head, 1 at tail
    if (t < 0.4) return signal;
    if (t < 0.75) return live;
    return muted;
  });
}

export function CursorTrail() {
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const positions = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  );
  const mouse  = useRef({ x: -100, y: -100 });
  const rafId  = useRef<number>(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) return;

    mounted.current = true;

    // Apply per-dot colors once after mount (CSS vars are readable now)
    const colors = getTrailColors();
    dotsRef.current.forEach((el, i) => {
      if (el) el.style.backgroundColor = colors[i];
    });

    function onMouseMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }

    function animate() {
      if (!mounted.current) return;

      const pts = positions.current;
      const m   = mouse.current;

      pts[0].x += (m.x - pts[0].x) * 0.35;
      pts[0].y += (m.y - pts[0].y) * 0.35;

      for (let i = 1; i < TRAIL_LENGTH; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.35;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.35;
      }

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const el = dotsRef.current[i];
        if (!el) continue;
        const progress = 1 - i / TRAIL_LENGTH; // 1 at head → ~0 at tail
        const scale    = 0.3 + progress * 0.7;
        el.style.transform = `translate(${pts[i].x - 5}px, ${pts[i].y - 5}px) scale(${scale})`;
        el.style.opacity   = String(progress * 0.7);
      }

      rafId.current = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      mounted.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) dotsRef.current[i] = el; }}
          className="cursor-trail-dot"
          aria-hidden="true"
        />
      ))}
    </>
  );
}
