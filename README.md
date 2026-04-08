# hugo-theme-skills

[![Minimum Hugo Version](https://img.shields.io/static/v1?label=min-HUGO-version&message=%3E%3Dv0.115.0&color=blue&logo=hugo)](https://github.com/gohugoio/hugo/releases/tag/v0.115.0)
[![License](https://img.shields.io/github/license/debuginn/hugo-theme-skills)](https://github.com/debuginn/hugo-theme-skills/blob/main/LICENSE)
[![ExampleSite](https://img.shields.io/badge/exampleSite-included-2b7bff)](./exampleSite)
[![Multilingual](https://img.shields.io/badge/i18n-supported-1f9d55)](#i18n)

[中文文档](./README.zh.md)

Skills is a Hugo theme for interactive tool & skill portal sites with a terminal/CLI aesthetic:

- a portal homepage with animated hero and tool card grid
- card flip UX for skill install instructions
- Canvas-based interactive tools (poster generator, blog cover generator)
- multilingual routing (EN / ZH)
- dark mode with flash-prevention

## Requirements

- Hugo `>= 0.115.0` (extended recommended for SCSS if customizing)
- A Hugo site that provides its own content, `i18n/`, and configuration

## Install

Add the theme to your site:

```bash
git submodule add https://github.com/debuginn/hugo-theme-skills themes/hugo-theme-skills
```

Then enable it in your site config:

```toml
theme = "hugo-theme-skills"
```

Run the bundled example site locally from the theme repository:

```bash
cd exampleSite && hugo server
```

## Quick Start

Minimum working structure in the consuming site:

```text
content/
  tools/
    my-tool.md
  zh/
    tools/
      my-tool.md
i18n/
  en.toml
  zh.toml
static/
  img/
    logo.png
hugo.toml
```

Example `hugo.toml`:

```toml
baseURL = "https://example.com/"
title = "My Skills & Tools"
theme = "hugo-theme-skills"
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false

[languages]
  [languages.en]
    languageName = "English"
    languageCode = "en"
    weight = 1
    contentDir = "content"
    title = "My Skills & Tools"
    [languages.en.params]
      langHref = "/"
      langLabel = "EN"
      siteDescription = "A portal for my tools and skills."
  [languages.zh]
    languageName = "中文"
    languageCode = "zh-CN"
    weight = 2
    contentDir = "content/zh"
    title = "我的工具站"
    [languages.zh.params]
      langHref = "/zh/"
      langLabel = "中文"
      siteDescription = "我的工具与技能门户。"

[params]
  brandName = "YourBrand"
  logoImage = "/img/logo.png"
  ogImage = "/img/logo.png"
  blogURL = "https://your-blog.com/"
  githubURL = "https://github.com/yourname"
  copyright = "Open source, freely shared."
  installCmd = "/plugin marketplace add yourname/skills"
```

Example tool front matter (`content/tools/my-tool.md`):

```yaml
---
title: "My Tool"
slug: "my-tool"
desc: "One-line description shown on the card."
toolType: "wx-xhs-poster"
toolCSS: "/css/wx-xhs-poster.css"
toolJS: "/js/wx-xhs-poster.js"
installCode: |
  /plugin install my-tool
buttons: ["open", "install"]
githubRepo: "https://github.com/yourname/repo"
tags: ["Poster", "Canvas"]
weight: 1
---

Full description shown on the tool page.
```

## Content Model

Tools live in the `tools` section. Front matter keys:

| Key | Purpose |
|-----|---------|
| `toolType` | Selects which controls partial and canvas assets to load (`wx-xhs-poster`, `blog-cover`) |
| `toolCSS` / `toolJS` | Per-tool static asset paths |
| `installCode` | If present, enables card flip and back-face install block |
| `buttons` | Array controlling which buttons appear on the card. Values: `"open"`, `"install"`. Defaults to `["open"]` (plus `"install"` when `installCode` is set). Use `["install"]` for skill-only cards with no tool page. |
| `openLabel` | Custom label for the open button; defaults to `"$ OpenTool"` |
| `githubRepo` | GitHub URL; renders a circular GitHub icon link at the bottom-right of the card |
| `tags` | Tag array for categorization |
| `cardIcon` | Custom inline SVG icon; falls back to a type-based icon |

## i18n

Skills expects translation files in `i18n/<lang>.toml`.

Two languages are supported out of the box:

- `en` (default, served at `/`)
- `zh` (served at `/zh/`)

Content lives in separate directories per language:

- `content/tools/` → English
- `content/zh/tools/` → Chinese

Minimum English `i18n/en.toml`:

```toml
[hero_title_prefix]
other = "Hugo"

[hero_title_accent]
other = "Theme Skills"

[hero_desc]
other = "A lightweight, clean, and elegant Hugo theme for showcasing skills and tools."

[nav_tools]
other = "Tools"

[open_tool]
other = "$ open tool"

[install_skill]
other = "Install Skill"
```

The theme ships 189 i18n keys. See [`i18n/en.toml`](./i18n/en.toml) and [`i18n/zh.toml`](./i18n/zh.toml) for the full list.

The language switcher in the header and footer navigates using `data-lang-href` / `data-footer-lang-href` attributes, preserving the current page path.

## Parameters

### `params`

| Key | Purpose |
|-----|---------|
| `brandName` | Brand name shown in the header and footer |
| `logoImage` | Logo image path |
| `ogImage` | Open Graph fallback image path |
| `twitterHandle` | Twitter/X handle for SEO meta tags |
| `blogURL` | External blog link in the nav |
| `githubURL` | GitHub profile link |
| `twitterURL` | Twitter/X profile link |
| `telegramURL` | Telegram link |
| `wechatQR` | WeChat QR code image path |
| `copyright` | Copyright line in the footer |
| `installCmd` | Install command shown in the hero block |

### `languages.<lang>.params`

| Key | Purpose |
|-----|---------|
| `langHref` | Root path for this language (`/` or `/zh/`) |
| `langLabel` | Label shown in the language switcher |
| `brandName` | Language-specific brand name override |
| `siteDescription` | Meta description for this language |

## Layout Flow

```
baseof.html          ← head, font preloads, theme-flash prevention IIFE
  header.html        ← sticky nav, language dropdown, theme toggle
  index.html         ← hero + animated orbits + tool card grid
  tools/single.html  ← split layout: left controls panel + right canvas preview
  footer.html        ← brand info, language selector
```

Tool controls are injected via partials:

- `partials/tool-controls-wx-xhs-poster.html`
- `partials/tool-controls-blog-cover.html`

## Notes

- No build pipeline and no Node.js dependencies — pure Hugo with vanilla JS and CSS.
- Theme preference is stored in `localStorage` under `debuginn_tools_theme` and applied via a blocking IIFE to prevent flash.
- Canvas tool state is persisted to `localStorage` per tool type.
- Google Fonts are not used; the theme uses system fonts by default.
- A runnable demo lives in `exampleSite/`.

## Included

- `layouts/`
- `static/css/portal.css`
- `static/css/wx-xhs-poster.css`
- `static/css/blog-cover.css`
- `static/js/portal.js`
- `static/js/wx-xhs-poster.js`
- `static/js/blog-cover.js`
- `i18n/en.toml`
- `i18n/zh.toml`
