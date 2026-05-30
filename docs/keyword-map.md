# Keyword Strategy and Article Templates

MUKIMUKI tradeは「100万円から始めた米国株トレードの実績を毎日公開する投資ブログ」として、日次実績、月次まとめ、銘柄検討、投資ロジックを検索流入の入口にする。運営者は40代兼業投資家、投資歴20年弱、東京都港区在住。手法はAutotradeによる自動売買と裁量判断の併用。

検索ボリュームと競合難易度は実測値ではなく、2026年5月時点の投資ブログ領域における推定運用メモ。

## タスクA: キーワードマップ

### 1. 実績ページ（/performance/ 系）

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| 米国株 実績公開 | 情報収集型 | 中 | H1 / meta description |
| 100万円 投資ブログ | 情報収集型 | 中 | H1 / 本文冒頭 |
| 100万円 トレード 実績 | 情報収集型 | 中 | title / H1 |
| 投資実績 公開 ブログ | 情報収集型 | 中 | meta description / 本文冒頭 |
| 米国株 投資実績 | 情報収集型 | 高 | H2 / 本文冒頭 |
| 米国株 損益 公開 | 情報収集型 | 中 | H2 / 本文冒頭 |
| 100万円 米国株 運用 | 比較検討型 | 中 | title / H2 |
| 米国株 資産推移 | 情報収集型 | 中 | H2 / 本文冒頭 |
| 株式投資 実績公開 | 情報収集型 | 中 | meta description / 本文冒頭 |
| 米国株 日次レポート | 情報収集型 | 低 | H2 / 本文冒頭 |

### 2. 銘柄検討ページ（/research/ 系）

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| SOUN 株価 見通し | 情報収集型 | 中 | H1 / title |
| SOFI 株価 見通し | 情報収集型 | 高 | H1 / title |
| RKLB 株価 見通し | 情報収集型 | 中 | H1 / title |
| ASTS 株価 見通し | 情報収集型 | 中 | H1 / title |
| 米国株 小型成長株 候補 | 比較検討型 | 中 | H2 / meta description |
| 米国株 注目銘柄 小型株 | 比較検討型 | 高 | meta description / 本文冒頭 |
| AI 関連株 米国株 小型 | 比較検討型 | 高 | H2 / 本文冒頭 |
| フィンテック 米国株 SOFI | 情報収集型 | 中 | H2 / 本文冒頭 |
| 宇宙関連株 米国株 RKLB | 情報収集型 | 中 | H2 / 本文冒頭 |
| 米国株 候補銘柄 探し方 | ハウツー型 | 中 | H2 / 本文冒頭 |

### 3. 投資ロジックページ（/logic/ 系）

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| 分割エントリー やり方 | ハウツー型 | 中 | H1 / title |
| 米国株 損切り ルール | ハウツー型 | 高 | H2 / 本文冒頭 |
| 米国株 利確 ルール | ハウツー型 | 中 | H2 / 本文冒頭 |
| 米国株 売買ルール | ハウツー型 | 中 | H1 / H2 |
| トレード ロジック 作り方 | ハウツー型 | 中 | H1 / 本文冒頭 |
| 株 エントリー タイミング | ハウツー型 | 高 | H2 / 本文冒頭 |
| 小型株 リスク管理 | 情報収集型 | 中 | H2 / 本文冒頭 |
| 自動売買 ロジック 株 | 比較検討型 | 高 | title / H2 |
| トレード 振り返り 方法 | ハウツー型 | 低 | H2 / 本文冒頭 |
| 利確 損切り 判断基準 | ハウツー型 | 中 | H2 / FAQ |

### 4. サイト全体のブランド・ロングテールKW

| キーワード | 検索意図 | 難易度 | 推奨挿入場所 |
|---|---|---|---|
| MUKIMUKI trade | 情報収集型 | 低 | title / H1 |
| MUKIMUKI trade 実績 | 情報収集型 | 低 | H1 / meta description |
| MUKIMUKI trade 米国株 | 情報収集型 | 低 | 本文冒頭 / profile |
| 100万円 米国株 ブログ 実績公開 | 情報収集型 | 中 | top H1 / 本文冒頭 |
| 40代 兼業投資家 米国株 | 情報収集型 | 低 | profile / about |
| 投資歴20年 兼業投資家 ブログ | 情報収集型 | 低 | profile / 本文冒頭 |
| 港区 兼業投資家 ブログ | 情報収集型 | 低 | profile / about |
| AIエージェント 自動売買 投資 | 比較検討型 | 中 | logic / profile |
| OnigoGames 投資 | 情報収集型 | 低 | profile / footer |
| moomoo 米国株 実績ブログ | 比較検討型 | 中 | moomoo / 本文冒頭 |

## タスクB: 日次実績ページのSEO最適化テンプレート

実装テンプレートは `scripts/content-templates.mjs` の `dailyPerformanceNunjucksTemplate` に配置している。入力変数は `date`, `rate`, `jpy_total`, `daily_pnl`, `holdings`, `trade_count`, `prev_date`, `next_date`。

