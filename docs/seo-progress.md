# SEO Progress Report

Generated: 2026-06-01T23:20:25.838Z

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

- 対象ページ: 64
- インデックス対象ページ: 63
- 要確認ページ: 0
- FAQ schemaページ: 12
- パンくずschemaページ: 63
- Critical CSS適用ページ: 64

## 要確認ページ

現時点で自動監査上の重大な未実装項目はありません。

## ページ別詳細

| URL | title | description | 本文文字数 | 内部リンク | schema |
|---|---:|---:|---:|---:|---|
| / | 35 | 57 | 2703 | 40 | Blog, ItemList, Organization, Person, WebSite |
| /about/ | 26 | 58 | 1800 | 19 | AboutPage, BreadcrumbList, FAQPage, WebPage |
| /archive/ | 24 | 62 | 1001 | 23 | BreadcrumbList, CollectionPage |
| /archive/2026-05/ | 27 | 79 | 1330 | 32 | BreadcrumbList, CollectionPage, ItemList |
| /archive/2026-06/ | 27 | 79 | 915 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /category/moomoo/ | 30 | 62 | 911 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /category/performance/ | 26 | 61 | 1921 | 31 | BreadcrumbList, CollectionPage, ItemList |
| /category/research/ | 26 | 57 | 1049 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /logic/ | 28 | 62 | 1031 | 26 | BreadcrumbList, CollectionPage, ItemList |
| /logic/entry-risk/ | 49 | 52 | 1307 | 24 | Article, BreadcrumbList |
| /logic/exit-review/ | 51 | 48 | 1310 | 24 | Article, BreadcrumbList |
| /logic/signal-score/ | 50 | 57 | 1309 | 24 | Article, BreadcrumbList |
| /moomoo/ | 48 | 66 | 1320 | 23 | Article, BreadcrumbList, FAQPage |
| /performance/ | 45 | 70 | 1468 | 22 | Article, BreadcrumbList, FAQPage |
| /performance/2026-05-27-xndu-rebuild/ | 53 | 83 | 2094 | 24 | Article, BreadcrumbList |
| /performance/2026-05-28-asts-rotation/ | 52 | 84 | 2753 | 24 | Article, BreadcrumbList |
| /performance/2026-05-29-bksy-range/ | 49 | 77 | 2887 | 24 | Article, BreadcrumbList |
| /performance/2026-05-30-weekend-amzn-hold/ | 43 | 64 | 3029 | 24 | Article, BreadcrumbList |
| /performance/2026-05-31-weekend-amzn-risk-check/ | 45 | 63 | 3155 | 24 | Article, BreadcrumbList |
| /performance/2026-06-01-qbts-range/ | 44 | 69 | 3074 | 24 | Article, BreadcrumbList |
| /performance/2026/ | 30 | 52 | 1032 | 21 | BreadcrumbList, CollectionPage, ItemList |
| /performance/2026/05/ | 41 | 62 | 1395 | 31 | BreadcrumbList, CollectionPage, ItemList |
| /performance/2026/05/26/ | 47 | 61 | 2184 | 31 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/27/ | 52 | 66 | 2336 | 32 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/28/ | 53 | 66 | 2544 | 32 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/29/ | 53 | 67 | 2531 | 32 | Article, BreadcrumbList, FAQPage |
| /performance/2026/06/ | 41 | 62 | 941 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /performance/2026/06/01/ | 47 | 61 | 2260 | 31 | Article, BreadcrumbList, FAQPage |
| /performance/latest/ (noindex) | 25 | 53 | 941 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /profile/ | 26 | 75 | 1373 | 21 | BreadcrumbList, FAQPage, Person, ProfilePage |
| /research/ | 25 | 59 | 1006 | 25 | Article, BreadcrumbList |
| /research/ai-infrastructure/ | 47 | 47 | 1788 | 24 | Article, BreadcrumbList, FAQPage |
| /research/app-software-fintech/ | 44 | 50 | 1816 | 24 | Article, BreadcrumbList, FAQPage |
| /research/frontier-growth/ | 47 | 49 | 1733 | 24 | Article, BreadcrumbList, FAQPage |
| /research/tag/alab/ | 30 | 65 | 1287 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/amd/ | 29 | 64 | 954 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/ampx/ | 30 | 65 | 1126 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/amzn/ | 30 | 65 | 1677 | 28 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/app/ | 29 | 64 | 954 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/asts/ | 30 | 65 | 1023 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/avgo/ | 30 | 65 | 962 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/bksy/ | 30 | 65 | 1174 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/crdo/ | 30 | 65 | 1365 | 26 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/googl/ | 31 | 66 | 970 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/gsat/ | 30 | 65 | 1516 | 27 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/hood/ | 30 | 65 | 1277 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/meta/ | 30 | 65 | 1387 | 26 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/msft/ | 30 | 65 | 1126 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/mu/ | 28 | 63 | 946 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/nvda/ | 30 | 65 | 962 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/oklo/ | 30 | 65 | 1287 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/pl/ | 28 | 63 | 1350 | 26 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/qbts/ | 30 | 65 | 1677 | 28 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/qubt/ | 30 | 65 | 1104 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/rdw/ | 29 | 64 | 1005 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/rgti/ | 30 | 65 | 1000 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/rivn/ | 30 | 65 | 1516 | 27 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/rklb/ | 30 | 65 | 1221 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/sats/ | 30 | 65 | 1516 | 27 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/sofi/ | 30 | 65 | 1911 | 30 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/soun/ | 30 | 65 | 1650 | 28 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/spir/ | 30 | 65 | 1516 | 27 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/tsla/ | 30 | 65 | 1222 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /research/tag/xndu/ | 30 | 65 | 1230 | 25 | BreadcrumbList, CollectionPage, ItemList |

