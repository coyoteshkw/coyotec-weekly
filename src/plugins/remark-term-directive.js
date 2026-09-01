/**
 * remark 插件：注解（term）directive
 *
 * 语法：
 *   :term[术语]{annotation=注解内容}
 *
 * 渲染为：
 *   <span class="term" data-annotation="注解内容">术语</span>
 *
 * 注解内容含空格时用引号包裹：
 *   :term[术语]{annotation="这是 带空格的 注解"}
 */
import { visit } from "unist-util-visit";

export function remarkTermDirective() {
  return (tree) => {
    visit(tree, "textDirective", (node) => {
      if (node.name !== "term") return;

      const attributes = node.attributes || {};
      // 优先取 annotation，兼容 id 简写
      const annotation = attributes.annotation ?? attributes.id ?? "";

      const data = node.data || (node.data = {});

      data.hName = "span";
      // 用新对象覆盖，避免 remark-directive-sugar 遗留的 hProperties（含 annotation 属性）
      data.hProperties = {
        className: ["term"],
        dataAnnotation: annotation,
      };

      // 清除原始 attributes
      delete node.attributes;
    });
  };
}
