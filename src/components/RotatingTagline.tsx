"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

const lines = profile.taglines;
// Fade duration (ms) — keep in sync with the CSS transition below
const FADE_MS = 300;
// How long each tagline is visible before rotating
const ROTATE_MS = 3000;

export function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Respect reduced-motion preference — keep the first tagline static
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % lines.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1
      id="hero-heading"
      className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      {lines[index]}
      {/* Terminal-style blinking cursor */}
      <span
        className="animate-blink ml-[0.05em] inline-block"
        style={{ color: "var(--color-signal)" }}
        aria-hidden="true"
      >
        _
      </span>
    </h1>
  );
}
