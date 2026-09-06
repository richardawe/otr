import { useI18n } from "../i18n";
import type { Confidence } from "../types";

export function ConfidenceTag({ confidence }: { confidence: Confidence }) {
  const { t } = useI18n();
  return (
    <span className={`confidence confidence-${confidence}`} title={t(`confidence.${confidence}.gloss`)}>
      {t(`confidence.${confidence}.label`)}
    </span>
  );
}
