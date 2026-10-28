"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArcadeGame } from "./ArcadeGame";

// Konami code sequence
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

export function ArcadeModal() {
  const [open, setOpen] = useState(false);
  const konamiIdx = useRef(0);

  const close = useCallback(() => setOpen(false), []);

  // Konami code listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (open) return; // let ArcadeGame handle keys when open
      if (e.key === KONAMI[konamiIdx.current]) {
        konamiIdx.current += 1;
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0;
          setOpen(true);
        }
      } else {
        konamiIdx.current = e.key === KONAMI[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Floating trigger button — bottom-right corner */}
      <button
        type="button"
        aria-label="Open arcade game"
        title="Play arcade game (or try the Konami code ↑↑↓↓←→←→BA)"
        onClick={() => setOpen(true)}
        className="no-print fixed bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-panel/60 font-mono text-sm text-muted backdrop-blur-sm transition-colors hover:border-signal hover:text-signal"
      >
        ▶
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Arcade game"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="relative w-full max-w-[660px] rounded-sm border border-line bg-paper p-5 shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              aria-label="Close game"
              onClick={close}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-sm border border-line font-mono text-xs text-muted transition-colors hover:border-signal hover:text-signal"
            >
              ×
            </button>

            <ArcadeGame onClose={close} />
          </div>
        </div>
      )}
    </>
  );
}

