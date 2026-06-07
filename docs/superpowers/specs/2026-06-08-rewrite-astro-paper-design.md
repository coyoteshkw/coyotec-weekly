# 迁至 Astro Paper 主题 - 重写设计

## 目标

将 coyotec-weekly 从 Astro Cactus 主题完全迁移至 coyotec-blog 已定制好的 Astro Paper 主题，去掉 featured 区段，只保留 recent posts。

## 分支策略

- 从 `main` 创建新分支 `v2`
- 以 coyotec-blog 完整源码为基底复制到 `v2`
- 在此基础上做减法与配置修改，而非从零搭建

## 首页改造

- 删除 `featuredPosts` 过滤与渲染逻辑（`src/pages/index.astro`）
- 所有文章直接进入 Recent Posts 列表
- `perIndex` 改为 `10`
- 保留 RSS 图标、个人描述、社交链接

## 内容结构

### 文章路径

```
src/content/posts/YYYY/M/MMDD.md
```

例：`src/content/posts/2026/6/0607.md`

### Frontmatter 映射

| 旧字段 (Cactus) | 新字段 (Paper) | 处理方式 |
|---|---|---|
| `title` | `title` | 直接搬 |
| `description` | `description` | 直接搬 |
| `publishDate` | `pubDatetime` | 日期格式转换 |
| `updatedDate` | `modDatetime` | 可选，格式转换 |
| `draft` | `draft` | 直接搬 |
| `tags` | `tags` | 直接搬 |
| `pinned` | 删除 | Paper 不用 |
| `ogImage` | `ogImage` | 直接搬（如有） |

### 迁移文章

- `2026/06/06-07.md` → `2026/6/0607.md`
- `2026/06/06-07-workflow.md` → `2026/6/0607-workflow.md`（草稿）
- 文章均为纯 Markdown，无需特殊 remark/rehype 插件

## 功能取舍

### 保留

- 归档（archives）
- 标签页（tags）
- 搜索（pagefind）
- 文章详情页全部功能（相邻文章导航、悬浮目录、分享链接、编辑链接）
- i18n 完整结构（en/zh-CN）

### 删除

- Featured 区段（首页）
- 笔记（notes）集合
- Pinned 文章逻辑

## 站点配置

在 `astro-paper.config.ts` 中修改：

| 配置项 | 值 |
|---|---|
| `site.url` | `https://coyotec-weekly.pages.dev/` |
| `site.title` | 萨查周记 |
| `site.description` | 每周的记录、资源和感悟 |
| `site.author` | coyoteshkw |
| `site.lang` | zh-CN |
| `site.timezone` | Asia/Shanghai |
| `site.profile` | 删除（主站专属链接） |
| `features.showArchives` | `true` |
| `features.search` | `pagefind` |
| `features.editPost` | `true`，URL：`https://github.com/coyoteshkw/coyotec-weekly/edit/main/` |
| `posts.perPage` | `4`（不变） |
| `posts.perIndex` | `10` |
| `socials` | GitHub + 邮件 |

## 依赖

以 coyotec-blog 的 `package.json` 为基准。旧 coyotec-weekly 的以下包不再需要：

- `astro-expressive-code`
- `astro-icon`、`astro-robots-txt`、`astro-webmanifest`
- `remark-directive`、`remark-admonitions`、`remark-github-card`、`remark-reading-time`
- `rehype-autolink-headings`、`rehype-external-links`、`rehype-unwrap-images`
- `@pagefind/component-ui`、`cssnano`、`hastscript`、`mdast-util-*`

## 脚本

`scripts/` 下的 `new-weekly.js` 和 `new-note.js` 全部移除，搬家后再考虑。

## 部署

Cloudflare Pages 部署保持不变，构建命令为 `pnpm build`（含 `pagefind --site dist`），站点地址 `coyotec-weekly.pages.dev`。
