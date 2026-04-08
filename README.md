# hugo-theme-skills

[![Minimum Hugo Version](https://img.shields.io/static/v1?label=min-HUGO-version&message=%3E%3Dv0.115.0&color=blue&logo=hugo)](https://github.com/gohugoio/hugo/releases/tag/v0.115.0)
[![License](https://img.shields.io/github/license/debuginn/hugo-theme-skills)](https://github.com/debuginn/hugo-theme-skills/blob/main/LICENSE)
[![ExampleSite](https://img.shields.io/badge/exampleSite-skills.debuginn.com-2b7bff)](https://skills.debuginn.com)
[![Multilingual](https://img.shields.io/badge/i18n-EN%20%2F%20ZH-1f9d55)](#i18n)
[![Deploy](https://github.com/debuginn/hugo-theme-skills/actions/workflows/deploy.yml/badge.svg)](https://github.com/debuginn/hugo-theme-skills/actions/workflows/deploy.yml)

[中文文档](./README.zh.md)

**hugo-theme-skills** is a Hugo theme for building Skills & Tools portal sites with a terminal/CLI aesthetic:

- portal homepage with animated hero and tool card grid
- card flip UX for skill install instructions
- multilingual routing (EN / ZH)
- dark mode with flash-prevention
- auto-detect browser language and redirect

## Requirements

- Hugo `>= 0.115.0` (extended recommended)
- Go `>= 1.21` (required for Hugo Module)

## Install

### Hugo Module (recommended)

Initialize your site as a Hugo Module if you haven't already:

```bash
hugo mod init github.com/yourname/your-site
```

Add the theme to your `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/debuginn/hugo-theme-skills"
```

Fetch the theme:

```bash
hugo mod get github.com/debuginn/hugo-theme-skills
hugo mod tidy
```

### Git Submodule

```bash
git submodule add https://github.com/debuginn/hugo-theme-skills themes/hugo-theme-skills
```

Then set `theme = "hugo-theme-skills"` in your `hugo.toml`.

## Quick Start

Minimum working directory structure:

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
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false

[module]
  [[module.imports]]
    path = "github.com/debuginn/hugo-theme-skills"

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

Run the example site locally:

```bash
cd exampleSite && hugo server
```

## Content Model

Tools live in the `tools` section. Front matter keys:

| Key | Purpose |
|-----|---------|
| `toolType` | Selects which controls partial and canvas assets to load |
| `toolCSS` / `toolJS` | Per-tool static asset paths |
| `installCode` | If present, enables card flip and back-face install block |
| `buttons` | Array controlling which buttons appear on the card. Values: `"open"`, `"install"`. Defaults to `["open"]` (plus `"install"` when `installCode` is set). Use `["install"]` for skill-only cards with no tool page. |
| `openLabel` | Custom label for the open button; defaults to `"$ OpenTool"` |
| `githubRepo` | GitHub URL; renders a circular GitHub icon link at the bottom-right of the card |
| `tags` | Tag array for categorization |
| `cardIcon` | Custom inline SVG icon; falls back to a type-based default icon |

Example tool front matter (`content/tools/my-tool.md`):

```yaml
---
title: "My Tool"
slug: "my-tool"
desc: "One-line description shown on the card."
installCode: "# Install\n/plugin install my-tool"
buttons: ["open", "install"]
githubRepo: "https://github.com/yourname/repo"
tags: ["Tool", "Claude"]
weight: 1
---

Full description shown on the tool page.
```

## i18n

Skills expects translation files in `i18n/<lang>.toml`.

Two languages are supported out of the box:

- `en` (default, served at `/`)
- `zh` (served at `/zh/`)

Minimum `i18n/en.toml`:

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

## Notes

- No build pipeline, no Node.js dependencies — pure Hugo with vanilla JS and CSS.
- Theme preference stored in `localStorage` under `debuginn_tools_theme`, applied via a blocking IIFE to prevent flash.
- Browser language is auto-detected on first visit; Chinese users are redirected to `/zh/`.
- A live demo is available at [skills.debuginn.com](https://skills.debuginn.com).
