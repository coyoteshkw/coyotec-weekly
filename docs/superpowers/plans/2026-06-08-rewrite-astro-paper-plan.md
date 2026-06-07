# 迁至 Astro Paper 主题 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 coyotec-weekly 从 Astro Cactus 主题完整迁移到 coyotec-blog 已定制好的 Astro Paper 主题，去掉 featured 区段只保留 recent posts。

**Architecture:** 以 coyotec-blog 完整源码为基底复制到新分支 v2，在此基础上修改配置文件、改造首页、迁移文章、清理冗余文件。

**Tech Stack:** Astro 6.4, TailwindCSS 4, MDX, Shiki, Pagefind, i18n (en/zh-CN)

---

### Task 1: 创建 v2 分支并清空工作区

**Files:**
- Branch: `v2` (from `main`)

- [ ] **Step 1: 创建 v2 分支**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
git checkout -b v2
```

- [ ] **Step 2: 清空工作区（保留 .git）**

```bash
find . -maxdepth 1 -not -name '.git' -not -name '.' -not -name '..' | xargs rm -rf
```

- [ ] **Step 3: 确认清空**

```bash
ls -la
```

Expected: 只有 `.git` 目录

- [ ] **Step 4: 提交空工作区**

```bash
git add -A
git commit -m "chore: clear workspace for rewrite"
```

---

### Task 2: 复制 coyotec-blog 源文件

**Files:**
- Create: 所有 coyotec-blog 文件（排除 .git, node_modules, dist, .DS_Store, .astro）

- [ ] **Step 1: 复制文件**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='.DS_Store' --exclude='.astro' /Users/coyoteshkw/Documents/blog/coyotec-blog/ .
```

- [ ] **Step 2: 确认文件结构**

```bash
ls -la
ls src/
ls src/pages/
```

