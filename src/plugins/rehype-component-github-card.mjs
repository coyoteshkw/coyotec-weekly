/**
 * GitHub 仓库卡片 rehype 组件
 *
 * 移植自 Firefly 主题 (src/plugins/rehype-component-github-card.mjs)
 * 原作使用 Stylus + CSS 变量，此处改为 Tailwind 4 + CSS 变量适配明暗主题
 *
 * 用法: 在 .md/.mdx 中写 ::github{repo="owner/repo"}（两冒号，leaf 指令）
 *
 * 数据来源: 客户端 fetch GitHub REST API，无构建时依赖
 * - 头像: data.owner.avatar_url
 * - 描述: data.description
 * - Stars: data.stargazers_count
 * - Forks: data.forks_count
 * - License: data.license?.spdx_id
 * - 语言: data.language
 */

import { h } from "hastscript";

export function GithubCardComponent(properties, children) {
  if (Array.isArray(children) && children.length !== 0)
    return h("div", { class: "hidden" }, [
      'Invalid directive. ("github" directive must be leaf type ::github{repo="owner/repo"})',
    ]);

  if (!properties.repo?.includes("/"))
    return h("div", { class: "hidden" }, [
      'Invalid repository. ("repo" attribute must be in the format "owner/repo")',
    ]);

  const repo = properties.repo;
  const cardUuid = `GC${Math.random().toString(36).slice(-6)}`;

  const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });
  const nLanguage = h(`span#${cardUuid}-language`, { class: "gc-language" }, "Waiting...");
  const nDescription = h(`div#${cardUuid}-description`, { class: "gc-description" }, "Waiting for api.github.com...");
  const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stats-item" }, "00K");
  const nForks = h(`div#${cardUuid}-forks`, { class: "gc-stats-item" }, "0K");
  const nLicense = h(`div#${cardUuid}-license`, { class: "gc-stats-item" }, "0K");

  const nScript = h(
    `script#${cardUuid}-script`,
    { type: "text/javascript" },
    `
(function () {
  var card = document.getElementById('${cardUuid}-card');
  if (!card) return;

  var uid = '${cardUuid}';
  function el(id) { return document.getElementById(id); }
  function setText(id, text) { var e = el(id); if (e) e.innerText = text; }
  function fail() {
    card.classList.remove("fetch-waiting");
    card.classList.add("fetch-error");
    setText(uid + '-description', '无法加载仓库信息，点击前往 GitHub 查看');
  }

  try {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 6000);

    fetch('https://api.github.com/repos/${repo}', {
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        setText(uid + '-description', (data.description || '').replace(/:[a-zA-Z0-9_]+:/g, '') || 'No description');
        setText(uid + '-language', data.language || '');

        var compact = function (n) {
          try { return Intl.NumberFormat('en-us', { notation: 'compact', maximumFractionDigits: 1 }).format(n).replaceAll('\u202f', ''); }
          catch (e) { return String(n ?? '0'); }
        };
        setText(uid + '-forks', compact(data.forks));
        setText(uid + '-stars', compact(data.stargazers_count));
        setText(uid + '-license', (data.license && data.license.spdx_id) || 'no-license');

        var ava = el(uid + '-avatar');
        if (ava) {
          ava.style.backgroundImage = 'url(' + data.owner.avatar_url + '&s=40)';
          ava.classList.add('loaded');
        }

        card.classList.remove('fetch-waiting');
      })
      .catch(function (err) {
        clearTimeout(timer);
        fail();
        if (err.name !== 'AbortError') console.warn('[GH-CARD] Failed to load ${repo}:', err);
      });
  } catch (e) {
    fail();
  }
})();
    `,
  );

  return h(
    `a#${cardUuid}-card`,
    {
      class: "card-github fetch-waiting",
      href: `https://github.com/${repo}`,
      target: "_blank",
      rel: "noopener noreferrer",
      repo,
    },
    [
      // 标题栏
      h("div", { class: "gc-titlebar" }, [
        h("div", { class: "gc-titlebar-left" }, [
          h("div", { class: "gc-owner" }, [
            nAvatar,
            h("div", { class: "gc-user" }, repo.split("/")[0]),
          ]),
          h("div", { class: "gc-divider" }, "/"),
          h("div", { class: "gc-repo" }, repo.split("/")[1]),
        ]),
        h("div", { class: "gc-github-logo" }),
      ]),
      // 描述
      nDescription,
      // 统计栏
      h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage]),
      nScript,
    ],
  );
}
