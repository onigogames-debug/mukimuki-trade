# SEO Progress Report

Generated: 2026-06-02T12:34:13.886Z

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

- 対象ページ: 65
- インデックス対象ページ: 64
- 要確認ページ: 0
- FAQ schemaページ: 12
- パンくずschemaページ: 63
- Critical CSS適用ページ: 65

## 要確認ページ

現時点で自動監査上の重大な未実装項目はありません。

## ページ別詳細

| URL | title | description | 本文文字数 | 内部リンク | schema |
|---|---:|---:|---:|---:|---|
| / | 35 | 57 | 2710 | 41 | Person, WebSite |
| /about/ | 26 | 58 | 1800 | 19 | AboutPage, BreadcrumbList, FAQPage, WebPage |
| /archive/ | 24 | 62 | 1001 | 23 | BreadcrumbList, CollectionPage |
| /archive/2026-05/ | 27 | 79 | 1330 | 32 | BreadcrumbList, CollectionPage, ItemList |
| /archive/2026-06/ | 27 | 79 | 915 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /category/moomoo/ | 30 | 62 | 911 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /category/performance/ | 26 | 61 | 1921 | 31 | BreadcrumbList, CollectionPage, ItemList |
| /category/research/ | 26 | 57 | 1049 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /logic/ | 28 | 62 | 1038 | 27 | BreadcrumbList, CollectionPage |
| /logic/entry-risk/ | 49 | 52 | 1104 | 22 | Article, BreadcrumbList |
| /logic/exit-review/ | 51 | 48 | 1104 | 22 | Article, BreadcrumbList |
| /logic/signal-score/ | 50 | 57 | 1109 | 22 | Article, BreadcrumbList |
| /moomoo/ | 48 | 66 | 1320 | 23 | Article, BreadcrumbList, FAQPage |
| /performance/ | 45 | 70 | 1468 | 22 | Article, BreadcrumbList, FAQPage |
| /performance/2026/ | 30 | 52 | 1030 | 22 | BreadcrumbList, CollectionPage |
| /performance/2026/05/ | 41 | 62 | 1928 | 35 | BreadcrumbList, CollectionPage |
| /performance/2026/05/26/ | 47 | 61 | 2187 | 33 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/27/ | 52 | 66 | 2339 | 34 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/27/topics/xndu-rebuild/ | 53 | 83 | 2130 | 29 | Article, BreadcrumbList |
| /performance/2026/05/28/ | 53 | 66 | 2585 | 34 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/28/topics/asts-rotation/ | 52 | 84 | 2789 | 29 | Article, BreadcrumbList |
| /performance/2026/05/29/ | 53 | 67 | 2531 | 34 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/29/topics/bksy-range/ | 49 | 77 | 2923 | 29 | Article, BreadcrumbList |
| /performance/2026/05/30/topics/weekend-amzn-hold/ | 43 | 64 | 3065 | 29 | Article, BreadcrumbList |
| /performance/2026/05/31/topics/weekend-amzn-risk-check/ | 45 | 63 | 3156 | 29 | Article, BreadcrumbList |
| /performance/2026/06/ | 41 | 62 | 1440 | 29 | BreadcrumbList, CollectionPage |
| /performance/2026/06/01/ | 47 | 61 | 2264 | 33 | Article, BreadcrumbList, FAQPage |
| /performance/2026/06/01/topics/qbts-range/ | 44 | 69 | 3109 | 29 | Article, BreadcrumbList |
| /performance/latest/ (noindex) | 25 | 53 | 947 | 24 |  |
| /profile/ | 26 | 75 | 1373 | 21 | BreadcrumbList, FAQPage, Person, ProfilePage |
| /research/ | 25 | 59 | 1006 | 25 | Article, BreadcrumbList |
| /research/ai-infrastructure/ | 47 | 47 | 1794 | 25 | Article, BreadcrumbList, FAQPage |
| /research/app-software-fintech/ | 44 | 50 | 1809 | 25 | Article, BreadcrumbList, FAQPage |
| /research/frontier-growth/ | 47 | 49 | 1729 | 25 | Article, BreadcrumbList, FAQPage |
| /research/tag/alab/ | 30 | 65 | 1763 | 28 | BreadcrumbList, CollectionPage |
| /research/tag/amd/ | 29 | 64 | 1357 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/ampx/ | 30 | 65 | 1603 | 27 | BreadcrumbList, CollectionPage |
| /research/tag/amzn/ | 30 | 65 | 2146 | 31 | BreadcrumbList, CollectionPage |
| /research/tag/app/ | 29 | 64 | 1359 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/asts/ | 30 | 65 | 1449 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/avgo/ | 30 | 65 | 1369 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/bksy/ | 30 | 65 | 1611 | 26 | BreadcrumbList, CollectionPage |
| /research/tag/crdo/ | 30 | 65 | 1847 | 29 | BreadcrumbList, CollectionPage |
| /research/tag/googl/ | 31 | 66 | 1383 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/gsat/ | 30 | 65 | 1979 | 30 | BreadcrumbList, CollectionPage |
| /research/tag/hood/ | 30 | 65 | 1750 | 28 | BreadcrumbList, CollectionPage |
| /research/tag/meta/ | 30 | 65 | 1874 | 29 | BreadcrumbList, CollectionPage |
| /research/tag/msft/ | 30 | 65 | 1603 | 27 | BreadcrumbList, CollectionPage |
| /research/tag/mu/ | 28 | 63 | 1345 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/nvda/ | 30 | 65 | 1369 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/oklo/ | 30 | 65 | 1763 | 28 | BreadcrumbList, CollectionPage |
| /research/tag/pl/ | 28 | 63 | 1826 | 29 | BreadcrumbList, CollectionPage |
| /research/tag/qbts/ | 30 | 65 | 2140 | 31 | BreadcrumbList, CollectionPage |
| /research/tag/qubt/ | 30 | 65 | 1577 | 27 | BreadcrumbList, CollectionPage |
| /research/tag/rdw/ | 29 | 64 | 1431 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/rgti/ | 30 | 65 | 1425 | 25 | BreadcrumbList, CollectionPage |
| /research/tag/rivn/ | 30 | 65 | 1979 | 30 | BreadcrumbList, CollectionPage |
| /research/tag/rklb/ | 30 | 65 | 1704 | 28 | BreadcrumbList, CollectionPage |
| /research/tag/sats/ | 30 | 65 | 1979 | 30 | BreadcrumbList, CollectionPage |
| /research/tag/sofi/ | 30 | 65 | 2464 | 34 | BreadcrumbList, CollectionPage |
| /research/tag/soun/ | 30 | 65 | 2192 | 32 | BreadcrumbList, CollectionPage |
| /research/tag/spir/ | 30 | 65 | 1979 | 30 | BreadcrumbList, CollectionPage |
| /research/tag/tsla/ | 30 | 65 | 1710 | 28 | BreadcrumbList, CollectionPage |
| /research/tag/xndu/ | 30 | 65 | 1779 | 29 | BreadcrumbList, CollectionPage |
| /sitemap/ | 23 | 48 | 2886 | 75 | BreadcrumbList, CollectionPage |

