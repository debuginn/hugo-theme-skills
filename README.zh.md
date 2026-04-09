![hugo-theme-skills](https://github.com/user-attachments/assets/c958db24-d854-4a84-a610-9c6b5e9d5929)

# hugo-theme-skills

[![最低 Hugo 版本](https://img.shields.io/static/v1?label=min-HUGO-version&message=%3E%3Dv0.115.0&color=blue&logo=hugo&style=for-the-badge)](https://github.com/gohugoio/hugo/releases/tag/v0.115.0)
[![开源协议](https://img.shields.io/github/license/debuginn/hugo-theme-skills?style=for-the-badge)](https://github.com/debuginn/hugo-theme-skills/blob/main/LICENSE)
[![示例站点](https://img.shields.io/badge/示例站点-skills.debuginn.com-2b7bff?style=for-the-badge)](https://skills.debuginn.com)
[![多语言](https://img.shields.io/badge/i18n-EN%20%2F%20ZH-1f9d55?style=for-the-badge)](#i18n)
[![Telegram](https://img.shields.io/badge/Telegram-xiaoyupark-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/xiaoyupark)
[![部署状态](https://img.shields.io/github/actions/workflow/status/debuginn/hugo-theme-skills/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/debuginn/hugo-theme-skills/actions/workflows/deploy.yml)

[English](./README.md)

**hugo-theme-skills** 是一款具有终端/命令行风格的 Hugo 主题，适用于构建 Skills & Tools 门户站点：

- 带动画 Hero 区域与工具卡片网格的门户首页
- 卡片翻转交互，展示技能安装指引
- 多语言路由（EN / ZH）
- 暗色模式（带防闪烁处理）
- 自动检测浏览器语言并跳转

## 环境要求

- Hugo `>= 0.115.0`（建议使用 extended 版本）
- Go `>= 1.21`（Hugo Module 依赖）

## 安装

### Hugo Module（推荐）

若站点尚未初始化为 Hugo Module，先执行：

```bash
hugo mod init github.com/yourname/your-site
```

在 `hugo.toml` 中引入主题：

```toml
[module]
  [[module.imports]]
    path = "github.com/debuginn/hugo-theme-skills"
```

拉取主题：

```bash
hugo mod get github.com/debuginn/hugo-theme-skills
hugo mod tidy
```

### Git Submodule

```bash
git submodule add https://github.com/debuginn/hugo-theme-skills themes/hugo-theme-skills
```

然后在 `hugo.toml` 中设置 `theme = "hugo-theme-skills"`。

## 快速开始

消费站点的最小目录结构：

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

`hugo.toml` 示例：

```toml
baseURL = "https://example.com/"
title = "我的 Skills & Tools"
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

本地运行示例站点：

```bash
cd exampleSite && hugo server
```

## 内容模型

工具内容位于 `tools` 分区，front matter 字段说明：

| 字段                 | 说明                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolType`           | 指定加载的控制面板 partial 和 Canvas 资源                                                                                                                 |
| `toolCSS` / `toolJS` | 工具专属静态资源路径                                                                                                                                      |
| `installCode`        | 若存在，启用卡片翻转并在背面展示安装指令块                                                                                                                |
| `buttons`            | 控制卡片正面按钮的数组，可选值：`"open"`、`"install"`。默认为 `["open"]`（设置了 `installCode` 时自动加上 `"install"`）。纯技能卡片可设为 `["install"]`。 |
| `openLabel`          | 打开按钮的自定义文案，默认为 `"$ OpenTool"`                                                                                                               |
| `githubRepo`         | GitHub 仓库地址，设置后在卡片右下角渲染圆形 GitHub 图标链接                                                                                               |
| `tags`               | 标签数组，用于分类                                                                                                                                        |
| `cardIcon`           | 自定义内联 SVG 图标，未设置时回退到类型默认图标                                                                                                           |

工具 front matter 示例（`content/tools/my-tool.md`）：

```yaml
---
title: "我的工具"
slug: "my-tool"
desc: "显示在卡片上的一行描述。"
installCode: "# 安装\n/plugin install my-tool"
buttons: ["open", "install"]
githubRepo: "https://github.com/yourname/repo"
tags: ["工具", "Claude"]
weight: 1
---

显示在工具详情页的完整描述。
```

## i18n

主题使用 `i18n/<lang>.toml` 格式的翻译文件。

内置两种语言：

- `en`（默认，访问路径 `/`）
- `zh`（访问路径 `/zh/`）

最小 `i18n/zh.toml` 示例：

```toml
[hero_title_prefix]
other = "Hugo"

[hero_title_accent]
other = "Theme Skills"

[hero_desc]
other = "一款轻量、简洁、美观的 skill & tool 介绍与工具页的 Hugo 主题。"

[nav_tools]
other = "工具"

[open_tool]
other = "$ 打开工具"

[install_skill]
other = "安装 Skill"
```

主题共内置 189 个 i18n 键，完整列表见 [`i18n/en.toml`](./i18n/en.toml) 和 [`i18n/zh.toml`](./i18n/zh.toml)。

## 参数说明

### `params`

| 参数            | 说明                               |
| --------------- | ---------------------------------- |
| `brandName`     | 页头和页脚显示的品牌名称           |
| `logoImage`     | Logo 图片路径                      |
| `ogImage`       | Open Graph 默认分享图路径          |
| `twitterHandle` | Twitter/X 账号，用于 SEO meta 标签 |
| `blogURL`       | 导航栏外部博客链接                 |
| `githubURL`     | GitHub 主页链接                    |
| `twitterURL`    | Twitter/X 主页链接                 |
| `telegramURL`   | Telegram 链接                      |
| `wechatQR`      | 微信二维码图片路径                 |
| `copyright`     | 页脚版权文案                       |
| `installCmd`    | Hero 区域展示的安装命令            |

### `languages.<lang>.params`

| 参数              | 说明                               |
| ----------------- | ---------------------------------- |
| `langHref`        | 该语言的根路径（`/` 或 `/zh/`）    |
| `langLabel`       | 语言切换器中显示的标签             |
| `brandName`       | 该语言专属品牌名称（覆盖全局设置） |
| `siteDescription` | 该语言的页面 meta 描述             |

## 布局结构

```
baseof.html          ← head、字体预加载、防闪烁 IIFE
  header.html        ← 吸顶导航、语言下拉、主题切换
  index.html         ← Hero 区域 + 轨道动画 + 工具卡片网格
  tools/single.html  ← 分栏布局：左侧控制面板 + 右侧 Canvas 预览
  footer.html        ← 品牌信息、语言选择器
```

## 说明

- 无构建流程，无 Node.js 依赖，纯 Hugo + 原生 JS/CSS。
- 主题偏好存储于 `localStorage` 的 `debuginn_tools_theme` 键，通过阻塞式 IIFE 在渲染前应用，避免闪烁。
- 首次访问时自动检测浏览器语言，中文用户将自动跳转至 `/zh/`。
- 在线演示：[skills.debuginn.com](https://skills.debuginn.com)
