import recordsJson from "../content/records.json";
import modulesJson from "../content/modules.json";
import dayJson from "../content/day.json";
import profileJson from "../content/profile.json";
import type { Record_, ModulesFile, DayFile, ProfileFile } from "./types";

export const records = recordsJson as Record_[];
export const modulesFile = modulesJson as ModulesFile;
export const dayFile = dayJson as DayFile;
export const profileFile = profileJson as ProfileFile;

const byId = new Map(records.map((r) => [r.id, r]));

export function getRecord(id: string): Record_ {
  const r = byId.get(id);
  if (!r) throw new Error(`Unknown record id: ${id}`);
  return r;
}

export function getRecords(ids: string[]): Record_[] {
  return ids.map(getRecord);
}
