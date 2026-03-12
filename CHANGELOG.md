# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

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

[Unreleased]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Aqu1tain/stremio-horizon/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Aqu1tain/stremio-horizon/releases/tag/v0.1.1
