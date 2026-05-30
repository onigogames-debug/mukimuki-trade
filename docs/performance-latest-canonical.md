# /performance/latest/ Canonical Policy

`/performance/latest/` は常に最新実績を表示する入口ページです。検索評価は日付固定URLへ集約するため、`latest/` は `noindex,follow` にします。

## Eleventy / Nunjucks Front Matter

```njk
---
layout: base.njk
title: 最新実績レポート
description: MUKIMUKI tradeの最新実績ページ。
permalink: /performance/latest/
robots: noindex,follow,max-image-preview:large
canonical: "{{ latestPerformanceUrl }}"
---
```

`latestPerformanceUrl` はビルド時に `scripts/latest-performance-url.mjs` の `findLatestPerformanceUrl()` で取得します。

## Jekyll Front Matter

```yaml
---
layout: default
title: 最新実績レポート
description: MUKIMUKI tradeの最新実績ページ。
permalink: /performance/latest/
robots: noindex,follow,max-image-preview:large
canonical: https://mukimuki-trade.com/performance/2026/05/29/
---
```

Jekyllではビルド前に最新日付URLを算出し、`canonical` に差し込みます。

## JavaScript Canonical Fallback

```html
<link id="dynamic-canonical" rel="canonical" href="https://mukimuki-trade.com/performance/2026/05/29/">
<script>
  (async () => {
    const response = await fetch('/datasets/performance-latest.json', { cache: 'no-store' });
    const data = await response.json();
    const [year, month, day] = data.latest.reportDate.split('-');
    document.getElementById('dynamic-canonical').href =
      `https://mukimuki-trade.com/performance/${year}/${month}/${day}/`;
  })();
</script>
```

HTML出力時点のcanonicalを正とし、JavaScriptは最新JSONとの差分がある場合の補助として扱います。

## Google Search Console対応

重複URL警告が出た場合:

1. `/performance/latest/` をURL検査し、`noindex,follow` と日付固定URLへのcanonicalを確認する。
2. 正規の日付固定URLをURL検査し、`index,follow` と自己参照canonicalを確認する。
3. 日付固定URLでインデックス登録をリクエストする。
4. `/performance/latest/` が検索結果に残る場合は、再クロール後の反映を待つ。
5. 古いURLが残る場合は、`/performance/` と `/performance/old/` の301を確認する。
