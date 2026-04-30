#!/usr/bin/env node
/**
 * Generates assets/icon.png and assets/adaptive-icon.png (1024x1024)
 * Sky-blue → forest-green gradient + white canary silhouette + "CANARI" wordmark
 *
 * Uses only pngjs (already a transitive dep) + built-in Node.js.
 * Run: node scripts/generate-icon.js
 */

const { PNG } = require("pngjs");
const fs = require("fs");
const path = require("path");

const SIZE = 1024;

// ─── Gradient colours ───────────────────────────────────────────────────────
const COLOR_TL = { r: 14, g: 165, b: 233 };  // #0ea5e9 sky-blue
const COLOR_BR = { r: 22, g: 163, b: 74 };   // #16a34a forest-green

function gradientColor(x, y) {
  const t = (x / SIZE + y / SIZE) / 2;
  return {
    r: Math.round(COLOR_TL.r + (COLOR_BR.r - COLOR_TL.r) * t),
    g: Math.round(COLOR_TL.g + (COLOR_BR.g - COLOR_TL.g) * t),
    b: Math.round(COLOR_TL.b + (COLOR_BR.b - COLOR_TL.b) * t),
  };
}

// ─── Rasterise helpers ───────────────────────────────────────────────────────
function setPixel(data, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const idx = (y * SIZE + x) * 4;
  // Alpha-blend over existing pixel
  const alpha = a / 255;
  data[idx]     = Math.round(data[idx]     * (1 - alpha) + r * alpha);
  data[idx + 1] = Math.round(data[idx + 1] * (1 - alpha) + g * alpha);
  data[idx + 2] = Math.round(data[idx + 2] * (1 - alpha) + b * alpha);
  data[idx + 3] = 255;
}

/** Filled anti-aliased circle */
function fillCircle(data, cx, cy, radius, r, g, b) {
  const rx = Math.ceil(radius);
  for (let dy = -rx; dy <= rx; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const aa = dist > radius - 1 ? Math.round((radius - dist + 1) * 255) : 255;
        setPixel(data, Math.round(cx + dx), Math.round(cy + dy), r, g, b, aa);
      }
    }
  }
}

/** Filled anti-aliased ellipse (with optional rotation in radians) */
function fillEllipse(data, cx, cy, rx, ry, angle, r, g, b, alpha = 255) {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const pad = Math.max(rx, ry) + 2;
  for (let dy = -pad; dy <= pad; dy++) {
    for (let dx = -pad; dx <= pad; dx++) {
      // Rotate point back
      const lx = cos * dx - sin * dy;
      const ly = sin * dx + cos * dy;
      const val = (lx / rx) ** 2 + (ly / ry) ** 2;
      if (val <= 1) {
        const dist = Math.sqrt(val);
        const edge = Math.max(rx, ry);
        const aa = dist > 1 - 1 / edge ? Math.round((1 - dist) * edge * 255) : alpha;
        setPixel(data, Math.round(cx + dx), Math.round(cy + dy), r, g, b, Math.min(aa, alpha));
      }
    }
  }
}

/** Filled triangle */
function fillTriangle(data, x0, y0, x1, y1, x2, y2, r, g, b) {
  const minX = Math.floor(Math.min(x0, x1, x2));
  const maxX = Math.ceil(Math.max(x0, x1, x2));
  const minY = Math.floor(Math.min(y0, y1, y2));
  const maxY = Math.ceil(Math.max(y0, y1, y2));

  function sign(ax, ay, bx, by, cx, cy) {
    return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
  }

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const d1 = sign(px, py, x0, y0, x1, y1);
      const d2 = sign(px, py, x1, y1, x2, y2);
      const d3 = sign(px, py, x2, y2, x0, y0);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNeg && hasPos)) setPixel(data, px, py, r, g, b);
    }
  }
}

