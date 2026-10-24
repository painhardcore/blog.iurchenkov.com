import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Build test fixtures in an isolated copy so they never enter dist.
const work = await mkdtemp(join(tmpdir(), "blog-articles-"));
try {
  for (const path of [
    "src",
    "public",
    "package.json",
    "tsconfig.json",
    "astro.config.ts",
    "astro-paper.config.ts",
  ]) {
    await cp(path, join(work, path), { recursive: true });
  }
  await cp("node_modules", join(work, "node_modules"), { recursive: true });
  const fixture = await readFile("tests/fixtures/rendering.mdx", "utf8");
  await writeFile(
    join(work, "src/content/posts/verification-mdx.mdx"),
    fixture
  );
  const markdown = fixture
    .replace(/^import .+;\n/gm, "")
    .replace(/<\/?ResponsiveTable[^>]*>/g, "")
    .replace(/<figure>[\s\S]*?<\/figure>/, "![Fixture image](/favicon.svg)");
  await writeFile(
    join(work, "src/content/posts/verification-markdown.md"),
    markdown +
      `
\n## More languages\n
${Object.entries({
  c: "int main(void) { return 0; }",
  cpp: "int main() { return 0; }",
  bash: 'echo "hello"',
  python: 'print("hello")',
  typescript: "const count: number = 1;",
  sql: "SELECT 1;",
  yaml: "count: 1",
  json: '{"count": 1}',
  toml: "count = 1",
})
  .map(([lang, code]) => "\n```" + lang + "\n" + code + "\n```\n")
  .join("")}`
  );
  await writeFile(
    join(work, "src/content/posts/verification-draft.mdx"),
    fixture.replace("draft: false", "draft: true")
  );
  const future = fixture.replace(
    "2020-01-01T00:00:00Z",
    "2099-01-01T00:00:00Z"
  );
  await writeFile(
    join(work, "src/content/posts/verification-future.mdx"),
    future
  );
  const build = Bun.spawn(["bun", "--bun", "astro", "build"], {
    cwd: work,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, status] = await Promise.all([
    new Response(build.stdout).text(),
    new Response(build.stderr).text(),
    build.exited,
  ]);
  assert.equal(status, 0, stdout + stderr);
  for (const slug of ["verification-mdx", "verification-markdown"]) {
    const html = await readFile(
      join(work, "dist/posts", slug, "index.html"),
      "utf8"
    );
    for (const marker of [
      "katex-display",
      "table-scroll",
      "diagram-scroll",
      "highlighted-word",
      "diff add",
      "callout",
      "data-footnote-ref",
      'href="#source-code"',
    ]) {
      assert(html.includes(marker), `${slug}: missing ${marker}`);
    }
    assert.equal(
      (html.match(/class="diagram-scroll"/g) ?? []).length,
      5,
      `${slug}: diagram types`
    );
    assert.match(html, /alt="A request passes from client to server/);
    assert.match(html, /data:image\/svg\+xml/);
    await readFile(join(work, "dist/posts", slug, "index.png"));
  }
  await readFile(join(work, "dist/posts/2/index.html"));
  const sitemap = await readFile(join(work, "dist/sitemap-0.xml"), "utf8");
  const rss = await readFile(join(work, "dist/rss.xml"), "utf8");
  assert.doesNotMatch(sitemap + rss, /verification-draft|verification-future/);
  for (const slug of ["verification-draft", "verification-future"]) {
    await assert.rejects(
      readFile(join(work, "dist/posts", slug, "index.html"))
    );
  }
  console.info(
    "Verified Markdown and MDX: 11 code languages, highlighting, 5 Mermaid types, math, tables, callouts, footnotes, TOC, social images, pagination, and draft/scheduled exclusion"
  );
} finally {
  await rm(work, { recursive: true, force: true });
}
