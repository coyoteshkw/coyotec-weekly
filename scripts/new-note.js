import fs from "node:fs";
import path from "node:path";

const now = new Date();
const publishDate = now.toISOString();

const dir = path.join("src", "content", "note");
const ts = now.toISOString().replace(/[:.]/g, "-").split("T")[0];
const filename = `${ts}.mdx`;
const filepath = path.join(dir, filename);

const frontmatter = `---
title: ""
description: ""
publishDate: "${publishDate}"
---

`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(filepath, frontmatter, "utf-8");
console.log(`Created: ${filepath}`);
