import { useId, useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { composeAction, type ActionResult } from "../lib/match";
import { RecordRow } from "../components/RecordRow";
import { RecordDetail } from "../components/RecordDetail";
import { exportNodeAsPdf, exportNodeAsPng } from "../lib/export";
import type { Kind, Record_ } from "../types";
import { useSettings } from "../state/settings";

const KINDS: Kind[] = ["emitted", "inferred", "relational"];

export function OneAction() {
  const { t, list } = useI18n();
  const { educatorMode } = useSettings();
  const inputId = useId();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [openRecord, setOpenRecord] = useState<Record_ | null>(null);
  const examples = list("oneAction.examples");

  const run = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setResult(composeAction(trimmed));
  };

  const grouped = useMemo(() => {
    if (!result) return null;
    return KINDS.map((kind) => ({
      kind,
      items: result.records.filter((r) => r.kind === kind)
    })).filter((g) => g.items.length > 0);
  }, [result]);

  const total = result?.records.length ?? 0;
  const neverGave = result ? result.records.filter((r) => r.kind !== "emitted").length : 0;

  return (
    <section id="panel-action" role="tabpanel" aria-labelledby="tab-action" tabIndex={-1}>
      {educatorMode ? (
        <p className="notice">{t("educator.groupModeNotice")}</p>
      ) : (
        <>
          <h1 className="display">{t("oneAction.title")}</h1>

          <div className="entry">
            <label htmlFor={inputId} className="sr-only">
              {t("oneAction.inputLabel")}
            </label>
            <input
              id={inputId}
              className="entry-input"
              type="text"
              value={text}
              placeholder={t("oneAction.placeholder")}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") run(text);
              }}
            />
          </div>

          <div className="controls">
            <button type="button" className="btn" disabled={!text.trim()} onClick={() => run(text)}>
              {t("oneAction.submit")}
            </button>
          </div>
          <div className="controls" role="group" aria-label={t("oneAction.examplesLabel")}>
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                className="ghost"
                onClick={() => {
                  setText(ex);
                  run(ex);
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </>
      )}

      <div id="action-out" aria-live="polite">
        {result && (
          <div id="action-export-root">
            <div className="summary">
              <span>{result.act}</span>
              <span className="right">
                {t("oneAction.summaryRecords", { count: total })} ·{" "}
                {t("oneAction.summaryNeverGave", { count: neverGave })}
              </span>
            </div>

            {result.matchedModules === 0 && <p className="nomatch">{t("oneAction.noMatch")}</p>}

            {grouped?.map(({ kind, items }) => (
              <section className="group" key={kind}>
                <div className="group-head">
                  <h2 className={kind === "inferred" ? "infer" : undefined}>
                    {t(`kinds.${kind}.label`)}
                  </h2>
                  <span className="gloss">
                    {items.length} · {t(`kinds.${kind}.gloss`)}
                  </span>
                </div>
                {items.map((record, idx) => (
                  <RecordRow
                    key={record.id}
                    record={record}
                    onOpen={setOpenRecord}
                    delayMs={idx * 45}
                  />
                ))}
              </section>
            ))}

            <p className="reading">{t("oneAction.reading")}</p>

            <div className="unrecorded">
              <div className="head">{t("oneAction.unrecordedHeading")}</div>
              {list("oneAction.unrecorded").map((u) => (
                <div className="item" key={u}>
                  {u}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="controls export-controls">
          <button
            type="button"
            className="ghost"
            onClick={() => exportNodeAsPng("action-export-root", "on-the-record.png")}
          >
            {t("export.asPng")}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => exportNodeAsPdf("action-export-root", "on-the-record.pdf")}
          >
            {t("export.asPdf")}
          </button>
        </div>
      )}

      {openRecord && <RecordDetail record={openRecord} onClose={() => setOpenRecord(null)} />}
    </section>
  );
}
