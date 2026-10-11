"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (_) {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      aria-pressed={theme === "dark"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-signal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal"
    >
      <span aria-hidden className="font-mono text-xs">
        {theme === null ? "·" : theme === "dark" ? "☾" : "☀"}
      </span>
    </button>
  );
}
