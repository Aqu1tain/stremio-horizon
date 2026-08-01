# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

## [0.1.7] - 2026-08-01

### Added

- Native-only Downloads page with content-first cards, local artwork, progress, pause, resume,
  deletion and offline playback through the existing Horizon player
- Download actions in stream context menus and player options
- One-click episode downloads that resolve addon streams in place and save the first downloadable source
- Netflix-style Continue Watching tiles with landscape movie artwork, current episode thumbnails and
  season/episode labels
- Direct playback of the first available stream from the home hero, with a separate action for details
- Mouse controls for horizontal catalogue rows, hidden automatically at either scroll boundary
- Opt-in Discord Rich Presence in Horizon Desktop with title, artwork, playback state and timeline

### Changed

- Redesigned download cards around artwork and content, with compact status, source, progress and actions
- Group series downloads by season and episode, and group multiple sources as versions of the same title
- Replace the old technical segmented-HLS failure with a localized retry prompt
- Redesigned the home browsing experience around landscape Continue Watching cards and clearer hero actions
- Apply the external hover zoom and white focus border consistently without clipping menus or changing
  corner radii
- Translate the Discord and automatic-update settings in French

### Fixed

- Hide the web-only streaming service installation warning in Horizon Desktop, where the bundled service is managed by the native shell
- Route offline files through the bundled streaming service so unsupported containers and codecs are transcoded for the WebView, even when the core reports a stale server error
- Ask the desktop shell for a direct offline file URL before playback so MP4 seeks do not pass through the local HTTP bridge
- Avoid sending an offline HLS stream through the streaming server a second time before handing it to the player
- Keep simultaneous downloads stable through a queue instead of allowing concurrent transfers to fail or
  reorder continuously
- Align episode watched badges with their download and playback actions
- Keep classic poster borders around the artwork only, while Continue Watching borders remain above the
  title gradient

## [0.1.6] - 2026-07-31

### Added

- Persistent stream loading placeholders that identify which addons are still responding
- Contextual route skeletons that preserve navigation while pages, details and the player load

### Changed

- Redesigned login and registration flow with a focused card, clearer tabs and actions, native
  form semantics, improved keyboard accessibility and visible authentication errors

### Fixed

- Recover once automatically when an application update leaves a stale lazy-loaded chunk in the
  browser cache, then offer explicit Retry and Home recovery actions
- Movie and series details now show their skeleton immediately instead of an empty dark area while
  metadata is loading
- AllDebrid playback failures now explain when the current IP or VPN is not authorized

## [0.1.5] - 2026-07-31

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
- Settings menu no longer draws an accent border on the selected item
- Bump the stremio-translations fork to upstream 1.53.2, keeping Horizon's own keys and the
  "Stremio Horizon" updater branding, so the Discord toggle and the new Picture-in-Picture
  labels are translated rather than falling back to English

### Fixed

- Picture-in-Picture scrubber and skip controls, by publishing media session position state and
  seek handlers; intermediate `fastSeek` events are ignored so dragging the scrubber is not fought
  by the position updates
- Fullscreen state now also tracks webkit-prefixed fullscreen changes, so Safari does not leave the
  toggle stale after leaving fullscreen
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

[Unreleased]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.7...HEAD
[0.1.7]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Aqu1tain/stremio-horizon/releases/tag/v0.1.1
