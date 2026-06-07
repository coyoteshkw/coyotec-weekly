const CJK = /[一-鿿㐀-䶿豈-﫿぀-ゟ゠-ヿ가-힯]/;
const LATIN = /[a-zA-Z0-9]/;

function walk(node: Record<string, unknown> & { children?: unknown[] }) {
  if ("children" in node && node.children) {
    for (const child of node.children) {
      walk(child as typeof node);
    }
  }
  if (node.type === "text" && "value" in node) {
    let result = "";
    const str = node.value as string;
    for (let i = 0; i < str.length; i++) {
      const prev = str[i - 1] ?? "";
      const curr = str[i];
      if (
        (CJK.test(prev) && LATIN.test(curr)) ||
        (LATIN.test(prev) && CJK.test(curr))
      ) {
        result += " " + curr;
      } else {
        result += curr;
      }
    }
    node.value = result;
  }
}

export function remarkCjkSpacing() {
  return (tree: { children?: unknown[]; type: string }) =>
    walk(tree as unknown as Record<string, unknown> & { children?: unknown[] });
}
