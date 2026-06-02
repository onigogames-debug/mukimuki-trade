# Search Console Checklist

## URL Inspection

Check these URLs after each SEO deployment:

| URL | Expected result |
|---|---|
| `https://mukimuki-trade.com/` | Indexed, canonical is self |
| `https://mukimuki-trade.com/performance/latest/` | Excluded by `noindex`, canonical points to latest fixed daily URL |
| `https://mukimuki-trade.com/performance/2026/06/01/` | Indexed, canonical is self |
| `https://mukimuki-trade.com/performance/2026/06/01/topics/qbts-range/` | Indexed, canonical is self |
| `https://mukimuki-trade.com/performance/2026-06-01-qbts-range/` | Redirected by 301 to the hierarchical topic URL |
| `https://mukimuki-trade.com/performance/2026/06/` | Indexed, internal links point to daily and topic URLs |
| `https://mukimuki-trade.com/research/tag/qubt/` | Indexed, ticker hub links to related performance and topic pages |

## Sitemap

- Submit `https://mukimuki-trade.com/sitemap.xml`.
- Confirm `/performance/latest/` is not listed.
- Confirm hierarchical topic URLs are listed.
- Confirm ticker hub pages under `/research/tag/` are listed.

## Rich Results

Use Google's Rich Results Test for:

- Daily performance pages: `Article`, `FAQPage`, `BreadcrumbList`
- Trade topic pages: `Article`, `BreadcrumbList`
- Research pages: `Article`, `FAQPage`, `BreadcrumbList`
- Profile page: `Person`, `ProfilePage`

## Crawl Checks

Run these header checks after deployment:

```bash
curl -I https://mukimuki-trade.com/performance/latest/
curl -I https://mukimuki-trade.com/performance/2026/06/01/
curl -I https://mukimuki-trade.com/performance/2026-06-01-qbts-range/
curl -I https://mukimuki-trade.com/research/tag/qubt/
```

Expected:

- `/performance/latest/` returns `X-Robots-Tag: noindex`.
- Fixed daily, topic, and ticker hub URLs do not return `X-Robots-Tag: noindex`.
- Legacy topic URLs return `301`.

