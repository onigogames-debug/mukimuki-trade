# SEO Progress Report

Generated: 2026-06-11T22:58:16.060Z

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

- 対象ページ: 92
- インデックス対象ページ: 91
- 要確認ページ: 0
- FAQ schemaページ: 18
- パンくずschemaページ: 90
- Critical CSS適用ページ: 92

## 要確認ページ

現時点で自動監査上の重大な未実装項目はありません。

## ページ別詳細

| URL | title | description | 本文文字数 | 内部リンク | schema |
|---|---:|---:|---:|---:|---|
| / | 41 | 68 | 2977 | 43 | Person, WebSite |
| /about/ | 26 | 58 | 1800 | 19 | AboutPage, BreadcrumbList, FAQPage, Person, WebPage, WebSite |
| /archive/ | 24 | 62 | 1034 | 24 | BreadcrumbList, CollectionPage, Person, WebSite |
| /archive/2026-05/ | 27 | 79 | 1330 | 32 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /archive/2026-06/ | 27 | 79 | 1888 | 32 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /category/moomoo/ | 30 | 62 | 911 | 23 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /category/performance/ | 26 | 61 | 2836 | 38 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /category/research/ | 26 | 57 | 1049 | 24 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /logic/ | 44 | 52 | 1046 | 27 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /logic/entry-risk/ | 48 | 41 | 1139 | 22 | Article, BreadcrumbList, Person, WebSite |
| /logic/exit-review/ | 44 | 38 | 1134 | 22 | Article, BreadcrumbList, Person, WebSite |
| /logic/signal-score/ | 46 | 43 | 1146 | 22 | Article, BreadcrumbList, Person, WebSite |
| /moomoo/ | 44 | 50 | 1313 | 23 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/ | 44 | 58 | 1088 | 33 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /performance/2026/ | 30 | 52 | 1027 | 22 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /performance/2026/05/ | 41 | 62 | 1928 | 35 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /performance/2026/05/26/ | 47 | 77 | 2367 | 34 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/27/ | 52 | 82 | 2594 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/27/topics/xndu-rebuild/ | 53 | 83 | 2406 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/28/ | 53 | 83 | 2972 | 37 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/28/topics/asts-rotation/ | 52 | 84 | 3045 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/29/ | 53 | 84 | 2930 | 37 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/05/29/topics/bksy-range/ | 49 | 77 | 3210 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/30/topics/weekend-amzn-hold/ | 43 | 64 | 3266 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/05/31/topics/weekend-amzn-risk-check/ | 45 | 63 | 3432 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/ | 41 | 62 | 2398 | 43 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /performance/2026/06/01/ | 47 | 77 | 2480 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/01/topics/qbts-range/ | 44 | 69 | 3399 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/02/ | 51 | 80 | 2703 | 36 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/02/topics/qbts-range/ | 52 | 73 | 3466 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/03/ | 42 | 72 | 2309 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/03/topics/soun-range/ | 49 | 78 | 3410 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/04/ | 52 | 82 | 2761 | 37 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/04/topics/rddt-range/ | 48 | 69 | 3773 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/05/ | 43 | 73 | 2004 | 31 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/05/topics/peng-range/ | 48 | 74 | 3369 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/06/topics/weekend-no-position-check/ | 45 | 78 | 3222 | 29 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/07/topics/weekend-reset-check/ | 49 | 84 | 3293 | 29 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/08/ | 46 | 75 | 2433 | 35 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/08/topics/ionq-range/ | 50 | 81 | 3847 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/09/topics/rddt-overnight-check/ | 49 | 95 | 4183 | 30 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/10/ | 52 | 79 | 2594 | 36 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/10/topics/crdo-range/ | 47 | 87 | 4036 | 34 | Article, BreadcrumbList, Person, WebSite |
| /performance/2026/06/11/ | 42 | 68 | 1904 | 34 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /performance/2026/06/11/topics/gsat-hold-check/ | 44 | 74 | 3452 | 32 | Article, BreadcrumbList, Person, WebSite |
| /performance/latest/ (noindex) | 25 | 53 | 945 | 24 |  |
| /profile/ | 26 | 75 | 1373 | 21 | BreadcrumbList, FAQPage, Person, ProfilePage, WebSite |
| /research/ | 43 | 56 | 1086 | 25 | Article, BreadcrumbList, Person, WebSite |
| /research/ai-infrastructure/ | 56 | 57 | 2527 | 30 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /research/app-software-fintech/ | 44 | 50 | 2405 | 30 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /research/frontier-growth/ | 47 | 49 | 2296 | 30 | Article, BreadcrumbList, FAQPage, Person, WebSite |
| /research/tag/aapl/ | 30 | 65 | 1884 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/ai/ | 28 | 63 | 1442 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/alab/ | 30 | 65 | 1922 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/amd/ | 29 | 64 | 1363 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/ampx/ | 30 | 65 | 1603 | 27 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/amzn/ | 30 | 65 | 2914 | 37 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/api/ | 29 | 64 | 2043 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/app/ | 29 | 64 | 1832 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/asts/ | 30 | 65 | 1566 | 26 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/avav/ | 30 | 65 | 1726 | 28 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/avgo/ | 30 | 65 | 1375 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/bksy/ | 30 | 65 | 1611 | 26 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/crdo/ | 30 | 65 | 2629 | 35 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/googl/ | 31 | 66 | 1383 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/gsat/ | 30 | 65 | 3054 | 40 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/hood/ | 30 | 65 | 2782 | 36 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/ionq/ | 30 | 65 | 1745 | 27 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/lunr/ | 30 | 65 | 1845 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/meta/ | 30 | 65 | 2339 | 33 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/msft/ | 30 | 65 | 1603 | 27 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/mu/ | 28 | 63 | 1351 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/nvda/ | 30 | 65 | 1855 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/nvts/ | 30 | 65 | 1602 | 26 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/oasys/ | 31 | 66 | 1463 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/oklo/ | 30 | 65 | 2340 | 33 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/peng/ | 30 | 65 | 1899 | 28 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/pl/ | 28 | 63 | 1826 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/qbts/ | 30 | 65 | 3145 | 39 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/qubt/ | 30 | 65 | 2165 | 32 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/rddt/ | 30 | 65 | 2035 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/rdw/ | 29 | 64 | 1985 | 30 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/rgti/ | 30 | 65 | 1425 | 25 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/rivn/ | 30 | 65 | 2554 | 35 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/rklb/ | 30 | 65 | 1704 | 28 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/sats/ | 30 | 65 | 2085 | 31 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/sofi/ | 30 | 65 | 3187 | 40 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/soun/ | 30 | 65 | 2722 | 36 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/spir/ | 30 | 65 | 2085 | 31 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/tsla/ | 30 | 65 | 1710 | 28 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /research/tag/xndu/ | 30 | 65 | 1779 | 29 | BreadcrumbList, CollectionPage, ItemList, Person, WebSite |
| /sitemap/ | 23 | 48 | 4436 | 102 | BreadcrumbList, CollectionPage, Person, WebSite |

