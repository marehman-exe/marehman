/**
 * Generates public/og.png — 1200×630 Open Graph image.
 * Uses the @vercel/og / satori approach via pure SVG rendered to PNG
 * with the `sharp` package (already available in Next.js ecosystem).
 * Falls back to writing an SVG if sharp is not installed.
 */

import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR  = join(__dirname, "../public");
const OUT_PNG  = join(OUT_DIR, "og.png");
const OUT_SVG  = join(OUT_DIR, "og.svg");

// ── Design tokens (mirror globals.css) ──────────────────────────────────────
const BG      = "#0f1210";   // dark bg for OG (looks better on social)
const PANEL   = "#161918";
const INK     = "#ecefec";
const MUTED   = "#8a9491";
const SIGNAL  = "#2dd4a8";
const LINE    = "#252928";
const LIVE    = "#4ade80";

const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @import url('data:text/css,');
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Subtle grid lines -->
  <line x1="0" y1="1" x2="${W}" y2="1" stroke="${LINE}" stroke-width="1"/>
  <line x1="0" y1="${H-1}" x2="${W}" y2="${H-1}" stroke="${LINE}" stroke-width="1"/>

  <!-- Left accent bar -->
  <rect x="72" y="110" width="3" height="410" rx="1.5" fill="${SIGNAL}" opacity="0.35"/>

  <!-- Top-left: eyebrow mono label -->
  <text x="100" y="148"
    font-family="ui-monospace, 'IBM Plex Mono', Menlo, monospace"
    font-size="14"
    font-weight="400"
    letter-spacing="3"
    fill="${MUTED}"
    text-transform="uppercase">AI ENGINEER · RAG SYSTEMS · PYTHON</text>

  <!-- Live dot -->
  <circle cx="100" cy="218" r="6" fill="${LIVE}"/>
  <circle cx="100" cy="218" r="11" fill="none" stroke="${LIVE}" stroke-width="1" opacity="0.4"/>

  <!-- Name -->
  <text x="124" y="226"
    font-family="'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
    font-size="54"
    font-weight="700"
    letter-spacing="-1.5"
    fill="${INK}">Muhammad Abdur Rehman</text>

  <!-- Title / role line -->
  <text x="100" y="294"
    font-family="'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
    font-size="26"
    font-weight="500"
    fill="${SIGNAL}">AI Engineer</text>

  <text x="270" y="294"
    font-family="'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
    font-size="26"
    font-weight="400"
    fill="${MUTED}">·  RAG Systems &amp; Backend Engineering</text>

  <!-- Divider -->
  <line x1="100" y1="328" x2="580" y2="328" stroke="${LINE}" stroke-width="1"/>

  <!-- Tagline -->
  <text x="100" y="374"
    font-family="'Instrument Sans', 'Segoe UI', system-ui, sans-serif"
    font-size="20"
    font-weight="400"
    fill="${MUTED}">Building AI applications that turn data into useful answers.</text>

  <!-- Featured project pill -->
  <rect x="100" y="408" width="340" height="44" rx="4" fill="${PANEL}" stroke="${LINE}" stroke-width="1"/>
  <circle cx="126" cy="430" r="5" fill="${SIGNAL}"/>
  <text x="144" y="436"
    font-family="ui-monospace, 'IBM Plex Mono', Menlo, monospace"
    font-size="13"
    fill="${MUTED}"
    letter-spacing="1">NOW BUILDING · LexBase</text>

  <!-- Second pill: SightShield -->
  <rect x="456" y="408" width="278" height="44" rx="4" fill="${PANEL}" stroke="${LINE}" stroke-width="1"/>
  <circle cx="480" cy="430" r="5" fill="${SIGNAL}"/>
  <text x="498" y="436"
    font-family="ui-monospace, 'IBM Plex Mono', Menlo, monospace"
    font-size="13"
    fill="${MUTED}"
    letter-spacing="1">FYP · SightShield</text>

  <!-- Domain / URL -->
  <text x="100" y="530"
    font-family="ui-monospace, 'IBM Plex Mono', Menlo, monospace"
    font-size="15"
    fill="${MUTED}"
    letter-spacing="1">marehmandev.vercel.app</text>

  <!-- Right side: decorative pipeline SVG -->
  <g opacity="0.12">
    <line x1="920" y1="120" x2="920" y2="520" stroke="${SIGNAL}" stroke-width="1.5"/>
    <circle cx="920" cy="200" r="8" fill="${SIGNAL}"/>
    <circle cx="920" cy="300" r="6" fill="${INK}"/>
    <circle cx="920" cy="390" r="10" fill="${SIGNAL}"/>
    <circle cx="920" cy="470" r="5" fill="${INK}"/>
    <line x1="920" y1="200" x2="1020" y2="200" stroke="${SIGNAL}" stroke-width="1"/>
    <line x1="920" y1="390" x2="1060" y2="390" stroke="${SIGNAL}" stroke-width="1"/>
  </g>

  <!-- Corner: github handle -->
  <text x="${W - 72}" y="${H - 52}"
    font-family="ui-monospace, 'IBM Plex Mono', Menlo, monospace"
    font-size="13"
    fill="${MUTED}"
    text-anchor="end"
    letter-spacing="0.5">github.com/marehman-exe</text>
</svg>`;

// ── Write SVG ────────────────────────────────────────────────────────────────
import { writeFileSync } from "fs";
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_SVG, svg, "utf8");
console.log("✓ Wrote og.svg");

// ── Try converting to PNG with sharp ─────────────────────────────────────────
try {
  const { default: sharp } = await import("sharp");
  await sharp(Buffer.from(svg)).resize(W, H).png().toFile(OUT_PNG);
  console.log("✓ Wrote og.png via sharp");
} catch {
  // sharp not available — use @vercel/og pattern or write SVG only
  console.log("⚠ sharp not available. og.svg written. Convert it to og.png (1200×630) manually.");
  console.log("  Option 1: npm install sharp && node scripts/generate-og.mjs");
  console.log("  Option 2: Open og.svg in browser → screenshot at 1200×630");
  console.log("  Option 3: Use Figma or any SVG→PNG converter");
}
