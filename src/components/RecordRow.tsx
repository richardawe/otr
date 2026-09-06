import { useI18n } from "../i18n";
import { Marker } from "./Marker";
import { ConfidenceTag } from "./ConfidenceTag";
import type { Record_ } from "../types";

interface RecordRowProps {
  record: Record_;
  onOpen: (record: Record_) => void;
  count?: number;
  countLabel?: string;
  holderLabel?: string;
  delayMs?: number;
}

export function RecordRow({ record, onOpen, count, countLabel, holderLabel, delayMs }: RecordRowProps) {
  const { t } = useI18n();
  const kindLabel = t(`kinds.${record.kind}.label`);
  const confidenceLabel = t(`confidence.${record.confidence}.label`);
  const holder = holderLabel ?? record.holder_examples?.[0] ?? record.holder_type.replace(/_/g, " ");

  const countText = count !== undefined ? countLabel ?? count.toLocaleString() : null;
  const accessibleName = [countText, kindLabel, record.datum, holder, confidenceLabel]
    .filter(Boolean)
    .join(" — ");

  return (
    <button
      type="button"
      className={`row row-${record.kind}`}
      style={delayMs ? { animationDelay: `${Math.min(delayMs, 600)}ms` } : undefined}
      onClick={() => onOpen(record)}
      aria-label={accessibleName}
    >
      {count !== undefined ? (
        <span className={`count${record.kind === "inferred" ? " infer" : ""}`} aria-hidden="true">
          {countLabel ?? count.toLocaleString()}
        </span>
      ) : (
        <Marker kind={record.kind} />
      )}
      <span className="row-body">
        <span className={`datum${record.kind === "inferred" ? " infer" : ""}`}>{record.datum}</span>
        <ConfidenceTag confidence={record.confidence} />
      </span>
      <span className="holder" aria-hidden="true">
        {holder}
      </span>
    </button>
  );
}
