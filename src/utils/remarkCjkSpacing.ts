const CJK = /[一-鿿㐀-䶿豈-﫿぀-ゟ゠-ヿ가-힯]/;
// 中文常用全角标点（作为“CJK侧”的一部分，与英文之间同样需要留白）
const CJK_PUNCT = /[，。、；：？！“”‘’（）《》〈〉【】…—～·]/;
const LATIN = /[a-zA-Z0-9]/;
// inlineCode 边界：除字母数字外，常见的半角符号也算作“代码侧”字符
const CODE_CHAR = /[a-zA-Z0-9./:+#_~@-]/;

type Node = {
  type: string;
  value?: string;
  children?: Node[];
};

/** 判断一个字符是否属于“CJK侧”（汉字或中文标点） */
function isCjkSide(c: string): boolean {
  return CJK.test(c) || CJK_PUNCT.test(c);
}

/** 在单个文本节点内部，给相邻的中英文（含中文标点）之间插入窄空格 */
function spaceText(str: string): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const prev = str[i - 1] ?? "";
    const curr = str[i];
    if (
      (isCjkSide(prev) && LATIN.test(curr)) ||
      (LATIN.test(prev) && isCjkSide(curr))
    ) {
      result += "\u2009" + curr;
    } else {
      result += curr;
    }
  }
  return result;
}

// inlineCode 与其两侧文本之间用普通空格（更明显）
const CODE_SPACE = " ";

/** inlineCode 边界判断：代码首/尾字符包含半角符号也算“代码侧” */
function needsCodeSpace(a: string, b: string): boolean {
  return (isCjkSide(a) && CODE_CHAR.test(b)) || (CODE_CHAR.test(a) && isCjkSide(b));
}

/** 提取节点显示文本的首字符（用于边界判断） */
function firstChar(node: Node): string {
  if (node.value) return node.value[0] ?? "";
  if (node.children) {
    for (const child of node.children) {
      const c = firstChar(child);
      if (c) return c;
    }
  }
  return "";
}

/** 提取节点显示文本的尾字符（用于边界判断） */
function lastChar(node: Node): string {
  if (node.value) return node.value[node.value.length - 1] ?? "";
  if (node.children) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const c = lastChar(node.children[i]);
      if (c) return c;
    }
  }
  return "";
}

/** 判断某个子节点是否需要与前后 text 节点之间加空格（inlineCode / link） */
function isBoundaryNode(child: Node): boolean {
  return child.type === "inlineCode" || child.type === "link";
}

function walk(node: Node): void {
  if (!node.children || node.children.length === 0) return;

  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // 递归处理子节点
    walk(child);

    // 处理 inlineCode / link 与其前后 text 节点之间的中西文边界
    if (!isBoundaryNode(child)) continue;

    const nodeFirst = firstChar(child);
    const nodeLast = lastChar(child);
    if (!nodeFirst && !nodeLast) continue;

    // 前面是 text 节点：判断 text 结尾字符 与 子节点首字符
    const prevSibling = children[i - 1];
    if (prevSibling && prevSibling.type === "text" && prevSibling.value) {
      const prevText = prevSibling.value;
      const prevLast = prevText[prevText.length - 1];
      if (needsCodeSpace(prevLast, nodeFirst) && !prevText.endsWith(" ")) {
        prevSibling.value = prevText + CODE_SPACE;
      }
    }

    // 后面是 text 节点：判断 子节点尾字符 与 text 首字符
    const nextSibling = children[i + 1];
    if (nextSibling && nextSibling.type === "text" && nextSibling.value) {
      const nextText = nextSibling.value;
      const nextFirst = nextText[0];
      if (needsCodeSpace(nodeLast, nextFirst) && !nextText.startsWith(" ")) {
        nextSibling.value = CODE_SPACE + nextText;
      }
    }
  }
}

export function remarkCjkSpacing() {
  return (tree: Node) => {
    // 先递归处理所有 text 节点内部的中英文空格
    const spaceAllText = (node: Node) => {
      if (node.type === "text" && node.value) {
        node.value = spaceText(node.value);
      }
      if (node.children) {
        for (const child of node.children) spaceAllText(child);
      }
    };
    spaceAllText(tree);

    // 再处理 inlineCode 与相邻 text 之间的边界
    walk(tree);
  };
}
