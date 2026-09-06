import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { I18nProvider } from "./i18n";
import { SettingsProvider } from "./state/settings";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/app.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <StrictMode>
    <SettingsProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </SettingsProvider>
  </StrictMode>
);
