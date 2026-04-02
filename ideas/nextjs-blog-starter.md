# NextJS Blog Starter

## What It Is
A production-ready Next.js 14 blog starter with MDX support, full SEO optimization (Open Graph, Twitter cards, JSON-LD), automatic sitemap generation, RSS feed, and analytics integration (Plausible, Google Analytics, Vercel Analytics). Deployed on Vercel in one click. Zero runtime dependencies.

## Why It Doesn't Exist Well as Open Source
`next-mdx-remote`, `gatsby-plugin-mdx` exist but require significant setup. `velite` and `contentlayer` are great but have complex configurations. Most blog starters are either too simple (no SEO) or too complex (require 20 dependencies). There's no opinionated, batteries-included starter that just works.

## Developer Pain Point
Developers waste 2-3 days setting up a blog: MDX pipeline, syntax highlighting, SEO meta tags, sitemap, RSS, analytics. This starter eliminates that. Developers would clone it to launch a blog in 10 minutes that has every best practice built in.

## Suggested Tech Stack
- Next.js 14 with App Router and Server Components
- MDX via `next-mdx-remote` or `@next/mdx`
- Tailwind CSS for styling
- ` rehype-highlight` / `rehype-pretty-code` for syntax highlighting
- `next-sitemap` for sitemap
- RSS via `rss` package

## What's Close (GitHub repos to reference)
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) — the MDX library, not a blog starter
- [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) — excellent but complex, heavy dependencies
- [velite](https://github.com/velitejs/velite) — great content pipeline, requires custom setup

## What to Build (MVP Scope)
1. MDX blog with frontmatter (title, date, tags, excerpt)
2. Syntax highlighting with rehype-pretty-code
3. Auto-generated sitemap.xml and robots.txt
4. RSS feed at /feed.xml
5. SEO component with Open Graph, Twitter cards, JSON-LD
6. Analytics integration (Plausible as default, GA4 optional)
7. Table of contents generation
8. Reading time estimate

## Category
Template

## Status
[DONE]
