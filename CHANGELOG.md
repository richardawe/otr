# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — Unreleased

### Added

- Full rebuild of the original static prototype as a cross-platform app:
  React + TypeScript + Vite core, wrapped by Capacitor (iOS/Android) and
  Tauri v2 (Windows desktop).
- Content architecture separated into `/content`: `records.json`,
  `modules.json`, `day.json`, `profile.json`, and per-language
  `strings/*.json` — no UI copy or corpus data hardcoded in `/src`.
- Corpus of 59 records across ten everyday contexts plus a device-present
  baseline, each carrying a `confidence` tier (`documented` / `reported` /
  `modelled`) and, where applicable, real verified sources.
- Five screens: One action, One day, Record detail, Evidence index, and
  Method, plus a Settings screen (language, text size, reduced motion, high
  contrast, educator mode).
- Educator mode: discussion prompts on each moment in the One day view,
  free-text entry hidden for group settings.
- Export of any result as PNG or PDF (dependency-free: SVG/Canvas
  rasterisation and the native print pipeline, respectively).
- Internationalisation framework that discovers `content/strings/*.json`
  automatically; shipped with English and a complete Arabic (RTL) example.
- Accessibility work targeting WCAG 2.2 AA: labelled controls, visible
  keyboard focus, full keyboard operation, `prefers-reduced-motion` support,
  a high-contrast mode, text scaling, and 44px minimum touch targets.
- No-network guarantee enforced three ways: a strict CSP
  (`connect-src 'none'`) in both the web shell and the Tauri config, a
  build-time scan for `fetch`/`XMLHttpRequest`/`WebSocket`/etc. in the
  bundled output, and zero network-capable runtime dependencies.
- CI (`.github/workflows/ci.yml`): type-check and build, content schema
  validation, the no-network scan, an axe-core accessibility audit, and
  build jobs for the Windows `.msi`, an Android debug APK, and an iOS
  simulator build.
- Dual licensing: MIT for everything outside `/content`, CC BY-NC-SA 4.0 for
  the corpus and strings — see `LICENSING.md`.
- `README.md`, `METHOD.md`, `PRIVACY.md`, `CONTRIBUTING.md`, `LICENSING.md`.

### Changed

- The original dependency-free static prototype (`index.html`, `app.js`,
  `styles.css`) is preserved under `/legacy-static` for reference; it is no
  longer the maintained implementation.
