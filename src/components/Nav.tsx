import { useI18n } from "../i18n";
import type { View } from "../types";

const VIEWS: View[] = ["action", "day", "evidence", "method", "settings"];

const LABEL_KEY: Record<View, string> = {
  action: "nav.oneAction",
  day: "nav.oneDay",
  evidence: "nav.evidence",
  method: "nav.method",
  settings: "nav.settings"
};

export function Nav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const { t } = useI18n();

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + VIEWS.length) % VIEWS.length;
    onChange(VIEWS[next]);
    (document.getElementById(`tab-${VIEWS[next]}`) as HTMLElement | null)?.focus();
  };

  return (
    <nav className="tabs" role="tablist" aria-label={t("app.name")}>
      {VIEWS.map((v, i) => (
        <button
          key={v}
          id={`tab-${v}`}
          role="tab"
          type="button"
          aria-selected={view === v}
          aria-controls={`panel-${v}`}
          tabIndex={view === v ? 0 : -1}
          className="tab"
          onClick={() => onChange(v)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t(LABEL_KEY[v])}
        </button>
      ))}
    </nav>
  );
}
