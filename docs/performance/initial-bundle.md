# Initial bundle report

Issue: [#40](https://github.com/Aqu1tain/stremio-horizon/issues/40)

The comparison uses the latest release before this work, `v0.1.8` (`742315f6c`), rather than the older `v0.1.5` snapshot mentioned when the issue was written. Both builds use the same Node, pnpm, lockfile, production webpack configuration, and compression settings.

## Initial JavaScript

Only same-origin scripts referenced by `build/index.html` are counted. Source maps, lazy routes, optional locale chunks, and the core WASM binary are excluded.

| Build | Raw | gzip | Brotli |
| --- | ---: | ---: | ---: |
| v0.1.8 | 8,937,433 B | 2,630,092 B | 1,332,984 B |
| Optimized | 1,042,569 B | 289,380 B | 236,297 B |
| Reduction | 88.3% | 89.0% | 82.3% |

The v0.1.8 total includes `worker.js` because HtmlWebpackPlugin injected both webpack entry points. The optimized page references only `main.js`; the core worker remains emitted and is created explicitly by `src/core/createTransport.ts`.

## Largest eager modules before

The production webpack profile identified two avoidable groups:

- Every JSON file from `stremio-translations` was included eagerly. The package contains roughly 5.9 MiB of locale JSON before minification.
- Importing named icons from the Lucide barrel retained its complete 1,677-icon module graph (roughly 1.5 MiB before minification).
- The legacy Stremio icon set added roughly 173 KiB before minification even when no legacy-only icon was visible.

## Changes

- `en-US` remains in the initial entry point; other locales are emitted as independent chunks and fetched when the interface language changes.
- Horizon-specific strings are merged into each locale after it is loaded.
- Lucide icons use direct per-icon modules.
- The legacy icon set is loaded only when a legacy-only icon is rendered.
- Optional locale and legacy-icon chunks use an on-demand runtime cache instead of being precached wholesale by the service worker.
- HtmlWebpackPlugin injects only the main entry point. The dedicated worker entry is still available at its existing URL.

## Guardrails

`pnpm bundle:check` measures the production files with raw, gzip level 9, and Brotli quality 11 compression. CI rejects changes above the limits in `bundle-size-budget.json` and verifies that Addons, MetaDetails, Player, and Settings still emit independent production chunks.

The core WASM payload is reported separately. It is currently 4,805,206 B and is not counted as JavaScript.