Expected: 能看到 `astro.config.ts`, `astro-paper.config.ts`, `package.json`, `src/` 等

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: copy coyotec-blog source as base"
```

---

### Task 3: 更新站点配置

**Files:**
- Modify: `astro-paper.config.ts`

- [ ] **Step 1: 修改 astro-paper.config.ts**

将文件内容替换为：

```typescript
import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://coyotec-weekly.pages.dev/",
    title: "萨查周记",
    description: "每周的记录、资源和感悟",
    author: "coyoteshkw",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
    googleVerification: "xxx",
  },
  posts: {
    perPage: 4,
    perIndex: 10,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/coyoteshkw/coyotec-weekly/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/coyoteshkw" },
    { name: "mail", url: "mailto:coyoteshkw@proton.me" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
```

- [ ] **Step 2: 提交**

```bash
git add astro-paper.config.ts
git commit -m "config: update site identity for coyotec-weekly"
```

---

### Task 4: 改造首页 - 去掉 Featured，只保留 Recent Posts

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 编辑 index.astro**

改动 1 - 删除 featuredPosts 变量，简化 recentPosts 逻辑：

find:
```astro
const posts = await getCollection("posts");
const sortedPosts = getSortedPosts(posts);
const featuredPosts = sortedPosts.filter(({ data }) => data.featured);
const recentPosts = sortedPosts.filter(({ data }) => !data.featured);
const homePath = getRelativeLocaleUrl(locale, "");
```

replace with:
```astro
const posts = await getCollection("posts");
const sortedPosts = getSortedPosts(posts);
const homePath = getRelativeLocaleUrl(locale, "");
```

改动 2 - 删除 featured section 整个代码块：

find:
```astro
    {
      featuredPosts.length > 0 && (
        <section
          id="featured"
          class:list={[
            "pt-12 pb-6",
            { "border-border border-b": recentPosts.length > 0 },
          ]}
        >
          <h2 class="text-2xl font-semibold tracking-wide">
            {t.home.featured}
          </h2>
          <ul>
            {featuredPosts.map(data => (
              <Card variant="h3" {...data} />
            ))}
          </ul>
        </section>
      )
    }

```

replace with: (空，直接删除)

改动 3 - recentPosts 直接用 sortedPosts：

find:
```astro
      recentPosts.length > 0 && (
```

replace with:
```astro
      sortedPosts.length > 0 && (
```

find:
```astro
            {recentPosts.slice(0, postsConfig.perIndex).map(data => (
```

replace with:
```astro
            {sortedPosts.slice(0, postsConfig.perIndex).map(data => (
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/index.astro
git commit -m "feat: remove featured section, show all posts as recent"
```

---

### Task 5: 删除 coyotec-blog 原有文章

**Files:**
- Delete: `src/content/posts/games/how-to-set-up-a-minecraft-server.md`
- Delete: `src/content/posts/programming/how-to-create-a-bible-checkin-app-using-AI.md`
- Delete: `src/content/posts/_color-schemes/` (整个目录)

- [ ] **Step 1: 删除旧文章**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
rm -rf src/content/posts/games
rm -rf src/content/posts/programming
rm -rf src/content/posts/_color-schemes
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "chore: remove old coyotec-blog articles"
```

---

### Task 6: 迁移文章 - 06-07.md（已发布）

**Files:**
- Create: `src/content/posts/2026/6/0607.md`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p src/content/posts/2026/6
```

- [ ] **Step 2: 写入迁移后的文章**

创建 `src/content/posts/2026/6/0607.md`：

```markdown
---
author: coyoteshkw
pubDatetime: 2026-06-07
modDatetime: 2026-06-07
title: 2026 第23周 开始
draft: false
tags: ["others"]
description: 开始用周记记录生活
---

## 本周做了什么

- 发现了Astro这个做博客的好东西
- 了解了如何从零搭建Astro博客，和React很相似
- 搭建了[圣经打卡网站](https://bible-checkin.vercel.app/)并且部署上线
- 完成了[博客主站](https://coyotec-blog.pages.dev)的搭建
- 利用`Pi Coding agent`搭建了这个周记博客

## 收集的资源

### Turso - 基于SQlite搭建的云数据库

> https://turso.tech/

轻量级，可拓展，速度快。但我用它只是为了在圣经打卡网站[^1]中替代SQlite

默认每月额度对我还挺够用的

![就我那点读写不够它塞牙缝的](https://a692b0fb.cloudflare-imgbed-czl.pages.dev/file/1780836868358_image.png)

[^1]: [圣经打卡应用，从需求设计到部署上线 | 萨查日志](https://coyotec-blog.pages.dev/posts/programming/how-to-create-a-bible-checkin-app-using-ai/)

### Pi Coding Agent - 另一个Agent啦

> https://pi.dev/

在B站刷到了一个[视频](https://b23.tv/BellSSZ)，讲Pi开发者开发这个agent的心路历程，简而言之市面上的各种agent都很好，但是不合他的胃口，看不到具体流程，注入内容太多，做的太全能而用户只用了2%。他选择从简单做起，想要什么内容你自己加。

- 默认没有子代理（辣你去开几个tmux啊！这样啥流程到看不到！开发者言）
- 提示词短到就几行一眼扫完（现代AI完全知道你要干什么，没必要重复提醒，开发者言）
- 默认YOLO模式，可调用的工具已经默认配好（相信你肯定对每个curl都要放行累觉不爱，我如此言）
- Skills当然是支持的
- 独特的`/tree`功能，可以导航到过去的每个节点重新开始，支持导出
- 可以在等待的时候玩DOOM（Why？？）

```bash
pi install npm:pi-doom
```

![doom-extension.png](https://a692b0fb.cloudflare-imgbed-czl.pages.dev/file/1780837770754_doom-extension.png)

这个周记就是用Pi开发的，感想是速度真的很快，明明用的DS Pro模型，速度比Reasonix用Flash还快。默认YOLO也很放松大脑。从利用[superpowers](https://github.com/obra/superpowers) Skill头脑风暴到撰写文档到逐步开发，最后到让它撰写脚本和兼容[Pages CMS](https://pagescms.org/)，只花了不到一块钱（但是就算每天花一块钱，一个月也要30以上，用起来真的肉痛啊AI）。做点小东西挺不错。

另外似乎无法在后台运行东西，让它帮忙在本地运行，始终弄不好，CC和Reasonix都没问题来的。不过我手动开一下倒也没事，不知道是否是个例

### Astro Paper - Astro主题推荐一

> https://https://github.com/satnaing/astro-paper

漂亮+极简主义，Astro Paper完全击中我的好球区。默认功能也很完善，开箱即用。不过没有悬浮目录功能，我让AI写了一个，和Astro Cactus的目录莫名很像

默认无法在Cloudflare Workers上构建，除非不要OG图片功能，给我折腾不清，最后部署在Pages上就行了，Vercel没有这个问题

![宣传图](https://a692b0fb.cloudflare-imgbed-czl.pages.dev/file/1780838538095_image.png)

### Astro Cactus - Astro主题推荐二

也就是这个周记的主题，在网上随便搜主题推荐的时候搜到的，感觉很不错。就用了。其实这个颜值当主站主题也够够的。

![这颜值真爆炸吧](https://a692b0fb.cloudflare-imgbed-czl.pages.dev/file/1780838753506_image.png)

### CloudFlare-ImgBed - cloudflare图床项目

> https://https://github.com/MarSeventh/CloudFlare-ImgBed

可以把自己的电报当做免费图床使，然后薅赛博大善人cloudflare的羊毛。一开始没有用是那会图片无法在非外网环境下访问，只能用腾讯云图床，最近发现可以国内网络访问了，那就狠狠用，速度肯定还是稍微慢点以及看脸，

找了个教程视频，和我之前部署的时候看的不一样，但是比较新，跟着做就行

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=116639953719701&bvid=BV1xEVP69Et1&cid=38624824258&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

## 感悟

开始一个私人周记是件很棒的事——不需要想太多，记录就好。

是我第一次尝试去总结自己，算是逼自己把学过的东西内化吧。但是还是打算慢慢来，放轻松做。重点是开始，即使我的写作水平还是很尴尬哈哈

完全Vibe Coding真的是一件我很不熟悉的事情，但是比我想象中好用很多，很多小任务完全没必要自己从零开始了。我看了两天的Astro零基础文档，但完全没用上，把成熟模板一clone下来然后自己改改，再让AI完成想加的内容，就完工了。这是以前完全无法想象的。

虽然还是有不少bug，需要我自己去排查和指引，但其实也就是打开logs日志，然后把东西复制过来罢了...如果以后大联合，那么AI直接手动提取日志内容，自己完成所有工作，程序员真的就只是做把关而已了。之前觉得让AI自己完成需求设计到运维是痴人说梦，虽然现在仍旧不靠谱，但是写点小东西，真的不要方便太多太多。

但我坚信代码水平仍旧需要精进，可能只是一种执着吧。要学习，也要老派，这样才算健全
```

关键 frontmatter 变更：
- `publishDate` → `pubDatetime`
- `updatedDate` → `modDatetime`
- 去掉 `pinned`
- 新增 `author: coyoteshkw`
- `tags` 从空改为 `["others"]`

- [ ] **Step 3: 提交**

```bash
git add src/content/posts/2026/
git commit -m "content: migrate 06-07 article with frontmatter conversion"
```

---

### Task 7: 迁移文章 - 06-07-workflow.md（草稿）

**Files:**
- Create: `src/content/posts/2026/6/0607-workflow.md`

- [ ] **Step 1: 写入草稿文章**

创建 `src/content/posts/2026/6/0607-workflow.md`：

```markdown
---
author: coyoteshkw
pubDatetime: 2026-06-07
title: "内容创建工作流"
draft: true
tags: ["weekly"]
description: "周记和笔记的日常创建流程"
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
```

- [ ] **Step 2: 提交**

```bash
git add src/content/posts/2026/6/0607-workflow.md
git commit -m "content: migrate workflow article as draft"
```

---

### Task 8: 更新 About 页面

**Files:**
- Modify: `src/content/pages/about.md`

- [ ] **Step 1: 更新 about.md**

将 `src/content/pages/about.md` 替换为：

```markdown
---
title: "关于"
description: "关于萨查周记"
---

Hi，我是萨查。

这里是萨查周记 - 每周的记录、资源和感悟。

更多内容请访问主站：[萨查日志](https://coyotec-blog.pages.dev)

Email: [coyoteshkw@proton.me](mailto:coyoteshkw@proton.me)
```

- [ ] **Step 2: 提交**

```bash
git add src/content/pages/about.md
git commit -m "content: update about page for coyotec-weekly"
```

---

### Task 9: 清理不需要的文件

**Files:**
- Delete: `.github/` (issue templates, CI workflows 来自 astro-paper)
- Delete: `CHANGELOG.md`
- Delete: `Dockerfile`, `compose.yaml`, `cz.yaml`, `.dockerignore`
- Delete: `AstroPaper-lighthouse-score.svg`
- Delete: `README.md` (之后可以重写)
- Delete: `.husky/`
- Delete: `src/assets/images/AstroPaper-v3.png`, `AstroPaper-v4.png`, `AstroPaper-v5.png`, `forrest-gump-quote.png`

- [ ] **Step 1: 删除冗余文件**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
rm -rf .github
rm -f CHANGELOG.md Dockerfile compose.yaml cz.yaml .dockerignore
rm -f AstroPaper-lighthouse-score.svg
rm -f README.md
rm -rf .husky
rm -f src/assets/images/AstroPaper-v3.png
rm -f src/assets/images/AstroPaper-v4.png
rm -f src/assets/images/AstroPaper-v5.png
rm -f src/assets/images/forrest-gump-quote.png
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "chore: remove unnecessary files from astro-paper template"
```

---

### Task 10: 更新 Pages CMS 配置

**Files:**
- Create: `.pages.yml`

- [ ] **Step 1: 创建 .pages.yml**

```yaml
media:
  public

content:
  - name: weekly
    label: 周记
    type: collection
    path: src/content/posts
    filename:
      template: "{year}/{month}/{pubDatetime|date('MMdd')}.md"
      field: pubDatetime
    view:
      primary: title
      sort: ["pubDatetime", "desc"]
      filters:
        - field: draft
          default: false
    fields:
      - name: title
        label: 标题
        type: string
        required: true
        max_length: 60
      - name: description
        label: 描述
        type: text
        required: true
      - name: pubDatetime
        label: 发布日期
        type: date
        required: true
        format: "yyyy-MM-dd"
        default: "$CURRENT_DATE"
      - name: modDatetime
        label: 更新日期
        type: date
        format: "yyyy-MM-dd"
      - name: draft
        label: 草稿
        type: boolean
        default: true
      - name: tags
        label: 标签
        type: string
        list: true
      - name: body
        label: 正文
        type: rich-text
```

- [ ] **Step 2: 提交**

```bash
git add .pages.yml
git commit -m "config: update Pages CMS for new path and fields"
```

---

### Task 11: 安装依赖并验证构建

**Files:**
- None (验证步骤)

- [ ] **Step 1: 安装依赖**

```bash
cd /Users/coyoteshkw/Documents/blog/coyotec-weekly
pnpm install
```

- [ ] **Step 2: 构建项目**

```bash
pnpm build
```

Expected: 构建成功，无错误。检查 dist 目录下是否有生成的页面。

- [ ] **Step 3: 检查输出**

```bash
ls dist/
ls dist/posts/
```

Expected: 能看到 0607.md 对应的页面（0607-workflow.md 是 draft 不应出现）

- [ ] **Step 4: 提交 lockfile**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add lockfile after install"
```

---

### Task 12: 最终检查 & 推送

**Files:**
- None

- [ ] **Step 1: 查看 git log 确认所有提交**

```bash
git log --oneline
```

- [ ] **Step 2: 查看文件结构**

```bash
find src/content/posts -type f | sort
```

Expected:
```
src/content/posts/2026/6/0607.md
src/content/posts/2026/6/0607-workflow.md
```

- [ ] **Step 3: 推送到远程**

```bash
git push origin v2
```
