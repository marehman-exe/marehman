"use client";

/**
 * GameMode — thin React wrapper around the Game class.
 *
 * Responsibilities:
 *  - Detect mobile / reduced-motion and render null if disabled.
 *  - Mount a viewport-sized, fixed canvas (NOT document-height sized).
 *  - Create/destroy the Game instance when the toggle is flipped.
 *  - Handle canvas resize + devicePixelRatio (tells Game to rebuild).
 *  - Render: toggle button, (i) controls tooltip, score counter,
 *    win overlay, and "you fell" overlay.
 *
 * All game logic lives in Game.ts and the entity classes.
 */

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { Game } from "./Game";

// ---------------------------------------------------------------------------
// Hook: SSR-safe availability check (useSyncExternalStore pattern).
// Server snapshot → null (no button). Client snapshot → true/false.
// ---------------------------------------------------------------------------
function checkAvailable(): boolean {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(pointer: coarse)").matches
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noopSubscribe(_cb: () => void): () => void {
  return () => undefined;
}

function useGameAvailable(): boolean | null {
  return useSyncExternalStore(noopSubscribe, checkAvailable, () => null);
}

// ---------------------------------------------------------------------------
// Hook: size the canvas to the viewport (fixed overlay), respecting DPR.
// Calls onResize whenever the logical size changes so Game can rebuild.
// ---------------------------------------------------------------------------
function useCanvasSize(
  canvasRef:    React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  onResize:     () => void,
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
      // Physical pixels
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Logical CSS size
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      // Reset transform after resize (getContext resets it)
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
      onResize();
    }

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(container);
    return () => ro.disconnect();
  // onResize is stable (useCallback); refs are stable by design
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ---------------------------------------------------------------------------
// Shared inline style tokens (read from CSS vars at render time)
// ---------------------------------------------------------------------------
const S = {
  fontMono:  "var(--font-mono)",
  signal:    "var(--color-signal)",
  muted:     "var(--color-muted)",
  line:      "var(--color-line)",
  paper:     "var(--color-paper)",
  panel:     "var(--color-panel)",
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GameMode() {
  const available = useGameAvailable();

  const [active,  setActive]  = useState(false);
  const [score,   setScore]   = useState(0);
  const [won,     setWon]     = useState(false);
  const [fell,    setFell]    = useState(false);
  const [tooltip, setTooltip] = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef      = useRef<Game | null>(null);

  const handleResize = useCallback(() => {
    gameRef.current?.resize();
  }, []);

  useCanvasSize(canvasRef, containerRef, handleResize);

  // Create / destroy the Game when active changes.
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
      ()  => setFell(true),
    );
    gameRef.current = game;
    game.start();

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [active]);

  // Toggle handler — resets transient state when deactivating.
  const handleToggle = useCallback(() => {
    setActive((prev) => {
      const next = !prev;
      if (!next) {
        setScore(0);
        setWon(false);
        setFell(false);
        setTooltip(false);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setWon(false);
    setFell(false);
    setScore(0);
    gameRef.current?.reset();
  }, []);

  const handleRespawn = useCallback(() => {
    setFell(false);
    gameRef.current?.respawn();
  }, []);

  // Render null until mounted or on touch/reduced-motion devices.
  if (available === null || !available) return null;

  // ── Active border color (computed inline; safe during render) ──────────────
  const borderActive = `1px solid ${S.signal}`;
  const borderIdle   = `1px solid ${S.line}`;

  return (
    <>
      {/* ── Canvas container — viewport-sized, fixed overlay ── */}
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "100vw",
          height:        "100vh",
          pointerEvents: "none",
          zIndex:        active ? 41 : -1,
          opacity:       active ?  1 :  0,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", pointerEvents: "none" }}
        />
      </div>

      {/* ── Toggle button + (i) tooltip group — bottom-left ── */}
      <div
        style={{
          position:      "fixed",
          bottom:        "1.25rem",
          left:          "1.25rem",
          zIndex:        42,
          display:       "flex",
          alignItems:    "center",
          gap:           "0.35rem",
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          aria-pressed={active}
          aria-label={active ? "Deactivate game mode" : "Activate game mode"}
          onClick={handleToggle}
          style={{
            fontFamily:    S.fontMono,
            fontSize:      "0.6875rem",
            letterSpacing: "0.08em",
            lineHeight:    "1",
            padding:       "0.3rem 0.55rem",
            cursor:        "pointer",
            borderRadius:  "2px",
            border:        active ? borderActive : borderIdle,
            background:    `color-mix(in srgb, ${S.panel} 60%, transparent)`,
            color:         active ? S.signal : S.muted,
            backdropFilter: "blur(4px)",
            transition:    "border-color 0.15s, color 0.15s",
          }}
        >
          GAME MODE
        </button>

        {/* (i) button — only shown when active */}
        {active && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              aria-label="Show controls"
              aria-expanded={tooltip}
              onClick={() => setTooltip((v) => !v)}
              style={{
                fontFamily:    S.fontMono,
                fontSize:      "0.65rem",
                lineHeight:    "1",
                width:         "1.4rem",
                height:        "1.4rem",
                display:       "flex",
                alignItems:    "center",
                justifyContent: "center",
                cursor:        "pointer",
                borderRadius:  "2px",
                border:        tooltip ? borderActive : borderIdle,
                background:    `color-mix(in srgb, ${S.panel} 60%, transparent)`,
                color:         tooltip ? S.signal : S.muted,
                backdropFilter: "blur(4px)",
                transition:    "border-color 0.15s, color 0.15s",
              }}
            >
              i
            </button>

            {tooltip && (
              <div
                role="tooltip"
                style={{
                  position:      "absolute",
                  bottom:        "calc(100% + 0.4rem)",
                  left:          0,
                  whiteSpace:    "nowrap",
                  fontFamily:    S.fontMono,
                  fontSize:      "0.65rem",
                  lineHeight:    "1.7",
                  color:         S.muted,
                  background:    `color-mix(in srgb, ${S.paper} 95%, transparent)`,
                  border:        borderIdle,
                  borderRadius:  "2px",
                  padding:       "0.4rem 0.6rem",
                  backdropFilter: "blur(6px)",
                  pointerEvents: "none",
                }}
              >
                <div>← → / A D — move</div>
                <div>↑ / W / Space — jump</div>
                <div>Collect all 5 gems</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Score counter (shown when active) ── */}
      {active && (
        <div
          aria-live="polite"
          aria-label={`Score: ${score} of 5`}
          style={{
            position:      "fixed",
            top:           "1rem",
            left:          "1rem",
            zIndex:        42,
            fontFamily:    S.fontMono,
            fontSize:      "0.75rem",
            color:         S.signal,
            background:    `color-mix(in srgb, ${S.paper} 80%, transparent)`,
            border:        borderIdle,
            borderRadius:  "2px",
            padding:       "0.2rem 0.45rem",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          {score} / 5
        </div>
      )}

      {/* ── Win overlay ── */}
      {active && won && (
        <Overlay>
          <p style={{ fontSize: "1.5rem", color: S.signal, margin: 0 }}>5 / 5 ✓</p>
          <p style={{ fontSize: "0.8rem", color: S.muted,  margin: 0 }}>All gems collected</p>
          <OverlayButton onClick={handleReset}>PLAY AGAIN</OverlayButton>
        </Overlay>
      )}

      {/* ── Fell overlay ── */}
      {active && fell && !won && (
        <Overlay>
          <p style={{ fontSize: "1.25rem", color: S.muted,  margin: 0 }}>you fell</p>
          <p style={{ fontSize: "0.75rem", color: S.muted,  margin: 0 }}>score kept: {score} / 5</p>
          <OverlayButton onClick={handleRespawn}>TRY AGAIN</OverlayButton>
          <OverlayButton onClick={handleReset}  secondary>RESET ALL</OverlayButton>
        </Overlay>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Small shared overlay + button sub-components (no React imports needed in
// Game logic — these are purely presentational helpers in the same file).
// ---------------------------------------------------------------------------

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         43,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "0.85rem",
        background:     `color-mix(in srgb, var(--color-paper) 88%, transparent)`,
        backdropFilter: "blur(6px)",
        pointerEvents:  "auto",
        fontFamily:     "var(--font-mono)",
      }}
    >
      {children}
    </div>
  );
}

function OverlayButton({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "0.7rem",
        letterSpacing: "0.06em",
        padding:       "0.35rem 0.7rem",
        cursor:        "pointer",
        borderRadius:  "2px",
        border:        secondary
          ? `1px solid var(--color-line)`
          : `1px solid var(--color-signal)`,
        background:    "transparent",
        color:         secondary ? "var(--color-muted)" : "var(--color-signal)",
      }}
    >
      {children}
    </button>
  );
}
