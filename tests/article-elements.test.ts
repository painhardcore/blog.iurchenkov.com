import { expect, test } from "bun:test";
import type { Root } from "hast";
import { rehypeArticleElements } from "../src/utils/rehypeArticleElements";

test("wraps adjacent tables and Mermaid pictures without nesting or dropping nodes", () => {
  const table = {
    type: "element",
    tagName: "table",
    properties: {},
    children: [],
  } as const;
  const tree: Root = {
    type: "root",
    children: [
      { ...table, children: [] },
      { ...table, children: [] },
      {
        type: "element",
        tagName: "picture",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "img",
            properties: { id: "mermaid-0", alt: "Read request" },
            children: [],
          },
        ],
      },
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value: "End" }],
      },
    ],
  };
  rehypeArticleElements()(tree);
  expect(tree.children).toHaveLength(4);
  expect(
    tree.children
      .slice(0, 3)
      .map(node => node.type === "element" && node.properties.className)
  ).toEqual([["table-scroll"], ["table-scroll"], ["diagram-scroll"]]);
  for (const node of tree.children.slice(0, 3)) {
    expect(node.type === "element" && node.properties.tabIndex).toBe(0);
    expect(node.type === "element" && node.children).toHaveLength(1);
  }
});
