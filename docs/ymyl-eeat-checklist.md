# YMYL E-E-A-T Implementation Checklist

MUKIMUKI tradeは投資実績を扱うYMYLサイトとして、「誰が」「何を根拠に」「どこまでの情報か」「広告関係はあるか」をHTMLとJSON-LDの両方で明示する。

参考にした公式情報:

- 金融庁: 金融商品取引業者等向けの総合的な監督指針
- Google Search Central: Helpful, reliable, people-first content
- Google Search Central: Structured data general guidelines
- Google Search Central: Qualify outbound links

## 実績ページの信頼性バナー

```html
<section class="article-panel trust-signals" aria-labelledby="trust-signals-title">
  <h2 id="trust-signals-title">信頼性の確認</h2>
  <div class="fact-grid">
    <div class="fact-card">
      <h3>データソース</h3>
      <p>評価額、損益、取引件数、保有銘柄はAutotrade日次レポートをもとに掲載しています。</p>
      <blockquote>Source: Autotrade daily report / report_YYYY-MM-DD.txt</blockquote>
    </div>
    <div class="fact-card">
      <h3>著者と免責</h3>
      <p>運営者情報と投資情報の扱いを明示しています。掲載内容は投資助言ではありません。</p>
      <p><a href="/profile/" rel="author">運営者プロフィール</a> / <a href="/about/">免責事項</a></p>
    </div>
    <div class="fact-card">
      <h3>検証用リンク</h3>
      <p>日次ページは月次アーカイブへ保存し、最新の公開データも確認できるようにしています。</p>
      <p><a href="/performance/YYYY/MM/">月次アーカイブ</a> / <a href="/datasets/performance-latest.json">公開JSONデータ</a></p>
    </div>
  </div>
</section>
```

## 投資ブログのYMYL SEOチェックリスト

### 1. Person スキーマ実装

```json
{
  "@type": "Person",
  "@id": "https://mukimuki-trade.com/profile/#author",
  "name": "MUKIMUKI trade 編集部",
  "jobTitle": "兼業投資家・投資ブロガー",
  "knowsAbout": ["米国株投資", "自動売買", "AIエージェント", "株式トレード", "リスク管理"],
  "sameAs": ["https://x.com/OnigoGames"],
  "url": "https://mukimuki-trade.com/profile/"
}
```

### 2. 著者情報の全記事への紐付け

```html
<a href="/profile/" rel="author">運営者プロフィール</a>
```

```json
{
  "@type": "Article",
  "author": { "@id": "https://mukimuki-trade.com/profile/#author" }
}
```

### 3. 免責事項ページの独立URL

```html
<a href="/about/">運営方針・免責事項</a>
```

### 4. データソースの明記

```html
<blockquote>Source: Autotrade daily report / report_YYYY-MM-DD.txt</blockquote>
```

### 5. 更新日時の Article スキーマ反映

```json
{
  "@type": "Article",
  "datePublished": "2026-05-29T05:00:21+09:00",
  "dateModified": "2026-05-29T05:00:21+09:00"
}
```

### 6. 外部権威サイトへの参照リンク

```html
<a href="https://www.fsa.go.jp/" target="_blank" rel="noopener">金融庁</a>
<a href="https://www.fsa.go.jp/common/law/guide/kinyushohin/" target="_blank" rel="noopener">金融商品取引業者等向け監督指針</a>
```

### 7. アフィリエイト開示の明示

```html
<section id="affiliate-disclosure">
  <h2>アフィリエイト広告について</h2>
  <p>moomoo証券を含む広告リンク経由で申し込みが行われた場合、運営者が報酬を受け取ることがあります。</p>
  <a href="https://j.jp.moomoo.com/0BdcjG" target="_blank" rel="sponsored noopener">moomoo証券の紹介リンク</a>
</section>
```

### 8. 誤情報訂正プロセスの記載

```html
<section class="article-panel">
  <h2>訂正方針</h2>
  <p>掲載内容に誤りが判明した場合は、確認できた時点で本文または更新履歴に訂正内容を明記します。</p>
</section>
```

### 9. 投資勧誘ではないことの明記

```html
<p>掲載内容は情報提供を目的としており、特定銘柄の売買を推奨するものではありません。</p>
```

### 10. 投資判断の自己責任を明記

```html
<p>投資判断はご自身の責任のもとで行ってください。</p>
```

### 11. 実績の固定URL化

```html
<link rel="canonical" href="https://mukimuki-trade.com/performance/YYYY/MM/DD/">
```

### 12. ProfilePage スキーマで著者ページを明確化

```json
{
  "@type": "ProfilePage",
  "@id": "https://mukimuki-trade.com/profile/#webpage",
  "mainEntity": { "@id": "https://mukimuki-trade.com/profile/#author" },
  "publishedOn": { "@id": "https://mukimuki-trade.com/#website" }
}
```

### 13. WebPage + speakable を免責事項ページへ実装

```json
{
  "@type": ["WebPage", "AboutPage"],
  "@id": "https://mukimuki-trade.com/about/#webpage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["#disclaimer-summary", "#affiliate-disclosure", "#data-source-policy"]
  }
}
```

### 14. リスク説明を実績ページにも入れる

```html
<p>過去の実績は将来の成果を保証しません。株式投資には価格変動、為替変動、流動性などのリスクがあります。</p>
```

### 15. Xアカウントとの同一性を示す

```html
<a href="https://x.com/OnigoGames" target="_blank" rel="me noopener">公式X</a>
```
