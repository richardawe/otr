#!/usr/bin/env node
// Generates placeholder app icons from the design tokens (ink square, hollow
// magenta inner square — the same motif as the "inferred" marker) so the
// native builds have something to bundle. Replace with real artwork before
// shipping; this exists so `tauri build` / `cap sync` don't fail on missing
// icon files. No external dependency: hand-rolled, uncompressed PNG writer
// using only Node's built-in zlib.

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const INK = [0x1a, 0x1e, 0x1c];
const MAGENTA = [0xc6, 0x00, 0x6f];

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function pixelAt(x, y, size) {
  const border = Math.round(size * 0.12);
  const innerStart = Math.round(size * 0.34);
  const innerEnd = size - innerStart;
  const strokeWidth = Math.max(2, Math.round(size * 0.045));

  const inCanvas = x >= border && x < size - border && y >= border && y < size - border;
  if (!inCanvas) return INK;

  const onInnerBorder =
    x >= innerStart &&
    x < innerEnd &&
    y >= innerStart &&
    y < innerEnd &&
    (x < innerStart + strokeWidth ||
      x >= innerEnd - strokeWidth ||
      y < innerStart + strokeWidth ||
      y >= innerEnd - strokeWidth);

  return onInnerBorder ? MAGENTA : INK;
}

function encodePng(size) {
  const rowBytes = size * 3 + 1;
  const raw = Buffer.alloc(rowBytes * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y, size);
      const offset = y * rowBytes + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function encodeIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size; // width (0 means 256)
  entry[1] = size >= 256 ? 0 : size; // height
  entry[2] = 0; // palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

const tauriIconsDir = path.join(root, "src-tauri", "icons");
const capResourcesDir = path.join(root, "resources");
mkdirSync(tauriIconsDir, { recursive: true });
mkdirSync(capResourcesDir, { recursive: true });

for (const size of [32, 128, 256]) {
  const png = encodePng(size);
  const name = size === 256 ? "128x128@2x.png" : `${size}x${size}.png`;
  writeFileSync(path.join(tauriIconsDir, name), png);
}

const icon256 = encodePng(256);
writeFileSync(path.join(tauriIconsDir, "icon.ico"), encodeIco(icon256, 256));
writeFileSync(path.join(tauriIconsDir, "icon.png"), icon256);

const icon1024 = encodePng(1024);
writeFileSync(path.join(capResourcesDir, "icon.png"), icon1024);

console.log("Placeholder icons written to src-tauri/icons/ and resources/.");
console.log("Replace with real artwork, then re-run `npx @capacitor/assets generate` for mobile.");
