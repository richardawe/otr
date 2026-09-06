# Privacy

On the record collects nothing, because it transmits nothing.

## The guarantee

- No accounts, no sign-in, no device identifiers sent anywhere.
- No analytics SDK, no crash reporter, no font CDN, no ad network.
- No network request of any kind, at any point — not on launch, not in the
  background, not to check for updates, not to load a font, not for
  telemetry.
- Anything you type (an action description, a settings change) stays in
  memory or in the device's local storage. It never leaves the device.

## How that's enforced, not just claimed

1. **Content Security Policy.** `index.html` sets
   `connect-src 'none'` (alongside a restrictive `default-src 'self'`),
   which blocks `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, and
   `sendBeacon` at the browser/webview level regardless of what the code
   tries to do. The Tauri desktop shell sets the same policy again in
   `src-tauri/tauri.conf.json`, independent of the webview's own CSP
   handling.
2. **Build-time scan.** `scripts/check-no-network.mjs` scans the built
   JavaScript, HTML, and CSS for `fetch(`, `XMLHttpRequest`, `new WebSocket`,
   `sendBeacon`, and `new EventSource`, and fails the build if any appear.
   This runs in CI on every push (`.github/workflows/ci.yml`).
3. **Zero network-capable runtime dependencies.** The only runtime
   dependencies are React and the two native wrappers (Capacitor, Tauri).
   Fonts are bundled as local build assets, not loaded from a font CDN.
4. **Native wrapper configuration.** The Capacitor config
   (`capacitor.config.ts`) sets no remote `server.url` — the app is the
   bundled `dist/` output, not a wrapped website. The Tauri capability file
   (`src-tauri/capabilities/default.json`) grants no filesystem, shell, or
   HTTP permissions beyond the default window core.

## What that means practically

Airplane mode changes nothing about how the app behaves, because the app was
never using the network in the first place. There is no server to have a
data breach, no account to compromise, no analytics dashboard anywhere
showing how the app is used, because none of that infrastructure exists.

## If you fork this

If you add a dependency, a feature, or a build flag that introduces a
network call — including "just" crash reporting or "just" an update
check — this guarantee no longer holds, and the CI check above will
correctly fail. That failure is the point: treat it as a design constraint,
not an obstacle to route around.
