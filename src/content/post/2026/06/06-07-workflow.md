---
title: "内容创建工作流"
description: "周记和笔记的日常创建流程"
publishDate: "2026-06-07"
tags: ["weekly"]
draft: true
---

## 创建新周记

在项目目录下运行：

```bash
pnpm weekly
```

自动生成 `src/content/post/YYYY/MM/MM-DD.md`，内容骨架已写好：

- 标题自动填 "2026 第XX周"（ISO 周数）
- 发布日期填当天
- `draft: true` 默认草稿态，不会发布
- tags 需手动添加

写完内容后，把 `draft: true` 改成 `draft: false`，提交推送即可发布。

## 创建新笔记

```bash
pnpm note
```

自动生成 `src/content/note/YYYY-MM-DD.md`，发布时间自动填当前 ISO 时间。

## 使用 Pages CMS（在线编辑）

打开 [app.pagescms.org](https://app.pagescms.org)，用 GitHub 登录后选择 `coyoteshkw/coyotec-weekly` 仓库。

**周记编辑：**
- 标题、描述直接填写
- 正文用富文本编辑器撰写
- `draft` 开关控制是否发布
- **注意：** 外部链接需写完整 URL（含 `https://`），否则会当成相对路径

**已知限制：** Pages CMS 的标签（tags）功能暂不可用，需本地手动添加。

## 文章页直接编辑

每篇文章标题旁边有 "Edit page" 按钮，点击直接跳转 GitHub 编辑该文章的 Markdown 文件。

## 发布流程

1. 本地或 Pages CMS 写好内容
2. `git commit` + `git push`（或 Pages CMS 直接保存提交）
3. Cloudflare Pages 自动构建部署
4. 站点地址：[coyotec-weekly.pages.dev](https://coyotec-weekly.pages.dev)
