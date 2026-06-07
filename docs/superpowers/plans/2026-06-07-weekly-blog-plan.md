# Coyotec Weekly 博客实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Astro Cactus 主题搭建私人 weekly 博客，部署到 Cloudflare Pages

**Architecture:** Fork Astro Cactus 作为基础，修改站点配置和导航，清理示例内容，添加第一篇周记，推送到 GitHub 供 Cloudflare Pages 自动部署

**Tech Stack:** Astro 6 + MDX + Tailwind CSS + pnpm

---

### Task 1: 初始化 Astro Cactus 项目

**Files:**
- Modify: 整个项目（从 Astro Cactus 初始化）

> **注意：** `coyotec-weekly` 目录已有 git 仓库和设计文档。本任务将 Astro Cactus 代码合入现有仓库，保留已有文档。

- [ ] **Step 1: 备份设计文档和 skills 文件**

```bash
cp -r /Users/coyoteshkw/Documents/blog/coyotec-weekly/docs /tmp/coyotec-weekly-backup/
cp -r /Users/coyoteshkw/Documents/blog/coyotec-weekly/.agents /tmp/coyotec-weekly-backup/
cp /Users/coyoteshkw/Documents/blog/coyotec-weekly/skills-lock.json /tmp/coyotec-weekly-backup/
```

