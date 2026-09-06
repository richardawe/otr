import { useI18n } from "../i18n";
import { ConfidenceTag } from "../components/ConfidenceTag";

export function Method() {
  const { t } = useI18n();

  return (
    <section id="panel-method" role="tabpanel" aria-labelledby="tab-method" tabIndex={-1}>
      <h1 className="display small">{t("method.title")}</h1>

      <section className="method-section">
        <h2>{t("method.corpusHeading")}</h2>
        <p>{t("method.corpusBody")}</p>
      </section>

      <section className="method-section">
        <h2>{t("method.confidenceHeading")}</h2>
        <p>
          <ConfidenceTag confidence="documented" /> — {t("method.confidenceDocumented")}
        </p>
        <p>
          <ConfidenceTag confidence="reported" /> — {t("method.confidenceReported")}
        </p>
        <p>
          <ConfidenceTag confidence="modelled" /> — {t("method.confidenceModelled")}
        </p>
      </section>

      <section className="method-section">
        <h2>{t("method.limitsHeading")}</h2>
        <p>{t("method.limitsBody")}</p>
      </section>

      <section className="method-section">
        <h2>{t("method.inferenceHeading")}</h2>
        <p>{t("method.inferenceBody")}</p>
      </section>

      <section className="method-section">
        <h2>{t("method.contributeHeading")}</h2>
        <p>{t("method.contributeBody")}</p>
      </section>
    </section>
  );
}
