# blog.iurchenkov.com

Andrei Iurchenkov's engineering blog at <https://blog.iurchenkov.com>.
Built from [AstroPaper 6.1.0](https://github.com/satnaing/astro-paper/tree/v6.1.0),
using Astro 7, TypeScript, and Bun. Output is entirely static.

## Local development

Use Bun **1.4.0**, matching `packageManager` and CI. No other package manager is needed.

```sh
bun install --frozen-lockfile
bun audit
bun --bun playwright install chromium
bun run dev
```

Playwright's Chromium renders Mermaid during builds. It is a build dependency;
no Mermaid runtime ships to readers. Astro downloads and self-hosts the theme's
fonts at build time. The first build needs network access.

```sh
bun run check          # Astro/TypeScript, lint, formatting
bun test               # Article scrolling transformation
bun run test:articles  # Isolated Markdown/MDX production build with feature assertions
bun run build          # Static pages plus Pagefind index in dist/
bun run verify         # Production metadata, links, feeds, and draft checks
bun run preview        # Preview dist, including working search
```

Search indexes the production build. Use `build` and `preview` to test it;
`dev` shows drafts for local authoring and does not regenerate the index.

## Writing articles

Articles live in `src/content/posts/`. Use Markdown for ordinary articles and
MDX for imports and custom components. A filename becomes a stable URL:
`src/content/posts/my-article.md` → `/posts/my-article/`.
Dates do not appear in URLs. Preserve filenames after publishing.

```yaml
---
title: An engineering note
description: A concise summary of the article.
pubDatetime: 2026-10-24T12:00:00Z
# modDatetime: 2026-10-25T12:00:00Z
tags:
  - filesystems
  - rust
draft: true
# featured: true
# cover: ./_assets/cover.png
# coverAlt: Describe the cover image.
# ogImage: ./_assets/social-preview.png
# canonicalURL: https://example.com/original-article/
---
```

`cover` is the optional visible article image. `ogImage` overrides the automatic
social preview. Canonical URLs are optional for republished work. New articles
default to Andrei Iurchenkov as author. Set `draft: false` to publish.
Future dates stay unpublished until a build at or after that time; GitHub Pages
needs a new push or manual workflow run to rebuild scheduled articles.

Drafts and future articles have no production page or social image and appear
in no production lists, tags, search index, RSS feed, or sitemap. Posts sort by
publication date, even when an older article is updated. The article list is
paginated, with previous/next navigation inside each article.

### Technical content

The unpublished [`technical-writing-demo.mdx`](src/content/posts/technical-writing-demo.mdx)
is a working reference. Preview it at `/posts/technical-writing-demo/` with `bun run dev`.

- Code fences accept Go, Rust, C, C++, Bash, Python, TypeScript, SQL, YAML, JSON,
  TOML, and other bundled Shiki languages. Line numbers are visual and do not
  enter copied code. Use `{2,4-6}` to highlight lines, `/word/` to highlight words,
  `file=main.go` to label a block, and comments such as `// [!code ++]`,
  `// [!code --]`, or `// [!code highlight]` for annotated diffs and emphasis.
- Mermaid fences render flowcharts, sequences, states, classes, and ER diagrams
  into light/dark SVG variants. Add `accTitle: ...` and `accDescr: ...` for
  accessibility. The site theme toggle switches the static variants.
- `$inline math$` and `$$` block equations use build-time KaTeX and local fonts.
- GFM tables, footnotes, blockquotes, and GitHub-style callouts such as
  `> [!NOTE]` work in both Markdown and MDX.
- Add `## Table of contents` where the generated, collapsible TOC should appear.
  Article headings also get permalink controls.
- Use relative Markdown image paths such as `![Description](./_assets/chart.svg)`.
  Astro processes local images. MDX can import images and use `<figure>` and
  `<figcaption>` for captions. Local SVG charts require no charting library.
- Tables, code, diagrams, and block equations scroll within the reading column
  on small screens. MDX may also use AstroPaper's `ResponsiveTable` component.

Use root-relative internal links, for example `/posts/habitpulse-part1/`.
Public canonical, RSS, sitemap, and social metadata use the production domain.

## Deployment

`.github/workflows/deploy.yml` checks pull requests and deploys pushes to
`master` or a manual `workflow_dispatch` on `master`. It uses the official
`withastro/action`, pinned Bun, Chromium for diagram rendering, and the GitHub
Pages artifact deployment action. Validation must pass before deployment.
Only the deploy job receives `pages: write` and `id-token: write`.

GitHub repository **Settings → Pages → Source** must be **GitHub Actions**.
Set the custom domain to `blog.iurchenkov.com` and enable **Enforce HTTPS**
once GitHub provisions the certificate. In the DNS zone for `iurchenkov.com`,
point the `blog` CNAME at `painhardcore.github.io`. Remove conflicting A/AAAA
records for this subdomain. `public/CNAME` and `public/.nojekyll` are included
in every deployment. No repository base path is needed with this custom domain.

## Migrated content

Six published articles and one unpublished interview draft were transferred
from [`painhardcore/yur-blog`](https://github.com/painhardcore/yur-blog/tree/master/src/content/blog).
Their `/posts/<slug>/` paths, publication dates, tags, and featured status are
preserved. Eleven referenced images are under `src/content/posts/_assets/imported/`.
Image paths, generic image descriptions, and malformed Markdown links were
repaired; the articles' prose and code remain the original author's work.
The old domain `yurchenkov.ru` needs redirects at its own host if it should
forward visitors to the new domain. GitHub Pages cannot redirect another host.

## Configuration

- `astro-paper.config.ts`: identity, links, pagination, and theme features.
- `astro.config.ts`: static build, Markdown pipeline, Shiki, sitemap, and fonts.
- `src/content.config.ts`: validated article metadata.
- `src/content/pages/about.md`: About page.
- `src/styles/theme.css`: AstroPaper color and font tokens.

The theme's MIT license is preserved in `LICENSE`. No analytics or tracking
scripts are included.

KaTeX and `postcss-selector-parser` have security overrides because the current
`rehype-katex` and Tailwind Typography releases require vulnerable older versions.
The article feature build verifies math rendering and the typography pipeline
against the patched versions. Revisit these overrides when the parent packages
adopt patched releases. CI runs `bun audit` before building or deploying.
