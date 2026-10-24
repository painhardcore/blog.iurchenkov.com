import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/** Give wide article content a keyboard-accessible scrolling region. */
export function rehypeArticleElements() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (index === undefined || !parent) return;
      const diagram =
        node.tagName === "picture" &&
        node.children.some(
          child =>
            child.type === "element" &&
            child.tagName === "img" &&
            typeof child.properties.id === "string" &&
            child.properties.id.startsWith("mermaid")
        );
      if (node.tagName !== "table" && !diagram) return;
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: {
          className: [diagram ? "diagram-scroll" : "table-scroll"],
          tabIndex: 0,
          role: "region",
          ariaLabel: diagram
            ? "Diagram, scroll horizontally if needed"
            : "Table, scroll horizontally if needed",
        },
        children: [node],
      };
      parent.children[index] = wrapper;
      return index + 1;
    });
  };
}
