# Deployment Status

Last updated: 2026-05-27

## GitHub

- Repository: https://github.com/onigogames-debug/mukimuki-trade
- Branch: `main`
- Remote: `https://github.com/onigogames-debug/mukimuki-trade.git`

## Cloudflare Pages

- Account: `onigo.games@gmail.com`
- Project: `mukimuki-trade`
- Production URL: https://mukimuki-trade.pages.dev
- Latest deployment URL: https://f1cb0f4e.mukimuki-trade.pages.dev
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
- Current sitemap URLs: 17
- Manual indexing requested: top page and `/performance/`

## SEO Enhancements

- Search favicon: `/assets/favicon.svg`
- RSS feed: `/feed.xml`
- Structured data: `WebSite`, `Blog`, `ItemList`, `BlogPosting`, `BreadcrumbList`, `AboutPage`, `Dataset`
- Article Open Graph metadata: locale, published time, modified time, section
- Category pages: `/category/performance/`, `/category/research/`, `/category/moomoo/`
- Archive pages: `/archive/`, `/archive/2026-05/`
- SEO generator: `npm run seo:generate` creates `sitemap.xml` and `feed.xml` from `data/content.json`
- Public performance dataset: `/datasets/performance-latest.json` and date-stamped JSON files
- Initial content expansion: 3 stock research articles and 3 trade logic articles
- Official X link: `https://x.com/OnigoGames`
- Top page banners: Official X and moomoo affiliate introduction as first-view promo banners
