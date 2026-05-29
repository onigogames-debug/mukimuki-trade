# SEO Keyword Map and Content Templates

MUKIMUKI tradeは「100万円から米国株トレードの実績を公開する投資ブログ」として、日次実績、銘柄検討、投資ロジック、運営者の継続記録を検索流入の入口にする。検索ボリュームは実測値ではなく、投資ブログ領域の推定需要と競合感に基づく運用メモ。

## A. キーワードマップ

### 1. 実績ページ（毎日の損益公開）

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| 100万円 トレード 実績 | 情報収集 | 中 | H1 / title |
| 投資実績 公開 ブログ | 情報収集 | 中 | meta description / 本文 |
| 米国株 投資実績 | 情報収集 | 高 | H2 / 本文 |
| 米国株 損益 公開 | 情報収集 | 中 | H2 / 本文 |
| 100万円 米国株 運用 | 情報収集 | 中 | title / H2 |
| 米国株 資産推移 | 情報収集 | 中 | H2 / 本文 |
| 株式投資 実績公開 | 情報収集 | 中 | meta description / 本文 |
| 100万円 チャレンジ 投資 | 情報収集 | 中 | H1 / H2 |
| 米国株 日次レポート | 情報収集 | 低 | H2 / 本文 |
| 米国株 トレード 振り返り | 情報収集 | 中 | H2 / 本文 |

### 2. 銘柄検討ページ（SOUN / SOFI / RKLB 等の米国小型成長株）

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| SOUN 株 見通し | 情報収集 | 中 | H1 / title |
| SOFI 株 見通し | 情報収集 | 高 | H1 / title |
| RKLB 株 見通し | 情報収集 | 中 | H1 / title |
| 米国 小型 成長株 | 情報収集 | 中 | H2 / 本文 |
| 米国株 注目銘柄 小型株 | 情報収集 | 高 | meta description / 本文 |
| AI 関連株 米国株 小型 | 情報収集 | 高 | H2 / 本文 |
| フィンテック 米国株 SOFI | 比較検討 | 中 | H2 / 本文 |
| 宇宙関連株 米国株 RKLB | 情報収集 | 中 | H2 / 本文 |
| SOUN 決算 いつ | 情報収集 | 中 | H2 / FAQ |
| 米国株 候補銘柄 探し方 | 情報収集 | 中 | H2 / 本文 |

### 3. 投資ロジックページ（分割エントリー・損切り・利確）

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| 分割エントリー やり方 | 情報収集 | 中 | H1 / title |
| 株 損切り ルール | 情報収集 | 高 | H2 / 本文 |
| 株 利確 ルール | 情報収集 | 中 | H2 / 本文 |
| 米国株 売買ルール | 情報収集 | 中 | H1 / H2 |
| トレード ロジック 作り方 | 情報収集 | 中 | H1 / 本文 |
| 株 エントリー タイミング | 情報収集 | 高 | H2 / 本文 |
| 小型株 リスク管理 | 情報収集 | 中 | H2 / 本文 |
| 自動売買 ロジック 株 | 情報収集 | 高 | title / H2 |
| トレード 振り返り 方法 | 情報収集 | 低 | H2 / 本文 |
| 利確 損切り 判断基準 | 情報収集 | 中 | H2 / FAQ |

### 4. サイト全体のブランド・ロングテールKW

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| MUKIMUKI trade | 取引 | 低 | title / H1 |
| MUKIMUKI trade 実績 | 取引 | 低 | H1 / meta description |
| MUKIMUKI trade 米国株 | 情報収集 | 低 | 本文 / profile |
| 100万円 米国株 ブログ 実績公開 | 情報収集 | 中 | top H1 / 本文 |
| 40代 兼業投資家 米国株 | 情報収集 | 低 | profile / about |
| 投資歴20年 兼業投資家 ブログ | 情報収集 | 低 | profile / 本文 |
| AIエージェント 自動売買 投資 | 情報収集 | 中 | logic / profile |
| OnigoGames 投資 | 取引 | 低 | profile / footer |
| MUKIMUKI trade 公式X | 取引 | 低 | footer / profile |
| moomoo 米国株 実績ブログ | 比較検討 | 中 | moomoo / 本文 |

## B. 日次実績ページ SEO テンプレート

