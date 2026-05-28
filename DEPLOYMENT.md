# Deployment Status

Last updated: 2026-05-29

## GitHub

- Repository: https://github.com/onigogames-debug/mukimuki-trade
- Branch: `main`
- Remote: `https://github.com/onigogames-debug/mukimuki-trade.git`

## Cloudflare Pages

- Account: `onigo.games@gmail.com`
- Project: `mukimuki-trade`
- Production URL: https://mukimuki-trade.pages.dev
- Latest deployment URL: https://1625e8b0.mukimuki-trade.pages.dev
- Deployment method: Wrangler direct upload

## Custom Domains

Added to Cloudflare Pages:

- `mukimuki-trade.com` - active / SSL enabled
- `www.mukimuki-trade.com` - active / SSL enabled

Current DNS setup:

- Registrar: お名前.com
- Nameservers: `ursula.ns.cloudflare.com`, `wesley.ns.cloudflare.com`
- `mukimuki-trade.com` CNAME: `mukimuki-trade.pages.dev` (proxied)
- `www.mukimuki-trade.com` CNAME: `mukimuki-trade.pages.dev`

Public verification:

- `https://mukimuki-trade.com` returns `HTTP/2 200`
- `https://www.mukimuki-trade.com` returns `HTTP/2 200`

## Remaining Action

No domain action remains. Both apex and `www` custom domains return `HTTP/2 200`.

## Google Search Console

- Property: `https://mukimuki-trade.com/`
- Verification: HTML file (`googlefd5cf11d7eb2c415.html`)
- Sitemap submitted: `https://mukimuki-trade.com/sitemap.xml`
- RSS feed submitted as sitemap: `https://mukimuki-trade.com/feed.xml` (success)
- Current sitemap URLs: 24
- Manual indexing requested: top page and `/performance/`

## SEO Enhancements

- Search favicon: `/assets/favicon.svg`
- RSS feed: `/feed.xml`
- Structured data: `WebSite`, `Person`, `Article`, `FAQPage`, `CollectionPage`, `BreadcrumbList`, `ItemList`, `AboutPage`, `Dataset`
- Trust structured data: `ProfilePage`, `Person`, `FAQPage`
- Article Open Graph metadata: locale, published time, modified time, section
- Category pages: `/category/performance/`, `/category/research/`, `/category/moomoo/`
- Archive pages: `/archive/`, `/archive/2026-05/`
- SEO generator: `npm run seo:generate` creates `sitemap.xml` and `feed.xml` from `data/content.json`
- JSON-LD generator: `scripts/structured-data.mjs` builds schema from YAML front matter and renders `<script type="application/ld+json">`
- Performance page generator: `npm run performance:pages` creates `/performance/YYYY/MM/DD/`, `/performance/YYYY/MM/`, and `/performance/latest/` from date-stamped performance JSON
- Performance redirect: `/performance/` returns `301` to the latest fixed daily URL, currently `/performance/2026/05/28/`
- Public performance dataset: `/datasets/performance-latest.json` and date-stamped JSON files
- Daily update for 2026-05-27 EST: `/performance/` refreshed and `/performance/2026-05-27-xndu-rebuild/` added
- Daily update for 2026-05-28 EST: `/performance/` refreshed and `/performance/2026-05-28-asts-rotation/` added
- Initial content expansion: 3 stock research articles and 3 trade logic articles
- Official X link: `https://x.com/OnigoGames`
- Top page banners: Official X and moomoo affiliate introduction as first-view promo banners
- Mobile header: hamburger menu is enabled on smartphone widths for improved navigation visibility
- E-E-A-T page: `/profile/` discloses operator policy, data sources, advertising policy, and investment disclaimer
- Author profile: 40s Tokyo Minato-based part-time investor, nearly 20 years of investing, AI agents, automated trading, and business development focus
- Thin content mitigation: `/performance/` expanded with interpretation, next checks, data verification links, and FAQ
- Affiliate CVR page: `/moomoo/` rewritten as a reader-first guide with use cases, pros/cons, comparison points, disclosure, and FAQ
- Internal link design: top, profile, performance, moomoo, archive, category, dataset, and policy pages cross-link key reader journeys

## AI Crawler Access

- Cloudflare AI Crawl Control: `Block AI training bots` is set to `Do not block (allow crawlers)`.
- Reason: Claude-User / ClaudeBot returned `HTTP/2 403` on the custom domain while Pages direct URLs returned `HTTP/2 200`.
- Verification after change: ClaudeBot, Claude-User, Claude-SearchBot, GPTBot, and Googlebot return `200` on `https://mukimuki-trade.com/`.
