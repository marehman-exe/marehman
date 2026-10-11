"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

const lines = profile.taglines;

export function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % lines.length);
        setVisible(true);
      }, 350); // half of the CSS transition
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1
      id="hero-heading"
      className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {lines[index]}
    </h1>
  );
}
