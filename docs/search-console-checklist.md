# Search Console Checklist

## Latest Browser Check

Checked in the logged-in Chrome profile `GAMES ONIGO (onigo.games@gmail.com)` on 2026-06-02.

Property:

- URL prefix property `https://mukimuki-trade.com/` is accessible.
- Domain property `sc-domain:mukimuki-trade.com` is not accessible from this Google account.

Current Search Console state:

| Report | Observed state |
|---|---|
| Search performance | 0 clicks / 0 impressions over the last 3 months |
| Page indexing | 2 indexed pages / 24 not indexed pages |
| Not indexed reasons | `Discovered - currently not indexed`: 23, `Crawled - currently not indexed`: 1 |
| Sitemap `/sitemap.xml` | Success, last read 2026-06-01, 57 discovered pages |
| RSS `/feed.xml` | Success, last read 2026-06-02, 17 discovered pages |
| Breadcrumbs | 1 valid item / 0 invalid items |
| HTTPS | 3 HTTPS URLs / 0 non-HTTPS URLs |
| Core Web Vitals | Not enough Chrome UX Report traffic data for mobile or desktop |

Recovery action completed:

- `/sitemap.xml` was resubmitted in Search Console on 2026-06-02.

Recommended recovery actions:

- Resubmit `/sitemap.xml` after future SEO deployments until Search Console catches up with the current sitemap URL count.
- Use URL Inspection for the top page, latest fixed daily page, the newest topic page, the newest month archive, and the most important ticker hub.
- Do not treat `Discovered - currently not indexed` as a code defect while the site is new; prioritize stronger monthly archives, ticker hubs, and internal links.

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
