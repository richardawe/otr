import { useEffect, useRef } from "react";
import { useI18n } from "../i18n";
import { Marker } from "./Marker";
import { ConfidenceTag } from "./ConfidenceTag";
import type { Record_ } from "../types";

interface RecordDetailProps {
  record: Record_;
  onClose: () => void;
}

export function RecordDetail({ record, onClose }: RecordDetailProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal record-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-detail-heading"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="modal-marker">
            <Marker kind={record.kind} />
            <span>{t(`kinds.${record.kind}.label`)}</span>
          </span>
          <button type="button" className="ghost" ref={closeRef} onClick={onClose}>
            {t("recordDetail.close")}
          </button>
        </div>

        <h2 id="record-detail-heading" className="display small">
          {record.datum}
        </h2>
        <p className="gloss">{t(`kinds.${record.kind}.gloss`)}</p>

        <dl className="detail-list">
          <dt>{t("recordDetail.holderHeading")}</dt>
          <dd>
            {record.holder_type.replace(/_/g, " ")}
            {record.holder_examples && record.holder_examples.length > 0 && (
              <span className="muted"> — {record.holder_examples.join(", ")}</span>
            )}
          </dd>

          <dt>{t("recordDetail.mechanismHeading")}</dt>
          <dd>{record.mechanism}</dd>

          {record.conditions.length > 0 && (
            <>
              <dt>{t("recordDetail.conditionsHeading")}</dt>
              <dd>
                <ul>
                  {record.conditions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {record.jurisdictions.length > 0 && (
            <>
              <dt>{t("recordDetail.jurisdictionsHeading")}</dt>
              <dd>{record.jurisdictions.join(", ")}</dd>
            </>
          )}

          <dt>{t("recordDetail.confidenceHeading")}</dt>
          <dd>
            <ConfidenceTag confidence={record.confidence} />
          </dd>

          <dt>{t("recordDetail.sourcesHeading")}</dt>
          <dd>
            {record.sources.length === 0 ? (
              <p className="muted">{t("recordDetail.noSources")}</p>
            ) : (
              <ul className="source-list">
                {record.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                    <span className="muted">
                      {" "}
                      — {s.publisher}, {s.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </dl>
      </div>
    </div>
  );
}
