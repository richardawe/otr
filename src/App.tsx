import { useEffect, useRef, useState } from "react";
import { useI18n } from "./i18n";
import { Nav } from "./components/Nav";
import { OneAction } from "./screens/OneAction";
import { OneDay } from "./screens/OneDay";
import { EvidenceIndex } from "./screens/EvidenceIndex";
import { Method } from "./screens/Method";
import { Settings } from "./screens/Settings";
import type { View } from "./types";

export function App() {
  const { t } = useI18n();
  const [view, setView] = useState<View>("action");
  const mainRef = useRef<HTMLDivElement>(null);
  const previousView = useRef<View | null>(null);

  useEffect(() => {
    if (previousView.current !== null && previousView.current !== view) {
      mainRef.current?.focus();
    }
    previousView.current = view;
  }, [view]);

  return (
    <main className="wrap">
      <a className="skip-link" href="#main-content">
        {t("nav.skipToContent")}
      </a>

      <div className="standing">
        <span>{t("app.standingLeft")}</span>
        <span>{t("app.standingRight")}</span>
      </div>

      <Nav view={view} onChange={setView} />

      <div id="main-content" ref={mainRef} tabIndex={-1}>
        {view === "action" && <OneAction />}
        {view === "day" && <OneDay />}
        {view === "evidence" && <EvidenceIndex />}
        {view === "method" && <Method />}
        {view === "settings" && <Settings />}
      </div>

      <p className="caveat">{t("app.caveat")}</p>
    </main>
  );
}