/** Filled convex polygon (list of [x,y] points) */
function fillPolygon(data, pts, r, g, b) {
  const minX = Math.floor(Math.min(...pts.map(p => p[0])));
  const maxX = Math.ceil(Math.max(...pts.map(p => p[0])));
  const minY = Math.floor(Math.min(...pts.map(p => p[1])));
  const maxY = Math.ceil(Math.max(...pts.map(p => p[1])));

  function sign(ax, ay, bx, by, px, py) {
    return (ax - px) * (by - py) - (bx - px) * (ay - py);
  }

  for (let py = minY; py <= maxY; py++) {
    let inside = false;
    for (let px = minX; px <= maxX; px++) {
      let crossings = 0;
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= py && by > py) || (by <= py && ay > py)) {
          const t = (py - ay) / (by - ay);
          if (px < ax + t * (bx - ax)) crossings++;
        }
      }
      if (crossings % 2 !== 0) setPixel(data, px, py, r, g, b);
    }
  }
}

// ─── Simple bitmap font (digits + uppercase letters we need) ────────────────
// 5×7 pixel font, only the chars in "CANARI"
const FONT = {
  C: [0b11111, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
};

function drawText(data, text, cx, cy, charW, charH, gap, r, g, b) {
  const totalW = text.length * charW + (text.length - 1) * gap;
  let x = cx - totalW / 2;
  for (const ch of text) {
    const rows = FONT[ch];
    if (!rows) { x += charW + gap; continue; }
    const scaleX = charW / 5;
    const scaleY = charH / 7;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (rows[row] & (1 << (4 - col))) {
          const px0 = Math.round(x + col * scaleX);
          const py0 = Math.round(cy - charH / 2 + row * scaleY);
          const pw = Math.max(1, Math.round(scaleX));
          const ph = Math.max(1, Math.round(scaleY));
          for (let dy = 0; dy < ph; dy++)
            for (let dx = 0; dx < pw; dx++)
              setPixel(data, px0 + dx, py0 + dy, r, g, b);
        }
      }
    }
    x += charW + gap;
  }
}

// ─── Build the icon ──────────────────────────────────────────────────────────
function buildIcon() {
  const png = new PNG({ width: SIZE, height: SIZE });

  // 1. Gradient background
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const { r, g, b } = gradientColor(x, y);
      const idx = (y * SIZE + x) * 4;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  // 2. Bird silhouette — centred around (512, 430), scale ~2.8× from 160px prototype
  //    All coordinates scaled from the 160×160 SVG prototype (origin at 80,68)
  //    Scale factor: 1024/160 = 6.4, bird occupies ~60% → scale 3.8
  const S = 3.8;
  const OX = 512; // centre X
  const OY = 400; // centre Y

  const W = [255, 255, 255];

  // Body ellipse (rx=28, ry=19, rotate -10deg)
  fillEllipse(png.data, OX, OY + 4 * S, 28 * S, 19 * S, -0.175, ...W);

  // Head circle (cx=22, cy=-17, r=14)
  fillCircle(png.data, OX + 22 * S, OY - 17 * S, 14 * S, ...W);

  // Beak triangle (points: 34,-19  46,-15  34,-11)
  fillTriangle(
    png.data,
    OX + 34 * S, OY - 19 * S,
    OX + 46 * S, OY - 15 * S,
    OX + 34 * S, OY - 11 * S,
    ...W
  );

  // Tail polygon (points: -24,8  -46,2  -46,18  -24,16)
  fillPolygon(png.data, [
    [OX - 24 * S, OY + 8 * S],
    [OX - 46 * S, OY + 2 * S],
    [OX - 46 * S, OY + 18 * S],
    [OX - 24 * S, OY + 16 * S],
  ], ...W);

  // Wing highlight (slightly transparent — use gradient colour tinted white)
  fillEllipse(png.data, OX - 3 * S, OY + 2 * S, 17 * S, 10 * S, -0.175, 255, 255, 255, 55);

  // Eye (filled with gradient colour to create a "hole")
  const eyeX = Math.round(OX + 26 * S);
  const eyeY = Math.round(OY - 19 * S);
  const { r: er, g: eg, b: eb } = gradientColor(eyeX, eyeY);
  fillCircle(png.data, eyeX, eyeY, 2.8 * S, er, eg, eb);

  // Legs
  const legW = Math.max(4, Math.round(1.5 * S));
  // Left leg
  for (let dy = 0; dy <= Math.round(14 * S); dy++)
    for (let dx = 0; dx < legW; dx++)
      setPixel(png.data, Math.round(OX - 2 * S) + dx, Math.round(OY + 22 * S) + dy, ...W);
  // Right leg
  for (let dy = 0; dy <= Math.round(14 * S); dy++)
    for (let dx = 0; dx < legW; dx++)
      setPixel(png.data, Math.round(OX + 10 * S) + dx, Math.round(OY + 22 * S) + dy, ...W);
  // Left foot
  fillPolygon(png.data, [
    [OX - 10 * S, OY + 35 * S],
    [OX + 2 * S,  OY + 35 * S],
    [OX + 2 * S,  OY + 37.5 * S],
    [OX - 10 * S, OY + 37.5 * S],
  ], ...W);
  // Right foot
  fillPolygon(png.data, [
    [OX + 6 * S,  OY + 35 * S],
    [OX + 18 * S, OY + 35 * S],
    [OX + 18 * S, OY + 37.5 * S],
    [OX + 6 * S,  OY + 37.5 * S],
  ], ...W);

  // 3. "CANARI" wordmark below the bird
  const TEXT = "CANARI";
  const charW = 52;
  const charH = 72;
  const textGap = 20;
  const textY = OY + 55 * S;
  drawText(png.data, TEXT, OX, textY, charW, charH, textGap, ...W);

  return png;
}

