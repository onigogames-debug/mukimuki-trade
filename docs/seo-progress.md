# SEO Progress Report

Generated: 2026-06-05T12:19:20.794Z

## 実装状況

| 項目 | 状態 | 確認方法 |
|---|---|---|
| 日付別実績URL | 完了 | `/performance/YYYY/MM/DD/` を生成 |
| 最新実績canonical | 完了 | `/performance/latest/` は日付固定URLへcanonical |
| sitemap.xml | 完了 | `npm run seo:generate` で自動生成 |
| image-sitemap.xml | 完了 | 各ページと代表AVIF画像を紐づけ |
| RSS feed | 完了 | `feed.xml` を自動生成 |
| JSON-LD | 完了 | Article / FAQPage / CollectionPage / BreadcrumbList |
| 内部リンク | 完了 | 関連記事と主要リンクを記事末尾・ヘッダー・フッターへ配置 |
| E-E-A-T | 完了 | `/profile/` とPerson schemaで運営者情報を公開 |
| moomoo紹介 | 完了 | トップ・記事・カテゴリにPRリンクを設置 |
| 画像SEO | 完了 | WebP/AVIF、picture、image sitemapを実装 |
| AI検索向け説明 | 完了 | `/llms.txt` を追加 |
| Core Web Vitals | 完了 | Critical CSS、画像最適化、実績データの初期表示を改善 |

## ページ監査サマリー

- 対象ページ: 79
- インデックス対象ページ: 78
- 要確認ページ: 0
- FAQ schemaページ: 15
- パンくずschemaページ: 77
- Critical CSS適用ページ: 79

## 要確認ページ

現時点で自動監査上の重大な未実装項目はありません。

## ページ別詳細

| URL | title | description | 本文文字数 | 内部リンク | schema |
|---|---:|---:|---:|---:|---|
| / | 35 | 57 | 2897 | 42 | Person, WebSite |
| /about/ | 26 | 58 | 1800 | 19 | AboutPage, BreadcrumbList, FAQPage, Person, WebPage, WebSite |
| /archive/ | 24 | 62 | 1012 | 23 | BreadcrumbList, CollectionPage, Person, WebSite |
| /archive/2026-05/ | 27 | 79 | 1330 | 32 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /archive/2026-06/ | 27 | 79 | 1331 | 27 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /category/moomoo/ | 30 | 62 | 911 | 23 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /category/performance/ | 26 | 61 | 2307 | 34 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /category/research/ | 26 | 57 | 1049 | 24 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /logic/ | 44 | 52 | 1046 | 27 | BreadcrumbList, CollectionPage, Person, WebSite |
| /logic/entry-risk/ | 48 | 41 | 1139 | 22 | Article, BreadcrumbList, Person, WebSite |
| /logic/exit-review/ | 44 | 38 | 1134 | 22 | Article, BreadcrumbList, Person, WebSite |
| /logic/signal-score/ | 46 | 43 | 1146 | 22 | Article, BreadcrumbList, Person, WebSite |
| /moomoo/ | 44 | 50 | 1313 | 23 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/ | 45 | 70 | 1468 | 22 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/ | 30 | 52 | 1029 | 22 | BreadcrumbList, CollectionPage, Person, WebSite |
| /performance/2026/05/ | 41 | 62 | 1928 | 35 | BreadcrumbList, CollectionPage, Person, WebSite |
| /performance/2026/05/26/ | 47 | 77 | 2369 | 34 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/27/ | 52 | 82 | 2577 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/27/topics/xndu-rebuild/ | 53 | 83 | 2389 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/28/ | 53 | 83 | 2972 | 37 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/28/topics/asts-rotation/ | 52 | 84 | 3045 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/29/ | 53 | 84 | 2930 | 37 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/29/topics/bksy-range/ | 49 | 77 | 3210 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/30/topics/weekend-amzn-hold/ | 43 | 64 | 3266 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/31/topics/weekend-amzn-risk-check/ | 45 | 63 | 3432 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/ | 41 | 62 | 1899 | 35 | BreadcrumbList, CollectionPage, Person, WebSite |
| /performance/2026/06/01/ | 47 | 77 | 2480 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/01/topics/qbts-range/ | 44 | 69 | 3399 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/02/ | 51 | 80 | 2703 | 36 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/02/topics/qbts-range/ | 52 | 73 | 3466 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/03/ | 42 | 72 | 2402 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/03/topics/soun-range/ | 49 | 78 | 3410 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/04/ | 52 | 82 | 2725 | 36 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/04/topics/rddt-range/ | 48 | 69 | 3658 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/latest/ (noindex) | 25 | 53 | 947 | 24 |  |
| /profile/ | 26 | 75 | 1373 | 21 | BreadcrumbList, FAQPage, Person, ProfilePage, WebSite |
| /research/ | 43 | 56 | 1086 | 25 | Article, BreadcrumbList, Person, WebSite |
| /research/ai-infrastructure/ | 56 | 57 | 2519 | 30 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /research/app-software-fintech/ | 44 | 50 | 2404 | 30 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /research/frontier-growth/ | 47 | 49 | 2316 | 30 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /research/tag/aapl/ | 30 | 65 | 1577 | 27 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/alab/ | 30 | 65 | 1763 | 28 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/amd/ | 29 | 64 | 1363 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/ampx/ | 30 | 65 | 1603 | 27 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/amzn/ | 30 | 65 | 2436 | 33 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/api/ | 29 | 64 | 1579 | 26 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/app/ | 29 | 64 | 1536 | 26 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/asts/ | 30 | 65 | 1566 | 26 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/avav/ | 30 | 65 | 1577 | 27 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/avgo/ | 30 | 65 | 1375 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/bksy/ | 30 | 65 | 1611 | 26 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/crdo/ | 30 | 65 | 2326 | 33 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/googl/ | 31 | 66 | 1383 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/gsat/ | 30 | 65 | 2423 | 34 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/hood/ | 30 | 65 | 2152 | 31 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/ionq/ | 30 | 65 | 1440 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/lunr/ | 30 | 65 | 1845 | 29 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/meta/ | 30 | 65 | 2012 | 30 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/msft/ | 30 | 65 | 1603 | 27 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/mu/ | 28 | 63 | 1351 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/nvda/ | 30 | 65 | 1855 | 29 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/oasys/ | 31 | 66 | 1463 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/oklo/ | 30 | 65 | 2340 | 33 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/peng/ | 30 | 65 | 1440 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/pl/ | 28 | 63 | 1826 | 29 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/qbts/ | 30 | 65 | 2843 | 37 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/qubt/ | 30 | 65 | 2165 | 32 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/rddt/ | 30 | 65 | 1551 | 26 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/rdw/ | 29 | 64 | 1831 | 29 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/rgti/ | 30 | 65 | 1425 | 25 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/rivn/ | 30 | 65 | 2410 | 34 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/rklb/ | 30 | 65 | 1704 | 28 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/sats/ | 30 | 65 | 2085 | 31 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/sofi/ | 30 | 65 | 3040 | 39 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/soun/ | 30 | 65 | 2722 | 36 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/spir/ | 30 | 65 | 2085 | 31 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/tsla/ | 30 | 65 | 1710 | 28 | BreadcrumbList, CollectionPage, Person, WebSite |
| /research/tag/xndu/ | 30 | 65 | 1779 | 29 | BreadcrumbList, CollectionPage, Person, WebSite |
| /sitemap/ | 23 | 48 | 3587 | 89 | BreadcrumbList, CollectionPage, Person, WebSite |

