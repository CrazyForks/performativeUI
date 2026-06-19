// Generates the social-share (Open Graph) image for the docs site.
// Recreates the landing hero: the Aurora blob field plus the main
// tagline, "AI-native React components for frontier labs".
//
//   node scripts/gen-og.mjs
//
// Output: docs/public/og.png (1200x630), copied verbatim into the
// docs build and served at <homepage>/og.png. Re-run after changing
// the tagline or the brand colors.

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../docs/public/og.png");

const W = 1200;
const H = 630;

// Brand tokens (kept in sync with src/styles.css).
const BG = "#08080b";
const FG = "#f4f4f6";
const GRAD = { from: "#7c3aed", mid: "#ec4899", to: "#06b6d4" };

// Aurora blobs, positions/colors mirrored from the component defaults
// and scaled into the 1200x630 frame. No blur filter: the soft radial
// falloff reads cleanly once rasterized and survives every scraper.
const blobs = [
  { cx: 0.2 * W, cy: 0.3 * H, r: 0.62 * W, color: "124,58,237", a: 0.55 },
  { cx: 0.82 * W, cy: 0.22 * H, r: 0.5 * W, color: "236,72,153", a: 0.45 },
  { cx: 0.52 * W, cy: 0.9 * H, r: 0.5 * W, color: "6,182,212", a: 0.42 },
];

const blobDefs = blobs
  .map(
    (b, i) => `
    <radialGradient id="blob${i}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(${b.color},${b.a})" />
      <stop offset="68%" stop-color="rgba(${b.color},0)" />
    </radialGradient>`,
  )
  .join("");

const blobShapes = blobs
  .map(
    (b, i) =>
      `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="url(#blob${i})" />`,
  )
  .join("\n    ");

const FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${blobDefs}
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0%" stop-color="${GRAD.from}" />
      <stop offset="50%" stop-color="${GRAD.mid}" />
      <stop offset="100%" stop-color="${GRAD.to}" />
    </linearGradient>
    <radialGradient id="readability" cx="50%" cy="52%" r="60%">
      <stop offset="0%" stop-color="rgba(8,8,11,0.55)" />
      <stop offset="100%" stop-color="rgba(8,8,11,0)" />
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}" />
  <g>
    ${blobShapes}
  </g>
  <rect width="${W}" height="${H}" fill="url(#readability)" />

  <text x="${W / 2}" y="288" text-anchor="middle"
        font-family="${FONT}" font-weight="800" font-size="66"
        letter-spacing="-1.5" fill="${FG}">AI-native React components for</text>
  <text x="${W / 2}" y="378" text-anchor="middle"
        font-family="${FONT}" font-weight="800" font-size="84"
        letter-spacing="-2" fill="url(#ink)">frontier labs</text>

  <text x="${W / 2}" y="470" text-anchor="middle"
        font-family="${FONT}" font-weight="500" font-size="26"
        letter-spacing="-0.3" fill="#a3a3b2">Components that signal how oversubscribed your funding round is.</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: { loadSystemFonts: true },
  background: BG,
});
const png = resvg.render().asPng();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, png);
console.log(`Wrote ${OUT} (${png.length} bytes)`);
