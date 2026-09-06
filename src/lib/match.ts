import { modulesFile, getRecords } from "../content";
import type { Record_ } from "../types";

export interface ActionResult {
  act: string;
  matchedModules: number;
  records: Record_[];
}

export function composeAction(text: string): ActionResult {
  const low = text.toLowerCase();
  const hits = modulesFile.modules.filter((m) => m.keys.some((k) => low.includes(k)));

  const ids = [...modulesFile.baseline];
  for (const m of hits) ids.push(...m.records);

  const seen = new Set<string>();
  const dedupedIds = ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return {
    act: text.trim().replace(/\.$/, ""),
    matchedModules: hits.length,
    records: getRecords(dedupedIds)
  };
}