// ─── Write files ─────────────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, "..", "assets");

console.log("Generating icon…");
const icon = buildIcon();
const iconBuf = PNG.sync.write(icon);
fs.writeFileSync(path.join(assetsDir, "icon.png"), iconBuf);
fs.writeFileSync(path.join(assetsDir, "adaptive-icon.png"), iconBuf);
console.log("✓ assets/icon.png");
console.log("✓ assets/adaptive-icon.png");

// Splash icon (canary only, no wordmark, larger bird)
console.log("Generating splash icon…");
const splash = new PNG({ width: SIZE, height: SIZE });
// Transparent background (splash bg colour is set in app.json)
for (let i = 0; i < SIZE * SIZE * 4; i += 4) {
  splash.data[i] = 0;
  splash.data[i + 1] = 0;
  splash.data[i + 2] = 0;
  splash.data[i + 3] = 0;
}
// Bird only, centred, slightly larger
const SS = 4.4;
const SOX = 512;
const SOY = 480;
fillEllipse(splash.data, SOX, SOY + 4 * SS, 28 * SS, 19 * SS, -0.175, 255, 255, 255);
fillCircle(splash.data, SOX + 22 * SS, SOY - 17 * SS, 14 * SS, 255, 255, 255);
fillTriangle(splash.data,
  SOX + 34 * SS, SOY - 19 * SS,
  SOX + 46 * SS, SOY - 15 * SS,
  SOX + 34 * SS, SOY - 11 * SS,
  255, 255, 255);
fillPolygon(splash.data, [
  [SOX - 24 * SS, SOY + 8 * SS],
  [SOX - 46 * SS, SOY + 2 * SS],
  [SOX - 46 * SS, SOY + 18 * SS],
  [SOX - 24 * SS, SOY + 16 * SS],
], 255, 255, 255);

const splashBuf = PNG.sync.write(splash);
fs.writeFileSync(path.join(assetsDir, "splash-icon.png"), splashBuf);
console.log("✓ assets/splash-icon.png");

console.log("\nDone. Re-start Expo to pick up the new assets.");
