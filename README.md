# Stremio Horizon

An alternative web UI for [Stremio](https://www.stremio.com), focused on modern design and usability.

Based on [Stremio Web 5](https://github.com/Stremio/stremio-web), but going in a different direction — rethinking navigation, layout, and visual identity while keeping full compatibility with the Stremio ecosystem and addons.

> **Early stage** — usable but not fully stable. Expect rough edges.

## What's different

### Navigation
- Horizontal top navbar with tabs (replaces the sidebar on desktop)
- Auto-hide navbar on scroll (Board and MetaDetails pages)
- Full-width search bar on dedicated search page
- Redesigned search history and suggestions dropdown

### Board
- Hero banner carousel with auto-rotation and crossfade transitions
- Horizontally scrolling catalog rows with redesigned cards

### MetaDetails
- Single-column hero layout with full-width background
- Tabbed navigation (Details / Videos / Streams)
- Play / Resume buttons with smart episode tracking
- Episode drill-down directly to streams
- See-more link on truncated descriptions

### Discover
- Slide-out preview panel (replaces the sidebar)

### Streams
- Quality badge parser (4K, HDR, Dolby, etc.)
- Filter chips to narrow results by quality
- Restyled stream popups

### Icons
- Migrated to [Lucide](https://lucide.dev) icons with automatic fallback to stremio-icons for brand/custom icons

### Visual polish
- Overlay borders replacing outer-glow shadows
- Consistent spacing and typography across pages
- Subtler background gradients
- Play button on hover for catalog items

## Build

### Prerequisites

* Node.js 12 or higher
* [pnpm](https://pnpm.io/installation) 10 or higher

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm start
```

### Production build

```bash
pnpm run build
```

### Run with Docker

```bash
docker build -t stremio-horizon .
docker run -p 8080:8080 stremio-horizon
```

## Credits

Based on [stremio-web](https://github.com/Stremio/stremio-web) by [Smart code](https://www.stremio.com). Original code is copyright 2017-2023 Smart code and available under the GPLv2 license. See the [LICENSE](/LICENSE.md) file for details.
