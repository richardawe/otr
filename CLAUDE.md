# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm install
npm run dev             # web dev server, http://localhost:5173
npm run build           # tsc -b && vite build -> dist/
npm run typecheck       # tsc -b --noEmit
npm run validate:content  # schema + cross-reference check on /content
npm run check:no-network  # scans dist/ for fetch/XHR/WebSocket/etc.
npm test                # validate:content + check:no-network
npm run a11y            # builds nothing itself — run `npm run build` first,
                         # then boots `vite preview` and runs axe-core against it
npm run cap:sync        # npx cap sync (after npm run build)
npx cap add ios|android # generates ios/ and android/ (not committed — see .gitignore)
npx tauri dev            # Tauri desktop dev window
npx tauri build --bundles msi
node scripts/generate-placeholder-icons.mjs  # regenerates src-tauri/icons/ + resources/icon.png
```

There is no unit test suite/runner (no vitest/jest). "Tests" here means the
two content/build validators above (`npm test`), both of which are plain
Node scripts under `scripts/` with zero dependencies — read them directly
rather than assuming a framework.

## Architecture

**Single web core, three native shells.** `/src` is a plain React + TS +
Vite app with no router and no state-management library — `App.tsx` switches
between five screens by local `useState<View>`, not a route table. Capacitor
(`capacitor.config.ts`) wraps the built `dist/` for iOS/Android; Tauri v2
(`src-tauri/`) wraps it for Windows desktop. Neither wrapper is granted any
filesystem/shell/HTTP permission beyond opening the window — see
`src-tauri/capabilities/default.json`.

**Content lives entirely outside `/src`, in `/content`, and is dual-licensed
separately (CC BY-NC-SA 4.0 vs. MIT for the rest of the repo — see
`LICENSING.md`).** `/src` imports these JSON files directly
(`resolveJsonModule`) via `src/content.ts`, which is the only module that
touches raw content shape; everything else imports typed accessors
(`getRecord`, `getRecords`) from there. The four content files interlock by
record `id` (dotted strings like `transit.card.tap`):

- `records.json` — the corpus. Each record has a `kind`
  (`emitted`/`inferred`/`relational` — this is the product's core argument,
  never flatten it) and a `confidence` tier (`documented`/`reported`/
  `modelled`). **The one hard rule enforced by `scripts/validate-content.mjs`:
  a `documented` or `reported` record must have a non-empty `sources` array;
  a `modelled` record must not have an invented one.** The validator can only
  catch an empty list, not a fake URL — treat adding a fabricated citation as
  a correctness bug, not a style issue. See `METHOD.md` for the full rationale.
- `modules.json` — keyword → record-id lists consumed by `src/lib/match.ts`
  for the "One action" free-text screen.
- `day.json` — the "One day" composite: an ordered list of `moments`, each
  with `entries` pairing a record id with a `count` and a `count_basis`
  string, plus an optional `prompt` string shown only in educator mode.
- `profile.json` — the end-of-day conclusions panel, each entry pointing
  back at a record id.
- `strings/*.json` — every UI string, one file per language.
  `src/i18n/index.tsx` discovers language files automatically via
  `import.meta.glob("../../content/strings/*.json")` — **adding a language
  is dropping in a file, not touching code.** `meta.dir` on each file drives
  the RTL layout switch (`document.documentElement.dir`); `strings/ar.json`
  is the working RTL reference. String interpolation goes through the
  hand-rolled ICU subset in `src/i18n/format.ts` (plain `{name}` plus
  `{name, plural, one {...} other {...}}` — nothing else is supported).

**No-network guarantee is enforced three separate, independent ways**, not
just asserted: the CSP in `index.html` (`connect-src 'none'`, mirrored in
`src-tauri/tauri.conf.json`), the build-time regex scan in
`scripts/check-no-network.mjs` (run in CI on every push), and keeping actual
runtime dependencies at just React + the two native wrappers (Vite's
fetch-based `modulePreload` is explicitly disabled in `vite.config.ts`
because it would otherwise trip the scanner). If you add a dependency or
feature that reaches the network, this is a regression, not a tradeoff to
wave through.

**Design tokens are contrast-checked, not just chosen for looks**
(`src/styles/tokens.css`). Two of the spec's named colors fail WCAG AA at
face value against the paper background — the "obvious" muted grey
(`#6b7069`, 3.6:1) and the brand magenta (`#c6006f`, 4.14:1) — so the tokens
actually shipped are darkened variants (`--muted`, `--infer-text`) used
wherever the color labels *text*, while the original tones (`--infer`,
plain `--rule`) remain for non-text marks (markers, chart ticks, dividers)
where the 3:1 non-text threshold is enough. Don't casually swap these back
to the spec's literal hex values for text use.

**Record rows are buttons, not divs with click handlers**
(`src/components/RecordRow.tsx`): the accessible name is built from
count + kind + datum + holder + confidence so a screen reader gets the same
information sighted users get from the marker/color/badge, and opening
`RecordDetail` traps focus and restores it to the triggering row on close.

**Export has zero added dependencies** (`src/lib/export.ts`): PNG export
serializes the target node into an SVG `<foreignObject>` (with all page
stylesheets inlined via the CSSOM, not fetched) and rasterizes through
`<canvas>`; PDF export uses the browser/webview's native print pipeline via
a `.print-target` class and `@media print` rules in `app.css`. Both are
best-effort by nature of the approach — don't assume pixel-perfect fidelity
without checking a real render first.
