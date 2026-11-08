"use client";

/**
 * GameMode — thin React wrapper around the canvas-based Game.
 * All DOM/window access is deferred to useEffect (SSR-safe).
 * The canvas uses pointer-events:none so it never blocks the real page.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Game } from "./Game";
import type { GamePalette } from "./entities/Player";

function readPalette(): GamePalette {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim() || "#000";
  return {
    ink:    get("--color-ink"),
    signal: get("--color-signal"),
    paper:  get("--color-paper"),
  };
}

/** Runs only on the client after hydration; checks motion/touch preferences. */
function isGameSupported(): boolean {
  const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch  = window.matchMedia("(pointer: coarse)").matches;
  return !noMotion && !isTouch;
}

export function GameMode() {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef   = useRef<Game | null>(null);

  // Check support after mount — schedule via rAF so setState runs outside
  // the effect body and avoids the react-hooks/set-state-in-effect rule.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (isGameSupported()) setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Mount / unmount the Game when active toggles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) {
      gameRef.current?.stop();
      gameRef.current = null;
      return;
    }

    // Size canvas to the full viewport
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Rebuild platforms for new size
      gameRef.current?.reset();
    };
    resize();

    const palette = readPalette();
    const game    = new Game(canvas, palette);
    gameRef.current = game;
    game.start();

    // Handle "R" for reset (win screen)
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && game.won) game.reset();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize",  resize);

    return () => {
      game.stop();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize",  resize);
    };
  }, [active]);

  const toggle = useCallback(() => setActive(v => !v), []);

  if (!visible) return null;

  return (
    <>
      {/* Canvas overlay — pointer-events:none so it never blocks the page */}
      {active && (
        <canvas
          ref={canvasRef}
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         9000,
            pointerEvents:  "none",
            display:        "block",
          }}
          aria-hidden="true"
        />
      )}

      {/* Toggle button — always on top, always interactive */}
      <button
        onClick={toggle}
        aria-label={active ? "Disable game mode" : "Enable game mode"}
        title={active ? "Exit Game Mode" : "Game Mode"}
        style={{
          position:       "fixed",
          bottom:         "1.25rem",
          right:          "1.25rem",
          zIndex:         9001,
          fontFamily:     "'IBM Plex Mono', monospace",
          fontSize:       "0.65rem",
          fontWeight:     700,
          letterSpacing:  "0.08em",
          padding:        "0.35rem 0.65rem",
          border:         `1.5px solid var(--color-${active ? "signal" : "line"})`,
          borderRadius:   "4px",
          background:     active
            ? "var(--color-signal)"
            : "var(--color-paper)",
          color:          active
            ? "var(--color-paper)"
            : "var(--color-muted)",
          cursor:         "pointer",
          transition:     "background 0.15s, color 0.15s, border-color 0.15s",
          userSelect:     "none",
        }}
      >
        {active ? "EXIT GAME" : "GAME MODE"}
      </button>
    </>
  );
}
