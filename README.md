# MUKIMUKI trade

株式投資の実績公開、銘柄研究、相場雑談、証券会社アフィリエイト導線を持つ静的サイトです。

## ローカル確認

```sh
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173/` を開きます。

## SEOファイル生成

```sh
npm run seo:generate
```

`data/content.json` をもとに `sitemap.xml` と `feed.xml` を生成します。記事やカテゴリを増やすときは、ページ作成後にこのコマンドを実行します。

## 記事生成

```sh
npm run articles:generate
```

`data/articles.json` をもとに、銘柄検討と投資ロジックの個別記事ページを生成します。記事本文を更新したら、このコマンドを実行してからSEOファイルを再生成します。

## 実績ページ生成

```sh
npm run performance:pages
```

`datasets/performance-YYYY-MM-DD.json` をもとに、日付固定の実績ページ、月次アーカイブ、最新実績ページを生成します。`/performance/` はCloudflare Pagesの `_redirects` で最新の日付固定URLへ301リダイレクトします。

```text
performance/
├── latest/
│   └── index.html
├── 2026/
│   └── 05/
│       ├── index.html
│       ├── 26/
│       │   └── index.html
│       ├── 27/
│       │   └── index.html
│       └── 28/
│           └── index.html
├── 2026-05-27-xndu-rebuild/
│   └── index.html
└── 2026-05-28-asts-rotation/
    └── index.html
```

## JSON-LD構造化データ

`scripts/structured-data.mjs` で、YAMLフロントマター形式のメタ情報から `application/ld+json` を生成します。記事生成ではこのモジュールを使い、記事ページは `Article`、一覧ページは `CollectionPage`、パンくずがあるページは `BreadcrumbList` を `<head>` 内に出力します。

```js
import { parseFrontMatter, renderJsonLdScript } from './scripts/structured-data.mjs';

const { frontMatter } = parseFrontMatter(markdownSource);
const jsonLdScript = renderJsonLdScript(frontMatter);
```

## 実績データ更新

```sh
npm run performance:import
```

`../../moomoo/reports` の最新Autotradeレポートを読み取り、`data/performance.json` と `datasets/performance-latest.json` を生成します。実績更新後は `npm run performance:pages`、`npm run seo:generate` の順に実行してから公開作業を行います。

## GitHub

- GitHub account: `onigogames-debug`
- Repository name: `mukimuki-trade`
- Default branch: `main`
- Repository URL: https://github.com/onigogames-debug/mukimuki-trade

## Cloudflare Pages

- Cloudflare account: `onigo.games@gmail.com`
- Project name: `mukimuki-trade`
- Production branch: `main`
- Framework preset: `None`
- Build command: 空欄
- Build output directory: `/`
- Production URL: https://mukimuki-trade.com

## Custom Domain

- Primary: `mukimuki-trade.com`
- Redirect: `www.mukimuki-trade.com` -> `mukimuki-trade.com` after Cloudflare SSL activation

Current deployment status is tracked in [DEPLOYMENT.md](DEPLOYMENT.md).

## 公開前チェック

- Search Console: `https://mukimuki-trade.com/` を登録済み、`sitemap.xml` 送信済み
- SEO: favicon、RSS、パンくず構造化データ、Dataset構造化データ、カテゴリページ、月次アーカイブ、記事メタ情報を実装済み
- Analytics: Google Analytics / Cloudflare Web Analytics を必要に応じて追加する
- 運営情報: 実名・連絡先を公開する場合は `/about/` に追記する
