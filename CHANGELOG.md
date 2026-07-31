# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Added

- Picture-in-Picture button in the player control bar, shown only when the active video
  implementation is an HTML video element
- Discord Rich Presence toggle in Settings (upstream)
- Play button on episode rows, jumping straight to the player (upstream)
- Cast device menu in the player, backed by the streaming server (upstream)

### Changed

- Merge upstream stremio-web v5.0.0-beta.37, v5.0.0-beta.38 and v5.0.0-beta.39
- Routing migrated to react-router with a HashRouter; the bespoke `stremio-router` is now a thin
  wrapper over it
- Core moved from a service to a `CoreProvider` context (`useCore()` replaces `useServices().core`);
  the dead-worker timeout and heartbeat now live in `src/core/createTransport.ts`
- Shell moved into `PlatformProvider` (`usePlatform().shell` replaces `useShell()`), keeping
  Horizon's Tauri guard so the Tauri build does not mistake WebView2 for a Stremio shell
- Player subtitle handling extracted upstream into `useSubtitles`, replacing Horizon's inline copy
- Node.js 22 and pnpm 11 are now required

### Fixed

- Silent audio after hls.js exhausts its retries, via a patch to `@stremio/stremio-video` that adds
  the missing `Hls.Events.ERROR` recovery listener (Stremio/stremio-video#142). Horizon's Tauri shell
  exposes no `shellTransport`, so all of its playback goes through `HTMLVideo` + hls.js and is exposed
  to this in a way the Qt shell is not
- Gamepad guide modal scrolling now uses upstream's flex layout instead of Horizon's overflow patch

## [0.1.4] - 2026-05-26

### Changed

- Merge upstream stremio-web v5.0.0-beta.36
- Bump stremio-translations fork to v1.52.0 (gamepad guide, magnet copy, playback speed strings)
- Code splitting with lazy route imports
- Avatar images converted from PNG to WebP

### Fixed

- Tauri updater banner now listens to native Tauri events instead of DOM events
- Updater install errors now surface as typed toast messages
- Detect dead core WASM worker via call timeout + heartbeat and surface a recovery toast instead of hanging forever
- Chromecast CastContext listeners not removed on cleanup
- Focus handler crash when transport is null
- Lithuanian ISO 639-2 code (ltu -> lit)

## [0.1.3] - 2026-03-12

### Added

- Version labels in Settings for Horizon, Core, App, Server and Build

### Changed

- Merge upstream stremio-web v5.0.0-beta.31

### Fixed

- Production build crash on Addons page caused by Terser ecma:5 downleveling
- CJS/ESM default export interop for useToast

## [0.1.2] - 2026-03-11

### Added

- Redesigned settings page with categories and glass-morphism cards
- Copy-to-clipboard button for build hash in settings
- Tauri auto-update support in UpdaterBanner

### Changed

- 18 common JS files converted to TypeScript

### Fixed

- Play button broken with upcoming/unreleased episodes

## [0.1.1] - 2026-02-09

### Added

- Initial fork of stremio-web v5.0.0-beta.30
- Hero banner carousel on Board page
- Horizontal top navbar with auto-hide on scroll
- Tabbed MetaDetails layout with episode drill-down
- Stream quality badge parser and filter chips
- Slide-out preview panel on Discover page
- Lucide icons with stremio-icons fallback
- Chromecast support (Chrome + Tauri native)

[Unreleased]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Aqu1tain/stremio-horizon/releases/tag/v0.1.1
