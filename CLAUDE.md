# Stremio Horizon

React frontend for Stremio. Uses webpack, LESS with CSS modules, CommonJS `require()` (not ES imports). JSX lives in `.js` files, newer components use `.tsx`.

## Dev commands

```bash
pnpm start          # dev server (skips Terser — won't catch minification bugs)
pnpm start-prod     # dev server with production config
pnpm build          # production build → build/
pnpm test           # jest
pnpm lint           # eslint
```

## Architecture

- `src/services/Core/` — WASM worker bridge to stremio-core-web
- `src/services/Shell/` — Tauri/Qt shell detection and IPC
- `src/routes/` — page components (Discover, Addons, Player, Settings, etc.)
- `src/common/` — shared hooks, constants, utilities
- Components use `@stremio/stremio-colors` LESS vars and CSS modules (hash:base64:5)
- Path alias: `stremio/*` → `src/*`
- Icons: `lucide-react` mapped in `Icon.tsx`

## Key patterns

- Modal: `ModalDialog` from `stremio/components`
- Binary state: `useBinaryState(false)` → `[value, on, off, toggle]`
- Services: `useServices()` → `{ chromecast, core, shell }`
- Tauri detection: `typeof window.__TAURI_INTERNALS__ !== 'undefined'`

## Build gotchas

- Terser must use `ecma: 2020` — ecma:5 breaks ES module interop at runtime
- Commit hash is embedded in output paths for cache busting
- Service worker (Workbox) precaches assets < 20MB
- `@stremio/stremio-core-web` runs in a Web Worker, not main thread

## Branch workflow

- Default branch: `development`
- PRs target `development` only; `main` merges come from `development`
- Branch protection enabled — no direct pushes
- Conventional commits, atomic changes
- Always update CHANGELOG.md when releasing
