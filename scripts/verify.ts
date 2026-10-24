import assert from "node:assert/strict";
import { access, readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const origin = "https://blog.iurchenkov.com";
for (const path of [
  "index.html",
  "about/index.html",
  "posts/index.html",
  "tags/index.html",
  "search/index.html",
]) {
  const html = await readFile(join("dist", path), "utf8");
  assert.match(html, /Andrei Iurchenkov/, path);
  assert.match(
    html,
    /rel="canonical" href="https:\/\/blog\.iurchenkov\.com\//,
    path
  );
  assert.doesNotMatch(html, /astro-paper\.pages\.dev|satna\.ing/);
}
const feed = await readFile("dist/rss.xml", "utf8");
assert.match(feed, /https:\/\/blog\.iurchenkov\.com/);
const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
assert.match(sitemap, /https:\/\/blog\.iurchenkov\.com\/posts\//);
assert.doesNotMatch(sitemap, /\/archives\/|\/404/);
assert.equal(
  (await readFile("dist/CNAME", "utf8")).trim(),
  "blog.iurchenkov.com"
);
assert.match(
  await readFile("dist/robots.txt", "utf8"),
  /Sitemap: https:\/\/blog\.iurchenkov\.com\/sitemap-index.xml/
);
assert(
  (await readdir("dist/pagefind")).includes("pagefind.js"),
  "Pagefind bundle missing"
);
const og = await readFile("dist/og.png");
assert.equal(og.readUInt32BE(16), 1200);
assert.equal(og.readUInt32BE(20), 630);

for (const filename of await readdir("src/content/posts")) {
  if (!/\.mdx?$/.test(filename)) continue;
  const source = await readFile(join("src/content/posts", filename), "utf8");
  if (!/^draft: true$/m.test(source)) continue;
  const slug = filename.replace(/\.mdx?$/, "");
  assert.doesNotMatch(sitemap + feed, new RegExp(`/posts/${slug}(?:/|<)`));
  await assert.rejects(
    access(join("dist/posts", slug)),
    `${slug}: draft route emitted`
  );
}

for (const path of await readdir("dist", { recursive: true })) {
  if (!path.endsWith(".html")) continue;
  const html = await readFile(join("dist", path), "utf8");
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(
      raw.replaceAll("&amp;", "&"),
      new URL(path.replace(/index\.html$/, ""), origin + "/")
    );
    if (url.origin !== origin || raw.startsWith("#")) continue;
    let target = join("dist", decodeURIComponent(url.pathname));
    const info = await stat(target).catch(() => null);
    if (!info || info.isDirectory()) target = join(target, "index.html");
    await assert.doesNotReject(
      access(target),
      `${path}: broken local URL ${raw}`
    );
  }
}
console.info(
  `Verified static pages, draft exclusion, metadata, RSS, sitemap, Pagefind, domain, and social image for ${origin}`
);
