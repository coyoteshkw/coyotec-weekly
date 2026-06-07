# Coyotec Weekly 博客设计文档

**日期：** 2026-06-07  
**状态：** 设计已完成

---

## 1. 项目目标

创建一个私人 weekly 博客，记录每周做了什么、收集的资源、个人感悟。与主博客 `coyotec-blog`（深度文章）形成互补。

- **定位：** 私人周记，不追求更新频率和流量
- **基调：** 轻量、自由、个人化

---

## 2. 技术选型

| 项目 | 选择 | 原因 |
|------|------|------|
| 框架 | Astro | 静态生成，性能好，部署简单 |
| 主题 | [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) | 极简干净，用户选定 |
| 集成方式 | Direct Fork | 保持上游同步能力，最小定制 |
| 内容格式 | MDX | 留组件嵌入空间 |
| 部署 | Cloudflare Pages | 与主博客一致，免费，快 |
| 包管理 | pnpm | 与项目其他博客一致 |

---

## 3. 架构

```
coyotec-weekly/
├── src/
│   ├── content/post/              # 周记内容（复用 Cactus post collection）
│   │   ├── 2026/
│   │   │   └── 06/
│   │   │       └── 06-07.mdx      # 每周一个文件，日期命名
│   ├── pages/                     # Cactus 默认页面结构保留
│   │   ├── index.astro
│   │   ├── posts/
│   │   │   ├── [...page].astro    # 分页列表
│   │   │   └── [...slug].astro    # 文章详情
│   │   ├── tags/
│   │   ├── notes/
│   │   ├── rss.xml.ts
│   │   ├── og-image/
│   │   ├── about.astro
│   │   └── 404.astro
│   ├── components/                # Cactus 组件，全部保留
│   └── layouts/
│       ├── Base.astro
│       └── BlogPost.astro
├── astro.config.ts                # 添加 Cloudflare adapter
├── src/site.config.ts             # 站点标题、描述、导航
└── package.json
```

**关键决策：**

- 复用 Cactus 的 `post` content collection，不新建 `weekly` collection
- URL 格式：`/posts/2026/06/06-07/`
- 保留 Cactus 所有功能：搜索、标签、webmentions、笔记、OG 图片、深色模式、RSS
- 内容目录按年月分层：`content/post/YYYY/MM/DD.mdx`

---

## 4. 内容模型

### Frontmatter

```yaml
---
title: "2026 第23周"
date: 2026-06-07
updated: 2026-06-07
tags: ["weekly", "coding", "reading"]
draft: false
---
```

### 正文结构（自由格式，约定导向）

用二级标题分隔板块，不强求每周都包含所有板块：

```mdx
## 本周做了什么
- ...

## 收集的资源
- [标题](url) - 简短说明

## 感悟
...
```

---

## 5. 站点配置

部署 URL：`coyotec-weekly.pages.dev`

导航栏：
- 周记 → `/posts`
- 主站 → → `https://coyotec-blog.pages.dev`
- 标签 → `/tags`
- 笔记 → `/notes`
- 关于 → `/about`

RSS Feed：`/rss.xml`

---

## 6. 与主博客的关系

- **单向链接：** weekly 导航栏放 `主站 →` 指向 `coyotec-blog`
- 周记文章中需要展开的话题，写「详见主站 xxx」
- 主博客不做任何改动
- 两个项目独立部署、独立仓库

---

## 7. 部署

- **平台：** Cloudflare Pages（Git 集成，无需本地安装 adapter）
- **方式：** 推送 GitHub 仓库，用户在 Cloudflare Dashboard 手动连接仓库部署
- **构建命令：** `astro build`
- **输出目录：** `dist/`
- **域名：** `coyotec-weekly.pages.dev`（或自定义域名）

---

## 8. 初始化步骤摘要

1. Clone Astro Cactus 到 `coyotec-weekly` 目录
2. 安装依赖 (`pnpm install`)
3. 无需安装 Cloudflare adapter（Cloudflare Pages 原生支持 Astro）
4. 修改 `src/site.config.ts`（标题、导航）
5. 删除示例内容，创建第一篇周记
6. 本地 `pnpm build` 验证
7. 推送到 GitHub 仓库
8. 在 Cloudflare Pages Dashboard 连接仓库，设置框架预设为 Astro

---

## 9. 不做的（YAGNI）

- 不新建 content collection，直接用 post
- 不改动 Cactus 核心功能和组件
- 不修改主博客
- 不设置评论系统
- 不追求 SEO 优化（私人性质）
