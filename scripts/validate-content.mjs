#!/usr/bin/env node
// Validates /content against the record schema and cross-references, with
// no dependency beyond Node's built-ins. The single rule that matters most:
// a record marked "documented" or "reported" must carry at least one real
// source; nothing here can prove a URL is genuine, so that check is done by
// hand — but an empty sources array on those tiers is caught automatically.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(root, "content");

function readJson(relPath) {
  return JSON.parse(readFileSync(path.join(contentDir, relPath), "utf8"));
}

const errors = [];
const warn = (msg) => errors.push(msg);

const records = readJson("records.json");
const modules = readJson("modules.json");
const day = readJson("day.json");
const profile = readJson("profile.json");

const KINDS = new Set(["emitted", "inferred", "relational"]);
const CONFIDENCE = new Set(["documented", "reported", "modelled"]);
const SOURCE_TYPES = new Set([
  "regulatory",
  "litigation",
  "journalism",
  "academic",
  "policy",
  "vendor_doc"
]);
const ID_RE = /^[a-z0-9]+(\.[a-z0-9_]+)+$/;
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

const seenIds = new Set();

if (!Array.isArray(records) || records.length === 0) {
  warn("records.json must be a non-empty array");
}

for (const r of records) {
  const where = `record "${r.id ?? "?"}"`;

  if (!ID_RE.test(r.id ?? "")) warn(`${where}: invalid id format`);
  if (seenIds.has(r.id)) warn(`${where}: duplicate id`);
  seenIds.add(r.id);

  if (!r.datum) warn(`${where}: missing datum`);
  if (!r.holder_type) warn(`${where}: missing holder_type`);
  if (!KINDS.has(r.kind)) warn(`${where}: invalid kind "${r.kind}"`);
  if (!r.mechanism) warn(`${where}: missing mechanism`);
  if (!Array.isArray(r.conditions)) warn(`${where}: conditions must be an array`);
  if (!Array.isArray(r.jurisdictions)) warn(`${where}: jurisdictions must be an array`);
  if (!Array.isArray(r.tags)) warn(`${where}: tags must be an array`);
  if (!CONFIDENCE.has(r.confidence)) warn(`${where}: invalid confidence "${r.confidence}"`);
  if (!Array.isArray(r.sources)) {
    warn(`${where}: sources must be an array`);
  } else {
    // The rule that protects the whole product: no undocumented citation.
    if ((r.confidence === "documented" || r.confidence === "reported") && r.sources.length === 0) {
      warn(
        `${where}: confidence "${r.confidence}" requires at least one source — ` +
          `if no real source exists, set confidence to "modelled" instead`
      );
    }
    for (const s of r.sources) {
      if (!s.title) warn(`${where}: source missing title`);
      if (!s.publisher) warn(`${where}: source missing publisher`);
      if (!s.url || !s.url.startsWith("https://")) {
        warn(`${where}: source url must be an https URL`);
      }
      if (!s.date || !DATE_RE.test(s.date)) warn(`${where}: source date "${s.date}" is not YYYY[-MM[-DD]]`);
      if (!SOURCE_TYPES.has(s.type)) warn(`${where}: invalid source type "${s.type}"`);
    }
  }
}

function checkRecordRef(id, where) {
  if (!seenIds.has(id)) warn(`${where}: references unknown record id "${id}"`);
}

for (const id of modules.baseline ?? []) checkRecordRef(id, "modules.json baseline");
for (const m of modules.modules ?? []) {
  if (!Array.isArray(m.keys) || m.keys.length === 0) warn(`module "${m.id}": needs at least one key`);
  for (const id of m.records ?? []) checkRecordRef(id, `module "${m.id}"`);
}

for (const moment of day.moments ?? []) {
  for (const entry of moment.entries ?? []) {
    checkRecordRef(entry.record, `day.json moment t=${moment.t}`);
    if (typeof entry.count !== "number" || entry.count <= 0) {
      warn(`day.json moment t=${moment.t}: entry "${entry.record}" needs a positive count`);
    }
    if (!entry.count_basis) {
      warn(`day.json moment t=${moment.t}: entry "${entry.record}" missing count_basis`);
    }
  }
}

for (const c of profile.conclusions ?? []) {
  checkRecordRef(c.record, `profile.json conclusion "${c.claim}"`);
}

// Strings: every language file must declare its own dir/label and share the
// same key shape as English (missing keys silently fall back to the key
// itself at runtime, which is safe but worth flagging here).
import { readdirSync } from "node:fs";

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keys.push(...flattenKeys(v, full));
    else keys.push(full);
  }
  return keys;
}

const stringsDir = path.join(contentDir, "strings");
const stringFiles = readdirSync(stringsDir).filter((f) => f.endsWith(".json"));
const enStrings = readJson("strings/en.json");
const enKeys = new Set(flattenKeys(enStrings));

for (const file of stringFiles) {
  const strings = readJson(`strings/${file}`);
  if (!strings.meta?.language) warn(`strings/${file}: missing meta.language`);
  if (!strings.meta?.dir) warn(`strings/${file}: missing meta.dir`);
  if (!strings.meta?.label) warn(`strings/${file}: missing meta.label`);
  if (file === "en.json") continue;
  const keys = new Set(flattenKeys(strings));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  if (missing.length > 0) {
    warn(`strings/${file}: missing ${missing.length} key(s) present in en.json, e.g. "${missing[0]}"`);
  }
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log(
  `Content OK: ${records.length} records, ${modules.modules.length} modules, ` +
    `${day.moments.length} day moments, ${profile.conclusions.length} profile conclusions, ` +
    `${stringFiles.length} language file(s).`
);
