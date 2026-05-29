# YMYL E-E-A-T Implementation Checklist

MUKIMUKI tradeは投資実績を扱うため、YMYL領域として「誰が、何を根拠に、どの範囲で発信しているか」をページ内と構造化データの両方で明示する。

参考にした公式方針:

- Google Search Central: Helpful, reliable, people-first content
- Google Search Central: Structured data general guidelines
- Google Search Central: Qualify outbound links

## 実績ページに追加する信頼性シグナル

### 1. データソースの明示

```html
<section class="article-panel trust-signals" aria-labelledby="trust-signals-title">
  <h2 id="trust-signals-title">この実績データの確認方法</h2>
  <div class="fact-card">
    <h3>データソース</h3>
    <p>評価額、損益、取引件数、保有銘柄はAutotrade日次レポートをもとに掲載しています。</p>
    <blockquote>Source: Autotrade daily report / report_YYYY-MM-DD.txt</blockquote>
  </div>
</section>
```

### 2. 公開JSONデータへのリンク

```html
<p>
  <a href="/datasets/performance-YYYY-MM-DD.json">この日のJSONデータを見る</a>
</p>
```

### 3. 更新履歴とアーカイブ導線

```html
<p>
  日次ページは月次アーカイブに蓄積します。
  <a href="/performance/YYYY/MM/">月次アーカイブを見る</a>
</p>
```

### 4. 運営者プロフィールへの著者リンク

```html
<p>
  運営者情報は <a href="/profile/" rel="author">プロフィール</a> で公開しています。
</p>
```

## 投資YMYL SEOチェックリスト

### 1. 著者プロフィールを全ページからリンク

```html
<a href="/profile/" rel="author">運営者プロフィール</a>
```

### 2. Person schemaをプロフィールページに設置

```json
{
  "@type": "Person",
  "@id": "https://mukimuki-trade.com/profile/#author",
  "name": "MUKIMUKI trade編集部",
  "jobTitle": "兼業投資家 / 事業開発",
  "sameAs": ["https://x.com/OnigoGames"]
}
```

### 3. ProfilePage schemaで著者ページを明確化

```json
{
  "@type": "ProfilePage",
  "@id": "https://mukimuki-trade.com/profile/#webpage",
  "mainEntity": { "@id": "https://mukimuki-trade.com/profile/#author" }
}
```

### 4. 投資助言ではないことを明記

```html
<p>掲載内容は情報提供を目的としたもので、特定銘柄の売買を推奨するものではありません。</p>
```

### 5. 金融商品取引法上の立場を明記

```html
<p>当サイトは金融商品取引法上の投資助言・代理業、投資運用業、または投資勧誘を目的としたものではありません。</p>
```

### 6. 広告・PRリンクを明記

```html
<a href="https://j.jp.moomoo.com/0BdcjG" target="_blank" rel="sponsored noopener">moomoo証券の紹介リンク</a>
```

### 7. 広告方針を免責ページに集約

```html
<p>広告リンク経由で申し込みが行われた場合、運営者が報酬を受け取ることがあります。</p>
```

### 8. 実績データの元ソースを記載

```html
<blockquote>Source: Autotrade daily report / jp_account_mix_report.csv</blockquote>
```

### 9. 公開データを検証可能にする

```html
<link rel="alternate" type="application/json" href="/datasets/performance-YYYY-MM-DD.json">
```

### 10. 過去実績を固定URLに保存

```html
<link rel="canonical" href="https://mukimuki-trade.com/performance/YYYY/MM/DD/">
```

### 11. 更新日時を明示

```html
<time datetime="2026-05-29T08:00:00+09:00">2026年5月29日更新</time>
```

### 12. Article schemaに著者と更新日時を入れる

```json
{
  "@type": "Article",
  "datePublished": "2026-05-29T08:00:00+09:00",
  "dateModified": "2026-05-29T08:00:00+09:00",
  "author": { "@id": "https://mukimuki-trade.com/profile/#author" }
}
```

### 13. リスク説明を実績ページにも入れる

```html
<p>過去の実績は将来の成果を保証しません。株式投資には元本割れのリスクがあります。</p>
```

### 14. 銘柄検討では買い条件と撤退条件をセットにする

```html
<h2>買いを検討する条件</h2>
<h2>見送る・撤退する条件</h2>
```

### 15. 公式情報の確認を促す

```html
<p>決算資料、証券会社、取引所、金融庁などの公式情報を必ず確認してください。</p>
```

### 16. パンくずと内部リンクで文脈を明示

```html
<nav class="breadcrumb" aria-label="breadcrumb">
  <a href="/">Home</a><span>/</span><a href="/performance/latest/">実績</a>
</nav>
```

### 17. FAQで読者の誤解を防ぐ

```html
<h3>この実績は投資助言ですか？</h3>
<p>いいえ。自己運用の実績公開であり、売買推奨ではありません。</p>
```

### 18. FAQPage schemaをQ&A本文と一致させる

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "この実績は投資助言ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "いいえ。自己運用の実績公開であり、売買推奨ではありません。"
      }
    }
  ]
}
```

### 19. Xアカウントとの同一性を示す

```html
<a href="https://x.com/OnigoGames" target="_blank" rel="me noopener">公式X</a>
```

### 20. 免責ページをフッターから常時リンク

```html
<footer>
  <a href="/about/">運営方針・免責事項</a>
</footer>
```
