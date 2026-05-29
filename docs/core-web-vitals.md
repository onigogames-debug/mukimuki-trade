# Core Web Vitals 実装メモ

## 実績JSONの扱い

トップページの LCP には、ビルド時インライン化が最も有利です。HTMLの取得だけで最新実績の数字を描画できるため、`fetch()` の往復時間を待たずにファーストビューを作れます。

Service Worker キャッシュは、2回目以降の訪問やオフライン耐性に有効です。ただし初回訪問では Service Worker の登録前にHTMLを描画するため、LCP改善の主役にはなりません。

現在の方針:

- トップページ: `datasets/performance-latest.json` をビルド時に `window.__MUKIMUKI_PERFORMANCE__` へインライン化
- 動的更新・再訪問: `sw.js` で `/datasets/` と `/data/` を network-first キャッシュ

## Critical CSS

ファーストビューに必要なヘッダー、ヒーロー、主要ボタン、メインキャラクターだけを `critical.css` として `<head>` にインライン化します。残りの `styles.css` は preload したうえで、`media="print"` + `onload` で非同期に適用します。

## 画像

`scripts/optimize-images.mjs` が `assets/mukimuki-*.png` から WebP/AVIF の幅別バリアントを生成します。HTMLには `<picture>` を挿入し、ファーストビューのキャラクター画像だけ `fetchpriority="high"`、記事カードなど下部画像は `loading="lazy"` にします。
