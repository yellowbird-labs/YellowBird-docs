# YellowBird docs

Documentation for YellowBird, the Go media pipeline. This repository is its own site. It is not a route inside `yellowbird-web`.

The public URL is [https://yellowbird.amaanworks.me/docs](https://yellowbird.amaanworks.me/docs). The app is built with `base: /docs`, so every page and asset already includes that prefix. A host in front of this build should serve the `dist` directory at that path.

The site is Astro 7 with Fumadocs, Tailwind 4, and MDX under `content/docs`. Static search is built at `/docs/api/search`. The ops page includes Mermaid diagrams. Content describes the Go API and worker (`github.com/dexisback/YellowBird`), the Next.js workspace, and the Terraform repo, without copying secrets from production.

![Overview](assets/overview.png)

![Architecture](assets/architecture.png)

![API](assets/api.png)

## What is in the sidebar

Order comes from `content/docs/meta.json`:

| Page | Slug |
| --- | --- |
| Overview | `/docs` |
| Run it locally | `/docs/run` |
| Architecture | `/docs/architecture` |
| Backend | `/docs/backend` |
| Web | `/docs/web` |
| Ops and cloud | `/docs/ops` |
| API | `/docs/api` |

## Deploy

Import this repo in Vercel as its own project. The build command is `npm run build`, the output directory is `dist`, and Node is 22.23.4 or newer (`engines` and `.nvmrc`). Do not attach `yellowbird.amaanworks.me` to this project. That host stays on `yellowbird-web`.

On Vercel the build moves those files under `dist/docs`, which is the path the HTML already requests. Opening the Vercel URL redirects `/` to `/docs`. The live project host is `https://yellow-bird-docs.vercel.app`.

The public URL stays `https://yellowbird.amaanworks.me/docs`. On `yellowbird-web`, proxy that path to this deployment (replace the host with the Vercel project URL):

```ts
async rewrites() {
  return [
    { source: '/docs', destination: 'https://yellow-bird-docs.vercel.app/docs' },
    { source: '/docs/:path*', destination: 'https://yellow-bird-docs.vercel.app/docs/:path*' },
  ];
}
```

Google reads `https://yellowbird.amaanworks.me/robots.txt` from the web app, not `/docs/robots.txt`. That file should allow `/docs/` and include `Sitemap: https://yellowbird.amaanworks.me/docs/sitemap-index.xml`. A normal link to `/docs` from the workspace nav is the internal link that ties the two sites together.

## Requirements

Node.js 22.23.4 or newer. Astro 7 refuses older 22.x releases. `.nvmrc` pins 22.23.4.

## Scripts

```bash
npm install
npm run dev
```

Dev server: [http://localhost:4321/docs](http://localhost:4321/docs).

```bash
npm run build
npm run preview
```

Both `dev` and `build` load `scripts/register-react-opts.mjs` first. Astro 7's static build imports a virtual `astro:react:opts` module that Node cannot resolve on its own. Preview does not need that loader.

## Add a page

Put an MDX file in `content/docs`. The frontmatter needs `title` and `description`. Add the slug to the `pages` array in `content/docs/meta.json`. The sidebar order is that array.

```mdx
---
title: Example
description: One sentence that can stand as the meta description.
---

The first paragraph should say what the page is for.
```

Internal links are relative (`./backend`). The site origin is `https://yellowbird.amaanworks.me` and the base is `/docs`, so a built link looks like `/docs/backend`.

## License

MIT. See [LICENSE](LICENSE).
