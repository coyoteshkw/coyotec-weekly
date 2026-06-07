import fs from "node:fs";
import path from "node:path";

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const publishDate = now.toISOString().split("T")[0];

// ISO week number
function getISOWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

const weekNum = getISOWeek(now);
const title = `${year} 第${weekNum}周`;
const filename = `${month}-${day}.md`;
const dir = path.join("src", "content", "post", String(year), month);
const filepath = path.join(dir, filename);

const frontmatter = `---
title: "${title}"
description: ""
publishDate: "${publishDate}"
updatedDate: ""
tags: ["weekly"]
draft: true
---

## 本周做了什么

- 

## 收集的资源

- 

## 感悟

`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(filepath, frontmatter, "utf-8");
console.log(`Created: ${filepath}`);