- [ ] **Step 2: 重置仓库并克隆 Astro Cactus**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
rm -rf .git
git clone https://github.com/chrismwilliams/astro-theme-cactus.git /tmp/astro-cactus-temp
cp -r /tmp/astro-cactus-temp/* /Users/coyoteshkw/Documents/blog/coyotec-weekly/
cp /tmp/astro-cactus-temp/.gitignore /Users/coyoteshkw/Documents/blog/coyotec-weekly/
cp /tmp/astro-cactus-temp/.nvmrc /Users/coyoteshkw/Documents/blog/coyotec-weekly/
cp /tmp/astro-cactus-temp/.prettierrc.js /Users/coyoteshkw/Documents/blog/coyotec-weekly/
cp /tmp/astro-cactus-temp/.prettierignore /Users/coyoteshkw/Documents/blog/coyotec-weekly/
```

- [ ] **Step 3: 恢复备份的设计文档和 skills**

```bash
cp -r /tmp/coyotec-weekly-backup/docs /Users/coyoteshkw/Documents/blog/coyotec-weekly/
cp -r /tmp/coyotec-weekly-backup/.agents /Users/coyoteshkw/Documents/blog/coyotec-weekly/
cp /tmp/coyotec-weekly-backup/skills-lock.json /Users/coyoteshkw/Documents/blog/coyotec-weekly/
rm -rf /tmp/coyotec-weekly-backup /tmp/astro-cactus-temp
```

- [ ] **Step 4: 安装依赖**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
pnpm install
```

预期：安装成功，无错误

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "init: Astro Cactus theme + weekly blog design docs"
```

---

### Task 2: 配置站点信息

**Files:**
- Modify: `src/site.config.ts`

- [ ] **Step 1: 修改 `src/site.config.ts`**

将文件内容替换为：

```ts
import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	url: "https://coyotec-weekly.pages.dev/",
	title: "萨查周记",
	author: "coyoteshkw",
	description: "每周的记录、资源和感悟",
	lang: "zh-CN",
	ogLocale: "zh_CN",
	date: {
		locale: "zh-CN",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
};

export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "首页",
	},
	{
		path: "/posts/",
		title: "周记",
	},
	{
		path: "/notes/",
		title: "笔记",
	},
	{
		path: "/about/",
		title: "关于",
	},
	{
		path: "https://coyotec-blog.pages.dev/",
		title: "主站 →",
	},
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme, { styleVariants }) {
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		return `[data-theme="${theme.name}"]`;
	},
	themes: ["dracula", "github-light"],
	useThemedScrollbars: false,
};
```

- [ ] **Step 2: 修改 `src/pages/about.astro`**

将 `meta` 和正文改为中文，用 edit 替换：

```astro
---
import PageLayout from "@/layouts/Base.astro";

const meta = {
	description: "我的私人周记空间",
	title: "关于",
};
---

<PageLayout meta={meta}>
	<h1 class="title mb-12">关于</h1>
	<div class="prose prose-sm prose-cactus max-w-none">
		<p>这里是萨查周记——我用来记录每周做了什么、收集了什么资源、有什么感悟的地方。</p>
		<p>更详细的文章请访问 <a
			class="cactus-link inline-block"
			href="https://coyotec-blog.pages.dev"
			rel="noreferrer"
			target="_blank">主站</a>。</p>
	</div>
</PageLayout>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "config: set site info and Chinese navigation"
```

---

### Task 3: 清理示例内容并创建第一篇周记

**Files:**
- Delete: `src/content/post/markdown-elements/` 以及子文件
- Delete: `src/content/post/testing/` 以及子文件
- Delete: `src/content/post/webmentions.md`
- Delete: `src/content/note/welcome.md`
- Delete: `src/content/tag/test.md`
- Create: `src/content/post/2026/06/06-07.mdx`

- [ ] **Step 1: 删除示例内容**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
rm -rf src/content/post/markdown-elements
rm -rf src/content/post/testing
rm -f src/content/post/webmentions.md
rm -f src/content/note/welcome.md
rm -f src/content/tag/test.md
```

- [ ] **Step 2: 创建第一篇周记 `src/content/post/2026/06/06-07.mdx`**

```bash
mkdir -p src/content/post/2026/06
```

文件内容：

```mdx
---
title: "2026 第23周"
description: "开始用周记记录生活"
publishDate: "2026-06-07"
tags: ["weekly"]
---

## 本周做了什么

- 搭建了这个周记博客 🎉

## 收集的资源

_这周刚开始，还没有收集到什么特别的。_

## 感悟

开始一个私人周记是件很棒的事——不需要想太多，记录就好。
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "content: clean examples, add first weekly post"
```

---

### Task 4: 本地验证构建

- [ ] **Step 1: 运行构建**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
pnpm build
```

预期：构建成功，输出到 `dist/`

如果构建失败：
- 检查错误信息中提到的文件路径是否存在
- 注意 Cactus 的 schema 要求 `description` 和 `publishDate` 是必填字段
- 确认 `tags` 字段的格式正确（字符串数组）

- [ ] **Step 2: 本地预览（可选）**

```bash
pnpm preview
```

访问 `http://localhost:4321` 检查页面渲染是否正常。

- [ ] **Step 3: Commit（如有修改）**

```bash
git add -A
git commit -m "fix: build verification adjustments"
```

---

### Task 5: 推送 GitHub 并配置 Cloudflare Pages

> **注意：** 此任务中 Cloudflare Pages 部分由用户手动操作，仅提供指引。

- [ ] **Step 1: 在 GitHub 创建仓库**

访问 https://github.com/new，创建名为 `coyotec-weekly` 的仓库（建议设为 public）。

- [ ] **Step 2: 添加 remote 并推送**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
git remote add origin https://github.com/coyoteshkw/coyotec-weekly.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Cloudflare Pages 部署（用户手动操作）**

1. 登录 Cloudflare Dashboard → Workers & Pages
2. 点击 "Create" → "Pages" → "Connect to Git"
3. 选择 `coyoteshkw/coyotec-weekly` 仓库
4. 构建设置：
   - **Framework preset:** Astro
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Node.js version:** 22.x（或 23.x）
5. 点击 "Save and Deploy"

部署完成后，站点地址类似 `coyotec-weekly.pages.dev`。

---

### Task 6: 更新 site.config.ts 中的 URL（如有需要）

> 如果 Cloudflare Pages 分配了自定义域名或默认域名与预设不同，需要更新。

- [ ] **Step 1: 更新 URL**

如果实际域名不是 `coyotec-weekly.pages.dev`，修改 `src/site.config.ts` 中的 `url` 字段。

- [ ] **Step 2: 提交并推送**

```bash
git add src/site.config.ts
git commit -m "config: update site url to actual domain"
git push
```

Cloudflare Pages 会自动重新部署。

---

## 后续使用指引

**写一篇新周记：**

```bash
# 例如 2026 年 6 月 14 日（周日）
mkdir -p src/content/post/2026/06
# 创建 src/content/post/2026/06/06-14.mdx
```

frontmatter 模板：

```yaml
---
title: "2026 第24周"
description: "一句话概述本周"
publishDate: "2026-06-14"
updatedDate: "2026-06-14"
tags: ["weekly", "随便加标签"]
---
```

提交推送后 Cloudflare Pages 自动部署。
