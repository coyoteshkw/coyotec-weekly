/**
 * remark → rehype directive 转换器
 *
 * 移植自 Firefly 主题 (src/plugins/remark-directive-rehype.js)
 * 原作将 directive AST 节点转为 hast，供 rehype-components 消费
 *
 * 适配: 保留 admonition 类型给 rehype-callouts 处理，其余 directive 转为自定义标签
 */
import { h } from "hastscript";
import { visit } from "unist-util-visit";

const ADMONITION_TYPES = [
  "note", "tip", "important", "warning", "caution",
  "abstract", "summary", "tldr", "info", "todo",
  "success", "check", "done", "question", "help", "faq",
  "attention", "failure", "missing", "fail", "danger", "error", "bug",
  "example", "quote", "cite",
];

export function parseDirectiveNode() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const name = node.name ? node.name.toLowerCase() : "";

        if (
          node.type === "containerDirective" &&
          ADMONITION_TYPES.includes(name)
        ) {
          // admonition → 交给 rehype-callouts 处理
          const type = name.toUpperCase();
          const firstChild = node.children[0];
          if (firstChild?.data?.directiveLabel) {
            if (
              firstChild.children.length > 0 &&
              firstChild.children[0].type === "text"
            ) {
              firstChild.children[0].value = `[!${type}] ${firstChild.children[0].value}`;
            } else {
              firstChild.children.unshift({
                type: "text",
                value: `[!${type}] `,
              });
            }
          } else {
            node.children.unshift({
              type: "paragraph",
              children: [{ type: "text", value: `[!${type}]` }],
            });
          }
          node.type = "blockquote";
          node.data = node.data || {};
          node.data.hName = "blockquote";
          delete node.data.hProperties;
        } else {
          // 只处理 :::github 指令，remark-directive-sugar 处理其余
          if (name !== "github") return;

          // :::github → 转为自定义 <github> 标签给 rehype-components
          const data = node.data || {};
          node.data = data;
          node.attributes = node.attributes || {};

          if (
            node.children.length > 0 &&
            node.children[0].data?.directiveLabel
          ) {
            node.attributes["has-directive-label"] = true;
          }

          const hast = h(node.name, node.attributes);
          data.hName = hast.tagName;
          data.hProperties = hast.properties;
        }
      }
    });
  };
}
