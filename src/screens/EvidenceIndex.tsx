import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { records } from "../content";
import { RecordDetail } from "../components/RecordDetail";
import type { Record_, Source, SourceType } from "../types";

const TYPE_ORDER: SourceType[] = [
  "regulatory",
  "litigation",
  "journalism",
  "academic",
  "policy",
  "vendor_doc"
];

const TYPE_KEY: Record<SourceType, string> = {
  regulatory: "evidenceIndex.typeRegulatory",
  litigation: "evidenceIndex.typeLitigation",
  journalism: "evidenceIndex.typeJournalism",
  academic: "evidenceIndex.typeAcademic",
  policy: "evidenceIndex.typePolicy",
  vendor_doc: "evidenceIndex.typeVendorDoc"
};

interface IndexedSource {
  source: Source;
  citedBy: Record_[];
}

export function EvidenceIndex() {
  const { t } = useI18n();
  const [openRecord, setOpenRecord] = useState<Record_ | null>(null);

  const byType = useMemo(() => {
    const map = new Map<SourceType, Map<string, IndexedSource>>();
    for (const type of TYPE_ORDER) map.set(type, new Map());
    for (const record of records) {
      for (const source of record.sources) {
        const bucket = map.get(source.type)!;
        const existing = bucket.get(source.url);
        if (existing) existing.citedBy.push(record);
        else bucket.set(source.url, { source, citedBy: [record] });
      }
    }
    return map;
  }, []);

  return (
    <section id="panel-evidence" role="tabpanel" aria-labelledby="tab-evidence" tabIndex={-1}>
      <h1 className="display small">{t("evidenceIndex.title")}</h1>
      <p className="split">{t("evidenceIndex.intro")}</p>

      {TYPE_ORDER.map((type) => {
        const entries = Array.from(byType.get(type)?.values() ?? []);
        return (
          <section className="group" key={type}>
            <div className="group-head">
              <h2>{t(TYPE_KEY[type])}</h2>
              <span className="gloss">{entries.length}</span>
            </div>
            {entries.length === 0 ? (
              <p className="muted">{t("evidenceIndex.empty")}</p>
            ) : (
              <ul className="source-list evidence-list">
                {entries.map(({ source, citedBy }) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </a>
                    <span className="muted">
                      {" "}
                      — {source.publisher}, {source.date}
                    </span>
                    <div className="cited-by">
                      {t("evidenceIndex.usedBy", { count: citedBy.length })}:{" "}
                      {citedBy.map((r, i) => (
                        <span key={r.id}>
                          {i > 0 && ", "}
                          <button type="button" className="link-button" onClick={() => setOpenRecord(r)}>
                            {r.datum}
                          </button>
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {openRecord && <RecordDetail record={openRecord} onClose={() => setOpenRecord(null)} />}
    </section>
  );
}
