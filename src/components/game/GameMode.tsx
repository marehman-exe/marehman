"use client";

/**
 * GameMode — thin React wrapper around the Game class.
 *
 * Responsibilities:
 *  - Detect mobile / reduced-motion and render null if disabled.
 *  - Mount a canvas that covers only the first viewport (hero area).
 *  - Create/destroy the Game instance when the toggle is flipped.
 *  - Handle canvas resize + devicePixelRatio.
 *  - Render the toggle button, score counter, and win overlay.
 *
 * All game logic lives in Game.ts and the entity classes — no game
 * logic belongs in this component.
 */

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { Game } from "./Game";

// ---------------------------------------------------------------------------
// Hook: detect whether the feature should be available at all.
// Returns null while SSR / before mount (avoids hydration mismatch).
//
// useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot):
//   - server/hydration → getServerSnapshot() → null  (no button rendered)
//   - client after hydration → getSnapshot() → true/false
// No useEffect, no setState-in-effect.
// ---------------------------------------------------------------------------
function checkAvailable(): boolean {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(pointer: coarse)").matches
  );
}

// subscribe is a no-op — media queries don't change during a session for our
// purposes; we only need the mount/SSR distinction.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noopSubscribe(_cb: () => void): () => void {
  return () => undefined;
}

function useGameAvailable(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    checkAvailable,          // client snapshot
    () => null,              // server snapshot → null
  );
}

// ---------------------------------------------------------------------------
// Hook: set up the canvas size to fill its container, respecting DPR.
// Calls onResize whenever the logical size changes.
// ---------------------------------------------------------------------------
function useCanvasSize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  onResize: () => void,
) {
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function apply() {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const w   = container.clientWidth;
      const h   = container.clientHeight;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      onResize();
    }

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(container);
    return () => ro.disconnect();
  // onResize is stable (useCallback); canvasRef/containerRef are refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GameMode() {
  const available = useGameAvailable();

  const [active, setActive] = useState(false);
  const [score,  setScore]  = useState(0);
  const [won,    setWon]    = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef      = useRef<Game | null>(null);

  // Called by useCanvasSize whenever the logical canvas size changes.
  const handleResize = useCallback(() => {
    gameRef.current?.resize();
  }, []);

  useCanvasSize(canvasRef, containerRef, handleResize);

  // Create / destroy the Game instance when active changes.
  // State resets (score, won) are performed in the toggle handler below,
  // not inside the effect, to satisfy react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!active) {
      gameRef.current?.destroy();
      gameRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(
      canvas,
      (s) => setScore(s),
      ()  => setWon(true),
    );
    gameRef.current = game;
    game.start();

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [active]);

  // Toggle handler — resets state when deactivating.
  const handleToggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev;
      if (!next) {
        // Turning off: reset score/won immediately (same event, before render)
        setScore(0);
        setWon(false);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setWon(false);
    setScore(0);
    gameRef.current?.reset();
  }, []);

  // Render null until mounted (prevents SSR flash / hydration mismatch).
  if (available === null) return null;
  // Render null on touch / reduced-motion devices.
  if (!available) return null;

  return (
    <>
      {/* ── Canvas container — covers only the first viewport ── */}
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          inset:         0,
          // Canvas is only meaningful when active; hidden otherwise so
          // it consumes no visual space and no pointer events ever block.
          pointerEvents: "none",
          zIndex:        active ? 41 : -1,
          opacity:       active ?  1 :  0,
          // Limit to the first viewport height (hero area).
          bottom:        "auto",
          height:        "100dvh",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", pointerEvents: "none" }}
        />
      </div>

      {/* ── Toggle button ── */}
      <button
        type="button"
        aria-pressed={active}
        aria-label={active ? "Deactivate game mode" : "Activate game mode"}
        onClick={handleToggle}
        style={{
          position:   "fixed",
          bottom:     "1.25rem",   // same row as arcade button (bottom-5)
          left:       "1.25rem",
          zIndex:     41,
          fontFamily: "var(--font-mono)",
          fontSize:   "0.6875rem", // 11px
          letterSpacing: "0.08em",
          lineHeight: "1",
          padding:    "0.3rem 0.55rem",
          cursor:     "pointer",
          borderRadius: "2px",
          border:     `1px solid ${active ? "var(--color-signal)" : "var(--color-line)"}`,
          background: "color-mix(in srgb, var(--color-panel) 60%, transparent)",
          color:      active ? "var(--color-signal)" : "var(--color-muted)",
          backdropFilter: "blur(4px)",
          transition: "border-color 0.15s, color 0.15s",
          pointerEvents: "auto",
        }}
      >
        GAME MODE
      </button>

      {/* ── Score counter (shown when active) ── */}
      {active && (
        <div
          aria-live="polite"
          aria-label={`Score: ${score} of 5`}
          style={{
            position:   "fixed",
            top:        "1rem",
            left:       "1rem",
            zIndex:     42,
            fontFamily: "var(--font-mono)",
            fontSize:   "0.75rem",
            color:      "var(--color-signal)",
            background: "color-mix(in srgb, var(--color-paper) 80%, transparent)",
            border:     "1px solid var(--color-line)",
            borderRadius: "2px",
            padding:    "0.2rem 0.45rem",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          {score} / 5
        </div>
      )}

      {/* ── Win overlay ── */}
      {active && won && (
        <div
          role="status"
          aria-live="assertive"
          style={{
            position:   "fixed",
            inset:      0,
            height:     "100dvh",
            bottom:     "auto",
            zIndex:     43,
            display:    "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap:        "1rem",
            background: "color-mix(in srgb, var(--color-paper) 85%, transparent)",
            backdropFilter: "blur(6px)",
            pointerEvents: "auto",
            fontFamily: "var(--font-mono)",
          }}
        >
          <p style={{ fontSize: "1.5rem", color: "var(--color-signal)", margin: 0 }}>
            5 / 5 ✓
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", margin: 0 }}>
            All gems collected
          </p>
          <button
            type="button"
            onClick={handleReset}
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "0.7rem",
              letterSpacing: "0.06em",
              padding:       "0.35rem 0.7rem",
              cursor:        "pointer",
              borderRadius:  "2px",
              border:        "1px solid var(--color-signal)",
              background:    "transparent",
              color:         "var(--color-signal)",
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </>
  );
}
