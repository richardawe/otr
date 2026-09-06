#!/usr/bin/env node
// Boots the built app with `vite preview` and runs the axe-core CLI against
// it, then tears the server down. Kept as a small script rather than adding
// an orchestration dependency (start-server-and-test, etc.) — this is CI/dev
// tooling only and never ships in the app bundle.

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

const PORT = 4173;
const URL = `http://localhost:${PORT}`;

// CI and most dev machines resolve a system Chrome/Chromium automatically.
// This sandbox only has the Playwright-managed browser, so point axe at it
// explicitly when nothing else is set.
function findChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidate = process.env.PLAYWRIGHT_CHROME_PATH;
  if (candidate && existsSync(candidate)) return candidate;
  const glob = "/opt/pw-browsers";
  if (existsSync(glob)) {
    try {
      const dirs = readdirSync(glob).filter((d) => d.startsWith("chromium-"));
      for (const d of dirs) {
        const p = `${glob}/${d}/chrome-linux/chrome`;
        if (existsSync(p)) return p;
      }
    } catch {
      // fall through to undefined — let axe resolve its own default
    }
  }
  return undefined;
}
const chromePath = findChromePath();

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) reject(new Error("Preview server did not start in time"));
          else setTimeout(attempt, 400);
        });
    };
    attempt();
  });
}

const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: "inherit"
});

let exitCode = 1;
try {
  await waitForServer(URL);
  const axeArgs = ["--yes", "@axe-core/cli", URL, "--exit", "--tags", "wcag2a,wcag2aa,wcag22aa"];
  if (chromePath) axeArgs.push("--chrome-path", chromePath);
  // Running as root in a container: Chrome refuses its default sandbox in
  // that setup unless it's disabled explicitly.
  if (process.getuid && process.getuid() === 0) {
    axeArgs.push("--chrome-options", "no-sandbox,disable-dev-shm-usage,disable-gpu");
  }
  exitCode = await new Promise((resolve) => {
    const axe = spawn("npx", axeArgs, { stdio: "inherit" });
    axe.on("close", (code) => resolve(code ?? 1));
  });
} finally {
  preview.kill();
}

process.exit(exitCode);
