#!/usr/bin/env node
// Fails the build if the bundled output could make a network call. This is
// the enforcement half of the app's "no network requests, ever" guarantee —
// the other half is the strict CSP (connect-src 'none') in index.html.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, "dist");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(distDir).filter((f) => f.endsWith(".js") || f.endsWith(".html") || f.endsWith(".css"));
} catch {
  console.error(`No build output found at ${distDir} — run "npm run build" first.`);
  process.exit(1);
}

// Matches the identifier as a whole word so it doesn't trip on substrings
// like "prefetch" or names that merely contain "socket".
const FORBIDDEN = [
  { name: "fetch(", re: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", re: /\bXMLHttpRequest\b/ },
  { name: "WebSocket", re: /\bnew\s+WebSocket\b/ },
  { name: "sendBeacon", re: /\bsendBeacon\b/ },
  { name: "EventSource", re: /\bnew\s+EventSource\b/ }
];

const hits = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const { name, re } of FORBIDDEN) {
    if (re.test(text)) hits.push(`${path.relative(root, file)}: contains ${name}`);
  }
}

if (hits.length > 0) {
  console.error("No-network check failed — the bundle can reach the network:\n");
  for (const h of hits) console.error(" - " + h);
  process.exit(1);
}

console.log(`No-network check OK: scanned ${files.length} file(s) in dist/, found no network APIs.`);