```njk
{% set rateText = rate ~ "%" %}
{% set jpyTotalText = "¥" ~ jpy_total %}
{% if daily_pnl[0] == "+" or daily_pnl[0] == "-" %}
{% set dailyPnlText = daily_pnl | replace("+", "+¥") | replace("-", "-¥") %}
{% else %}
{% set dailyPnlText = "¥" ~ daily_pnl %}
{% endif %}
{% set titleText = date + "実績 " + rateText + "｜" + holdings + "保有" %}
<head>
  <title>{{ titleText | truncate(43, true, "") }} | MUKIMUKI trade</title>
  <meta name="description" content="{{ date }}の米国株実績公開。評価額{{ jpyTotalText }}、前日比{{ dailyPnlText }}、保有{{ holdings }}、売買{{ trade_count }}件を記録。">
  <link rel="canonical" href="https://mukimuki-trade.com/performance/{{ date | replace('-', '/') }}/">
</head>

<article>
  <h1>{{ date }}の米国株実績公開: 100万円トレード {{ rateText }}</h1>
  <p>{{ date }}の米国株トレード実績公開です。100万円から始めた投資ブログとして、評価額{{ jpyTotalText }}、前日比{{ dailyPnlText }}、100万円比{{ rateText }}を記録します。主要保有銘柄は{{ holdings }}、売買件数は{{ trade_count }}件でした。日々の投資実績公開を通じて、資産推移、銘柄判断、売買ルールを後から検証できる形で残します。</p>

  <h2>米国株トレード実績: 今日の損益と資産推移</h2>
  <h2>保有銘柄: {{ holdings }}の見方</h2>
  <h2>売買件数{{ trade_count }}件の振り返り</h2>
  <h2>自動売買と裁量判断で見るポイント</h2>
  <h2>明日以降に見る米国株のポイント</h2>

  <section>
    <h2>よくある質問</h2>
    <dl>
      <dt>100万円比{{ rateText }}とは何ですか？</dt>
      <dd>初期資金100万円に対して、現在の評価額がどれだけ増減したかを示す目安です。</dd>
      <dt>{{ holdings }}は推奨銘柄ですか？</dt>
      <dd>推奨ではありません。MUKIMUKI tradeの保有・検討記録であり、投資判断は各自で確認してください。</dd>
      <dt>前日比{{ dailyPnlText }}は確定利益ですか？</dt>
      <dd>ページ内で明記がない限り、評価額の増減を含みます。確定損益とは分けて確認します。</dd>
    </dl>
  </section>

  <nav aria-label="日次実績の前後移動">
    <a href="/performance/{{ prev_date | replace('-', '/') }}/">前日 {{ prev_date }}</a>
    {% if next_date %}<a href="/performance/{{ next_date | replace('-', '/') }}/">翌日 {{ next_date }}</a>{% endif %}
  </nav>
</article>
```

FAQPage schema.orgは同テンプレート内で出力する。実ページでは `scripts/structured-data.mjs` の `renderJsonLdScript()` がArticle、BreadcrumbList、FAQPageをまとめて生成する。

## タスクC: 月次まとめページテンプレート

実装テンプレートは `scripts/content-templates.mjs` の `monthlyPerformanceNunjucksTemplate` に配置している。実ページ生成では `scripts/generate-performance-pages.mjs` が `datasets/performance-YYYY-MM-DD.json` から月次ページを作成する。

```njk
{% set titleText = year + "年" + month + "月の実績まとめ: 米国株トレード記録" %}
<head>
  <title>{{ titleText }} | MUKIMUKI trade</title>
  <meta name="description" content="{{ year }}年{{ month }}月の米国株トレード実績まとめ。日付別の評価額、前日比、保有銘柄を一覧で確認できます。">
  <link rel="canonical" href="https://mukimuki-trade.com/performance/{{ year }}/{{ month }}/">
</head>

<article>
  <h1>{{ year }}年{{ month }}月の実績まとめ: 米国株トレード記録</h1>
  <p>{{ year }}年{{ month }}月の米国株トレード実績を、日付、評価額、前日比、保有銘柄で一覧化します。</p>

  <h2>月間サマリー表</h2>
  <table>
    <thead>
      <tr><th>日付</th><th>評価額</th><th>前日比</th><th>保有銘柄</th></tr>
    </thead>
    <tbody>
      {% for item in reports %}
      <tr>
        <td><a href="{{ item.url }}">{{ item.date }}</a></td>
        <td>{{ item.jpy_total }}</td>
        <td>{{ item.daily_pnl }}</td>
        <td>{{ item.holdings }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <nav aria-label="月次実績の前後移動">
    {% if prev_month_url %}<a href="{{ prev_month_url }}">前月の実績</a>{% endif %}
    {% if next_month_url %}<a href="{{ next_month_url }}">翌月の実績</a>{% endif %}
  </nav>
</article>
```

CollectionPage schemaは月次ページの生成時に日次URL一覧をItemListとして出力する。
