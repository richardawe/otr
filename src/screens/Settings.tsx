import { useId } from "react";
import { useI18n } from "../i18n";
import { useSettings } from "../state/settings";
import type { TextSize } from "../types";

const TEXT_SIZES: TextSize[] = ["small", "default", "large", "xlarge"];
const TEXT_SIZE_KEY: Record<TextSize, string> = {
  small: "settings.textSizeSmall",
  default: "settings.textSizeDefault",
  large: "settings.textSizeLarge",
  xlarge: "settings.textSizeXLarge"
};

function Toggle({
  id,
  checked,
  onChange,
  heading,
  body
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  heading: string;
  body: string;
}) {
  return (
    <div className="setting-row">
      <div>
        <label htmlFor={id} className="setting-heading">
          {heading}
        </label>
        <p className="muted">{body}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`switch${checked ? " on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-knob" aria-hidden="true" />
      </button>
    </div>
  );
}

export function Settings() {
  const { t, language, languages, setLanguage } = useI18n();
  const {
    textSize,
    setTextSize,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    educatorMode,
    setEducatorMode
  } = useSettings();
  const langId = useId();
  const sizeGroupId = useId();

  return (
    <section id="panel-settings" role="tabpanel" aria-labelledby="tab-settings" tabIndex={-1}>
      <h1 className="display small">{t("settings.title")}</h1>

      <section className="method-section">
        <h2 id={langId}>{t("settings.languageHeading")}</h2>
        <div className="controls" role="group" aria-labelledby={langId}>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={language === l.code ? "btn" : "ghost"}
              aria-pressed={language === l.code}
              onClick={() => setLanguage(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="method-section">
        <h2 id={sizeGroupId}>{t("settings.textSizeHeading")}</h2>
        <div className="controls" role="group" aria-labelledby={sizeGroupId}>
          {TEXT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={textSize === size ? "btn" : "ghost"}
              aria-pressed={textSize === size}
              onClick={() => setTextSize(size)}
            >
              {t(TEXT_SIZE_KEY[size])}
            </button>
          ))}
        </div>
      </section>

      <section className="method-section">
        <Toggle
          id="toggle-reduced-motion"
          checked={reducedMotion}
          onChange={setReducedMotion}
          heading={t("settings.reducedMotionHeading")}
          body={t("settings.reducedMotionBody")}
        />
        <Toggle
          id="toggle-high-contrast"
          checked={highContrast}
          onChange={setHighContrast}
          heading={t("settings.highContrastHeading")}
          body={t("settings.highContrastBody")}
        />
        <Toggle
          id="toggle-educator-mode"
          checked={educatorMode}
          onChange={setEducatorMode}
          heading={t("settings.educatorHeading")}
          body={t("settings.educatorBody")}
        />
      </section>

      <section className="method-section">
        <h2>{t("settings.privacyHeading")}</h2>
        <p className="muted">{t("settings.privacyBody")}</p>
      </section>
    </section>
  );
}
