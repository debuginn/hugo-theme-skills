# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands run from `exampleSite/`:

```bash
cd exampleSite && hugo server          # Start dev server at localhost:1313
cd exampleSite && hugo server -D       # Include draft content
cd exampleSite && hugo                 # Build static output to exampleSite/public/
```

No build pipeline, no Node.js dependencies — pure Hugo + vanilla JS/CSS.

## Architecture Overview

This is a Hugo theme (`hugo-theme-skills`) for hosting interactive Canvas-based tool portals with a terminal/CLI aesthetic. Minimum Hugo version: 0.115.0.

### Content Model

Tools live in the `tools` section. Front matter keys that drive behavior:

| Key | Purpose |
|-----|---------|
| `toolType` | Selects which controls partial and canvas JS/CSS to load (`wx-xhs-poster`, `blog-cover`) |
| `toolCSS` / `toolJS` | Per-tool static asset paths |
| `installCode` | If present, enables card flip and install modal |
| `cardPath` | Terminal-style path shown on the card (e.g. `$ pwd: ~/tools/…`) |
| `tags` | Tag array for categorization |
| `cardIcon` | Custom SVG icon; falls back to type-based icon |

### Layout Flow

```
baseof.html          ← head, font preloads, theme-flash prevention IIFE
  header.html        ← sticky nav, language dropdown, theme toggle
  index.html         ← hero + animated orbits + tool card grid (portal view)
  tools/single.html  ← split layout: left controls panel + right canvas preview
  footer.html        ← brand info, language selector
```

Tool controls are injected via partials:
- `partials/tool-controls-wx-xhs-poster.html`
- `partials/tool-controls-blog-cover.html`

### JavaScript Architecture

No frameworks. Three files in `static/js/`:

- **portal.js** — theme switching (`localStorage` key: `debuginn_tools_theme`), language dropdowns, mobile menu, card flip, install modal, copy-to-clipboard
- **wx-xhs-poster.js** — Canvas 2D poster generator; state persisted to `debuginn_wx_xhs_poster_state`
- **blog-cover.js** — Canvas 2D blog cover generator; state persisted to `debuginn_blog_cover_state`

Theme is stored as `data-theme` attribute on `<html>`. A blocking IIFE in `baseof.html` applies the theme before render to prevent flash.

### CSS Architecture

Three files in `static/css/`, each scoped to its domain:

- **portal.css** — full theme; CSS variables under `:root` / `:root[data-theme="dark"]`; components include topbar, hero orbits, card flip (CSS 3D), modals, responsive breakpoints (960px)
- **wx-xhs-poster.css** — poster tool panels, scheme grids, color picker modal
- **blog-cover.css** — blog cover tool panels, color swatches, range sliders

### Multilingual Setup

Two languages: `en` (default, no subdir) and `zh` (at `/zh/`). Content lives in:
- `exampleSite/content/tools/` → English
- `exampleSite/content/zh/tools/` → Chinese

Translation strings: `i18n/en.toml` and `i18n/zh.toml` (189 keys). Template usage: `{{ i18n "key" }}`.

The language switcher in header/footer navigates using `data-lang-href` / `data-footer-lang-href` attributes bound by `portal.js`, preserving the current page path.
