#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const dateStr = `${month}${day}`;

// ISO week number
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const weekNum = getISOWeek(now);
const title = `${year} 第${weekNum}周`;

const postsDir = path.join(rootDir, "src", "content", "posts", String(year), month);
fs.mkdirSync(postsDir, { recursive: true });

const filename = `${month}${day}.md`;
const filepath = path.join(postsDir, filename);

if (fs.existsSync(filepath)) {
  console.error(`❌ 文件已存在: ${filepath}`);
  process.exit(1);
}

const frontmatter = `---
author: coyoteshkw
pubDatetime: ${year}-${month}-${day}
modDatetime: ${year}-${month}-${day}
title: ${title}
draft: true
tags: ["weekly"]
description:
---

`;

fs.writeFileSync(filepath, frontmatter, "utf-8");
console.log(`✅ 已创建周记: ${filepath}`);
