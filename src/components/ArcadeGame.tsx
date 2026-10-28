"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const GRID  = 20;           // px per cell
const COLS  = 30;           // canvas width  = GRID * COLS = 600
const ROWS  = 15;           // canvas height = GRID * ROWS = 300
const W     = GRID * COLS;
const H     = GRID * ROWS;
const SPEED = 130;          // ms per tick

// ── Node assets — characters spell out the tech stack ────────────────────────
const NODES = [
  { color: "#0a6e68", label: "P" },  // signal teal  — Python
  { color: "#16a34a", label: "Y" },  // live green
  { color: "#7c3aed", label: "T" },  // purple
  { color: "#ea580c", label: "H" },  // orange
  { color: "#0369a1", label: "O" },  // blue
  { color: "#b91c1c", label: "N" },  // red
  { color: "#0a6e68", label: "R" },  // RAG
  { color: "#16a34a", label: "A" },
  { color: "#7c3aed", label: "G" },
] as const;

type Seg = { x: number; y: number; color: string; label: string };

function randNode() {
  return NODES[Math.floor(Math.random() * NODES.length)];
}

function spawnTarget(segments: Seg[]) {
  // Keep retrying until we find a cell not occupied by the snake
  const occupied = new Set(segments.map((s) => `${s.x},${s.y}`));
  let t: { x: number; y: number };
  do {
    t = {
      x: Math.floor(Math.random() * COLS) * GRID,
      y: Math.floor(Math.random() * ROWS) * GRID,
    };
  } while (occupied.has(`${t.x},${t.y}`));
  return { ...t, ...randNode() };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export function ArcadeGame({ onClose }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef({
    segments: [
      { x: 6 * GRID, y: 7 * GRID, color: NODES[0].color, label: NODES[0].label },
      { x: 5 * GRID, y: 7 * GRID, color: NODES[1].color, label: NODES[1].label },
      { x: 4 * GRID, y: 7 * GRID, color: NODES[2].color, label: NODES[2].label },
    ] as Seg[],
    dx: GRID,
    dy: 0,
    nextDx: GRID,
    nextDy: 0,
    score: 0,
    best: 0,
    dead: false,
    started: false,
    target: null as Seg | null,
  });
  const rafRef     = useRef<number>(0);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef   = useRef<HTMLSpanElement>(null);
  const bestRef    = useRef<HTMLSpanElement>(null);
  const msgRef     = useRef<HTMLDivElement>(null);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Background
    const isDark = document.documentElement.dataset.theme === "dark";
    ctx.fillStyle = isDark ? "#161918" : "#f5f6f4";
    ctx.fillRect(0, 0, W, H);

    // Subtle grid dots
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        ctx.fillRect(c * GRID + GRID / 2 - 1, r * GRID + GRID / 2 - 1, 2, 2);
      }
    }

    // Target node
    if (s.target) {
      const { x, y, color, label } = s.target;
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, GRID - 2, GRID - 2);
      ctx.fillStyle = "#fff";
      ctx.font      = "bold 13px 'IBM Plex Mono', monospace";
      ctx.fillText(label, x + 5, y + 14);
      // Pulsing border
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(x, y, GRID, GRID);
      ctx.globalAlpha = 1;
    }

    // Snake segments
    s.segments.forEach((seg, i) => {
      const alpha = 1 - (i / s.segments.length) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = seg.color;
      ctx.fillRect(seg.x + 1, seg.y + 1, GRID - 2, GRID - 2);
      ctx.fillStyle = "#fff";
      ctx.font      = "bold 13px 'IBM Plex Mono', monospace";
      ctx.fillText(seg.label, seg.x + 5, seg.y + 14);
      ctx.globalAlpha = 1;
    });
  }, []);

  // ── Tick ──────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;

    // Commit buffered direction
    s.dx = s.nextDx;
    s.dy = s.nextDy;

    const head  = s.segments[0];
    const nextX = head.x + s.dx;
    const nextY = head.y + s.dy;

    // Wall collision → game over
    if (nextX < 0 || nextX >= W || nextY < 0 || nextY >= H) {
      s.dead = true;
      s.best = Math.max(s.best, s.score);
      if (bestRef.current) bestRef.current.textContent = String(s.best);
      if (msgRef.current) {
        msgRef.current.textContent = `game over — score ${s.score}. press r to retry`;
        msgRef.current.style.display = "block";
      }
      draw();
      return;
    }

    // Self collision
    if (s.segments.some((seg) => seg.x === nextX && seg.y === nextY)) {
      s.dead = true;
      s.best = Math.max(s.best, s.score);
      if (bestRef.current) bestRef.current.textContent = String(s.best);
      if (msgRef.current) {
        msgRef.current.textContent = `self collision — score ${s.score}. press r to retry`;
        msgRef.current.style.display = "block";
      }
      draw();
      return;
    }

    const newHead: Seg = { x: nextX, y: nextY, color: head.color, label: head.label };
    s.segments.unshift(newHead);

    // Collect target
    if (s.target && nextX === s.target.x && nextY === s.target.y) {
      s.segments[0].color = s.target.color;
      s.segments[0].label = s.target.label;
      s.score += 1;
      if (scoreRef.current) scoreRef.current.textContent = String(s.score);
      s.target = spawnTarget(s.segments);
    } else {
      s.segments.pop();
    }

    draw();

    timerRef.current = setTimeout(tick, SPEED);
  }, [draw]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    const s = stateRef.current;
    if (timerRef.current) clearTimeout(timerRef.current);
    s.segments = [
      { x: 6 * GRID, y: 7 * GRID, color: NODES[0].color, label: NODES[0].label },
      { x: 5 * GRID, y: 7 * GRID, color: NODES[1].color, label: NODES[1].label },
      { x: 4 * GRID, y: 7 * GRID, color: NODES[2].color, label: NODES[2].label },
    ];
    s.dx = GRID; s.dy = 0; s.nextDx = GRID; s.nextDy = 0;
    s.score = 0; s.dead = false; s.started = true;
    s.target = spawnTarget(s.segments);
    if (scoreRef.current) scoreRef.current.textContent = "0";
    if (msgRef.current) msgRef.current.style.display = "none";
    timerRef.current = setTimeout(tick, SPEED);
    draw();
  }, [tick, draw]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;

      if (e.key === "Escape") { onClose(); return; }
      if ((e.key === "r" || e.key === "R") && (s.dead || !s.started)) { reset(); return; }

      if (!s.started) { reset(); return; }

      // Buffer next direction — prevent 180° reversal
      if ((e.key === "ArrowUp"    || e.key === "w") && s.dy === 0) { s.nextDx = 0;    s.nextDy = -GRID; }
      if ((e.key === "ArrowDown"  || e.key === "s") && s.dy === 0) { s.nextDx = 0;    s.nextDy =  GRID; }
      if ((e.key === "ArrowLeft"  || e.key === "a") && s.dx === 0) { s.nextDx = -GRID; s.nextDy = 0; }
      if ((e.key === "ArrowRight" || e.key === "d") && s.dx === 0) { s.nextDx =  GRID; s.nextDy = 0; }

      // Prevent page scroll on arrow keys
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, reset]);

  // ── Mount / unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    s.target = spawnTarget(s.segments);
    draw(); // first paint — idle screen
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Header bar */}
      <div className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-[0.12em]">
        <span className="text-signal">super_mona_game/</span>
        <div className="flex items-center gap-4 text-muted">
          <span>score <span ref={scoreRef} className="text-ink">0</span></span>
          <span>best  <span ref={bestRef}  className="text-ink">0</span></span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block max-w-full rounded-sm border border-line"
          style={{ imageRendering: "pixelated" }}
        />
        {/* Overlay message */}
        <div
          ref={msgRef}
          className="absolute inset-0 flex items-center justify-center bg-paper/80 font-mono text-xs uppercase tracking-[0.1em] text-signal backdrop-blur-[2px]"
          style={{ display: "block" }}
        >
          press any key or r to start
        </div>
      </div>

      {/* Footer */}
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
        arrow keys / wasd to move · esc to close · r to restart
      </p>
    </div>
  );
}
