# SEO Progress Report

Generated: 2026-05-29T02:33:10.887Z

## 実装状況

| 項目 | 状態 | 確認方法 |
|---|---|---|
| 日付別実績URL | 完了 | `/performance/YYYY/MM/DD/` を生成 |
| 最新実績canonical | 完了 | `/performance/latest/` は日付固定URLへcanonical |
| sitemap.xml | 完了 | `npm run seo:generate` で自動生成 |
| image-sitemap.xml | 完了 | 各ページと代表AVIF画像を紐づけ |
| RSS feed | 完了 | `feed.xml` を自動生成 |
| JSON-LD | 完了 | Article / FAQPage / CollectionPage / BreadcrumbList |
| 内部リンク | 完了 | 関連記事と主要導線を記事末尾・ヘッダー・フッターへ配置 |
| E-E-A-T | 完了 | `/profile/` とPerson schemaで運営者情報を公開 |
| moomoo CVR導線 | 完了 | トップ・記事・カテゴリからPR導線を設置 |
| 画像SEO | 完了 | WebP/AVIF、picture、image sitemapを実装 |
| AI検索向け説明 | 完了 | `/llms.txt` を追加 |
| Core Web Vitals | 完了 | Critical CSS、画像最適化、実績JSONインライン化 |

## ページ監査サマリー

- 対象ページ: 25
- インデックス対象ページ: 24
- 要確認ページ: 0
- FAQ schemaページ: 7
- パンくずschemaページ: 24
- Critical CSS適用ページ: 25

## 要確認ページ

現時点で自動監査上の重大な未実装項目はありません。

## ページ別詳細

| URL | title | description | 本文文字数 | 内部リンク | schema |
|---|---:|---:|---:|---:|---|
| / | 35 | 57 | 2694 | 39 | Blog, ItemList, Organization, Person, WebSite |
| /about/ | 26 | 58 | 975 | 19 | AboutPage, BreadcrumbList, FAQPage |
| /archive/ | 24 | 62 | 925 | 22 | BreadcrumbList, CollectionPage |
| /archive/2026-05/ | 27 | 79 | 1046 | 29 | BreadcrumbList, CollectionPage, ItemList |
| /category/moomoo/ | 30 | 62 | 912 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /category/performance/ | 26 | 61 | 905 | 23 | BreadcrumbList, CollectionPage, ItemList |
| /category/research/ | 26 | 57 | 1060 | 24 | BreadcrumbList, CollectionPage, ItemList |
| /logic/ | 28 | 62 | 1069 | 26 | BreadcrumbList, CollectionPage, ItemList |
| /logic/entry-risk/ | 49 | 52 | 1363 | 24 | Article, BreadcrumbList |
| /logic/exit-review/ | 51 | 48 | 1367 | 24 | Article, BreadcrumbList |
| /logic/signal-score/ | 50 | 57 | 1363 | 24 | Article, BreadcrumbList |
| /moomoo/ | 48 | 66 | 1336 | 23 | Article, BreadcrumbList, FAQPage |
| /performance/ | 45 | 70 | 1512 | 25 | Article, BreadcrumbList, Dataset, FAQPage |
| /performance/2026-05-27-xndu-rebuild/ | 53 | 83 | 2023 | 24 | Article, BreadcrumbList |
| /performance/2026-05-28-asts-rotation/ | 52 | 84 | 2716 | 24 | Article, BreadcrumbList |
| /performance/2026/05/ | 32 | 61 | 988 | 25 | BreadcrumbList, CollectionPage, ItemList |
| /performance/2026/05/26/ | 30 | 61 | 1916 | 27 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/27/ | 35 | 66 | 2029 | 27 | Article, BreadcrumbList, FAQPage |
| /performance/2026/05/28/ | 36 | 66 | 2243 | 27 | Article, BreadcrumbList, FAQPage |
| /performance/latest/ (noindex) | 25 | 72 | 521 | 20 | BreadcrumbList, CollectionPage, ItemList |
| /profile/ | 26 | 75 | 1375 | 21 | BreadcrumbList, FAQPage, Person, ProfilePage |
| /research/ | 25 | 59 | 1034 | 25 | Article, BreadcrumbList |
| /research/ai-infrastructure/ | 47 | 47 | 1505 | 24 | Article, BreadcrumbList |
| /research/app-software-fintech/ | 44 | 50 | 1533 | 24 | Article, BreadcrumbList |
| /research/frontier-growth/ | 47 | 49 | 1470 | 24 | Article, BreadcrumbList |