実装用テンプレートは `scripts/content-templates.mjs` の `dailyPerformanceNunjucksTemplate` に配置。記事本文は毎日同じ構造にし、日付固定URLを積み上げる。

```njk
{% set titleText = date + "実績 " + rate + "｜" + holdings %}
<head>
  <title>{{ titleText | truncate(60, true, "") }} | MUKIMUKI trade</title>
  <meta name="description" content="{{ date }}の米国株トレード実績。評価額{{ jpy_total }}、前日比{{ daily_pnl }}、保有{{ holdings }}。前後の日次レポートも確認。">
  <link rel="canonical" href="https://mukimuki-trade.com/performance/{{ date | replace('-', '/') }}/">
  <meta name="robots" content="index,follow,max-image-preview:large">
</head>

<article class="article-body article-longform">
  <h1>{{ date }}実績: 100万円トレード {{ rate }}、評価額{{ jpy_total }}</h1>
  <p>{{ date }}の米国株トレード実績公開です。100万円からの運用は{{ rate }}、評価額は{{ jpy_total }}、前日比は{{ daily_pnl }}でした。主要保有銘柄は{{ holdings }}、売買件数は{{ trade_count }}件です。</p>

  <h2>今日の損益と資産推移</h2>
  <p>評価額、前日比、100万円比を同じ基準で記録し、短期の値動きと資産曲線を比較します。</p>

  <h2>保有銘柄: {{ holdings }}</h2>
  <p>保有銘柄ごとに、上昇要因、下落要因、次回確認する材料を整理します。</p>

  <h2>売買件数{{ trade_count }}件の振り返り</h2>
  <p>分割エントリー、利確、損切り、持ち越し判断を分けて、結果だけでなく判断の背景を残します。</p>

  <h2>明日以降に見るポイント</h2>
  <p>決算、ニュース、出来高、指数の方向感を確認し、次の売買条件を事前に整理します。</p>

  <h2>よくある質問</h2>
  <dl class="faq-list">
    <dt>100万円比{{ rate }}とは何ですか？</dt>
    <dd>初期資金100万円に対して、現在の評価額がどれだけ増減したかを示す目安です。</dd>
    <dt>{{ holdings }}は推奨銘柄ですか？</dt>
    <dd>推奨ではありません。MUKIMUKI tradeの保有・検討記録であり、投資判断は各自で確認してください。</dd>
    <dt>前日比{{ daily_pnl }}は確定利益ですか？</dt>
    <dd>ページ内で明記がない限り、評価額の増減を含みます。確定損益とは分けて確認します。</dd>
  </dl>

  <nav class="pagination-nav" aria-label="日次実績の前後移動">
    <a href="{{ prev_url }}">前日の実績</a>
    {% if next_url %}<a href="{{ next_url }}">翌日の実績</a>{% endif %}
  </nav>
</article>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "100万円比{{ rate }}とは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "初期資金100万円に対して、現在の評価額がどれだけ増減したかを示す目安です。"
      }
    },
    {
      "@type": "Question",
      "name": "{{ holdings }}は推奨銘柄ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "推奨ではありません。MUKIMUKI tradeの保有・検討記録であり、投資判断は各自で確認してください。"
      }
    },
    {
      "@type": "Question",
      "name": "前日比{{ daily_pnl }}は確定利益ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ページ内で明記がない限り、評価額の増減を含みます。確定損益とは分けて確認します。"
      }
    }
  ]
}
</script>
```

## C. 銘柄検討ページ テンプレート方針

実装用関数は `scripts/content-templates.mjs` の `generateResearchArticleTemplate()`。SOUN、SOFI、RKLBのような米国小型成長株では、毎回「注目理由」「確認材料」「売買条件」「撤退条件」「実績ページへの内部リンク」を固定順で入れる。

基本構成:

- title: `{{ticker}}株の見通し｜注目理由と売買条件`
- description: `{{ticker}}の注目理由、決算・ニュース確認、分割エントリー、損切り、利確条件をMUKIMUKI tradeの実績と合わせて整理。`
- H1: `{{ticker}}株の見通し: 注目理由と売買条件`
- H2: `どんな銘柄か`
- H2: `注目理由`
- H2: `買いを検討する条件`
- H2: `見送る・撤退する条件`
- H2: `関連する実績と次に読む記事`
