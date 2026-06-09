const siteUrl = 'https://mukimuki-trade.com';
const siteName = 'MUKIMUKI trade';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const truncate = (value, maxLength) => {
  const text = String(value ?? '');
  return text.length > maxLength ? text.slice(0, maxLength - 1) : text;
};

const datePath = (date) => `/performance/${String(date).replaceAll('-', '/')}/`;
const normalizePercent = (value) => {
  const text = String(value ?? '').trim();
  return text.endsWith('%') ? text : `${text}%`;
};
const normalizeJpy = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (text.startsWith('¥') || text.startsWith('+¥') || text.startsWith('-¥')) return text;
  if (text.startsWith('+') || text.startsWith('-')) return `${text[0]}¥${text.slice(1)}`;
  return `¥${text}`;
};
const normalizeHoldings = (holdings = []) => (Array.isArray(holdings) ? holdings : String(holdings).split(/[、/・,\s]+/))
  .map((item) => String(item || '').replace(/^US\./, '').trim().toUpperCase())
  .filter(Boolean);

export const keywordMap = {
  performance: [
    ['米国株 実績公開', '情報収集型', '中', 'H1 / meta description'],
    ['100万円 投資ブログ', '情報収集型', '中', 'H1 / 本文冒頭'],
    ['100万円 トレード 実績', '情報収集型', '中', 'title / H1'],
    ['投資実績 公開 ブログ', '情報収集型', '中', 'meta description / 本文冒頭'],
    ['米国株 投資実績', '情報収集型', '高', 'H2 / 本文冒頭'],
    ['米国株 損益 公開', '情報収集型', '中', 'H2 / 本文冒頭'],
    ['100万円 米国株 運用', '比較検討型', '中', 'title / H2'],
    ['米国株 資産推移', '情報収集型', '中', 'H2 / 本文冒頭'],
    ['株式投資 実績公開', '情報収集型', '中', 'meta description / 本文冒頭'],
    ['米国株 日次レポート', '情報収集型', '低', 'H2 / 本文冒頭'],
  ],
  research: [
    ['SOUN 株価 見通し', '情報収集型', '中', 'H1 / title'],
    ['SOFI 株価 見通し', '情報収集型', '高', 'H1 / title'],
    ['RKLB 株価 見通し', '情報収集型', '中', 'H1 / title'],
    ['ASTS 株価 見通し', '情報収集型', '中', 'H1 / title'],
    ['米国株 小型成長株 候補', '比較検討型', '中', 'H2 / meta description'],
    ['米国株 注目銘柄 小型株', '比較検討型', '高', 'meta description / 本文冒頭'],
    ['AI 関連株 米国株 小型', '比較検討型', '高', 'H2 / 本文冒頭'],
    ['フィンテック 米国株 SOFI', '情報収集型', '中', 'H2 / 本文冒頭'],
    ['宇宙関連株 米国株 RKLB', '情報収集型', '中', 'H2 / 本文冒頭'],
    ['米国株 候補銘柄 探し方', 'ハウツー型', '中', 'H2 / 本文冒頭'],
  ],
  logic: [
    ['分割エントリー やり方', 'ハウツー型', '中', 'H1 / title'],
    ['米国株 損切り ルール', 'ハウツー型', '高', 'H2 / 本文冒頭'],
    ['米国株 利確 ルール', 'ハウツー型', '中', 'H2 / 本文冒頭'],
    ['米国株 売買ルール', 'ハウツー型', '中', 'H1 / H2'],
    ['トレード ロジック 作り方', 'ハウツー型', '中', 'H1 / 本文冒頭'],
    ['株 エントリー タイミング', 'ハウツー型', '高', 'H2 / 本文冒頭'],
    ['小型株 リスク管理', '情報収集型', '中', 'H2 / 本文冒頭'],
    ['自動売買 ロジック 株', '比較検討型', '高', 'title / H2'],
    ['トレード 振り返り 方法', 'ハウツー型', '低', 'H2 / 本文冒頭'],
    ['利確 損切り 判断基準', 'ハウツー型', '中', 'H2 / FAQ'],
  ],
  brand: [
    ['MUKIMUKI trade', '情報収集型', '低', 'title / H1'],
    ['MUKIMUKI trade 実績', '情報収集型', '低', 'H1 / meta description'],
    ['MUKIMUKI trade 米国株', '情報収集型', '低', '本文冒頭 / profile'],
    ['100万円 米国株 ブログ 実績公開', '情報収集型', '中', 'top H1 / 本文冒頭'],
    ['40代 兼業投資家 米国株', '情報収集型', '低', 'profile / about'],
    ['投資歴20年 兼業投資家 ブログ', '情報収集型', '低', 'profile / 本文冒頭'],
    ['港区 兼業投資家 ブログ', '情報収集型', '低', 'profile / about'],
    ['AIエージェント 自動売買 投資', '比較検討型', '中', 'logic / profile'],
    ['OnigoGames 投資', '情報収集型', '低', 'profile / footer'],
    ['moomoo 米国株 実績ブログ', '比較検討型', '中', 'moomoo / 本文冒頭'],
  ],
};

export const titleMetaCandidates = {
  researchTop: [
    {
      title: '米国株の銘柄検討｜SOFI・SOUN・小型成長株候補',
      metaDescription: '米国株の銘柄検討ページ。SOFI、SOUN、QBTSなど小型成長株候補を、決算・ニュース・売買条件で整理します。',
    },
    {
      title: '米国株の注目銘柄候補｜小型成長株とAI関連株を検討',
      metaDescription: '100万円米国株トレードで監視する注目銘柄候補を整理。AI関連株、フィンテック、宇宙株を検討します。',
    },
    {
      title: '銘柄検討｜米国株の小型成長株・AI関連株候補',
      metaDescription: '米国株の小型成長株やAI関連株を、注目理由、数字、売買条件、撤退条件に分けて記録します。',
    },
  ],
  aiInfrastructure: [
    {
      title: 'AIインフラ関連株の銘柄検討｜半導体・CRDO・QBTS',
      metaDescription: 'AIインフラ関連の米国株を検討。半導体、メモリ、通信部品、CRDO、QBTSなどを需要と過熱感で整理します。',
    },
    {
      title: 'AI関連株の見通し｜米国株インフラ銘柄を候補整理',
      metaDescription: 'AI関連株の中でもインフラ銘柄を中心に、半導体・データセンター・通信部品の候補とリスクを確認します。',
    },
    {
      title: '米国株AIインフラ銘柄｜半導体・小型成長株の見方',
      metaDescription: '米国株のAIインフラ銘柄を、決算、出来高、材料、過熱感で分類。小型成長株候補の見方を整理します。',
    },
  ],
  logicTop: [
    {
      title: '米国株の投資ロジック｜損切り・分割エントリー・自動売買',
      metaDescription: '米国株トレードの投資ロジックを整理。損切りルール、分割エントリー、自動売買と裁量判断の見方を記録します。',
    },
    {
      title: '米国株トレード手法｜損切りルールと売買判断',
      metaDescription: '100万円運用で使う米国株トレード手法を公開できる範囲で整理。シグナル、リスク管理、利確を確認します。',
    },
    {
      title: '自動売買と裁量判断の投資ロジック｜米国株実績ブログ',
      metaDescription: 'Autotradeの記録と裁量判断を組み合わせた米国株の投資ロジック。売買条件と振り返り方法をまとめます。',
    },
  ],
  moomoo: [
    {
      title: 'moomoo証券の使い方｜米国株ニュース・チャート確認',
      metaDescription: 'PRを含みます。moomoo証券で米国株ニュース、チャート、決算を確認する流れと注意点を整理します。',
    },
    {
      title: 'moomoo証券で米国株を調べる方法｜PR・注意点あり',
      metaDescription: 'アフィリエイト広告を含みます。moomoo証券で米国株のニュース、決算、チャートを見る手順を紹介します。',
    },
    {
      title: 'moomoo証券レビュー｜米国株の銘柄検討に使う見方',
      metaDescription: 'PRリンクを含むmoomoo証券活用メモ。米国株の銘柄検討で見るニュース、チャート、決算情報を整理します。',
    },
  ],
};

export const generateDailyPerformanceSeo = ({
  date,
  rate,
  rateNum,
  jpyTotal,
  dailyPnl,
  holdings = [],
  tradeCount,
  prevDate,
  nextDate,
} = {}) => {
  const tickers = normalizeHoldings(holdings).slice(0, 3);
  const hasHoldings = tickers.length > 0;
  const holdingsText = hasHoldings ? tickers.join('・') : 'ノーポジション';
  const titleSuffix = hasHoldings ? `${holdingsText}保有` : holdingsText;
  const holdingsDescription = hasHoldings ? `${holdingsText}と売買${tradeCount}件` : `引け後保有なし、売買${tradeCount}件`;
  const holdingsHeading = hasHoldings ? `保有銘柄 ${holdingsText} の見方` : '保有なしの日の見方';
  const introHoldings = hasHoldings ? `主要保有銘柄は${holdingsText}で` : '引け後保有はなく';
  const holdingsQuestion = hasHoldings ? `${holdingsText}は買い推奨ですか？` : 'この日の銘柄は買い推奨ですか？';
  const recommendationAnswer = hasHoldings
    ? 'いいえ。保有銘柄として公開している自己運用ログであり、特定銘柄の売買を推奨するものではありません。'
    : 'いいえ。売買記録として公開している自己運用ログであり、特定銘柄の売買を推奨するものではありません。';
  const prevText = prevDate ? `前日${prevDate}` : '前日';
  const nextText = nextDate ? `翌日${nextDate}` : '次回';
  const rateText = normalizePercent(rate || rateNum || '');
  const rateNumText = normalizePercent(rateNum || rate || '');
  const jpyTotalText = normalizeJpy(jpyTotal);
  const dailyPnlText = normalizeJpy(dailyPnl);
  const title = truncate(`${date}実績 ${rateText}｜${titleSuffix}`, 60);
  const metaDescription = truncate(`${date}の米国株実績公開。評価額${jpyTotalText}、前日比${dailyPnlText}、100万円比${rateNumText}。${holdingsDescription}を記録。`, 120);
  const h1 = `${date}の米国株実績公開: 100万円比 ${rateNumText}、評価額 ${jpyTotalText}`;
  const h2s = [
    `米国株トレード実績: 評価額${jpyTotalText}と100万円比${rateNumText}`,
    holdingsHeading,
    `売買件数${tradeCount}件の振り返り`,
    '自動売買と裁量判断で見るポイント',
    '明日以降に見る米国株の確認点',
  ];
  const intro = truncate(`${date}の米国株トレード実績公開です。100万円から始めた投資ブログとして、評価額${jpyTotalText}、前日比${dailyPnlText}、100万円比${rateNumText}を記録します。${introHoldings}、売買件数は${tradeCount}件でした。自動売買と裁量判断の結果を日次で検証します。`, 200);

  return {
    title,
    metaDescription,
    h1,
    h2s,
    intro,
    faqs: [
      {
        question: `${date}の評価額はいくらですか？`,
        answer: `${jpyTotalText}です。100万円比${rateNumText}、前日比${dailyPnlText}となっています。`,
      },
      {
        question: holdingsQuestion,
        answer: recommendationAnswer,
      },
      {
        question: `${date}の売買件数は何件ですか？`,
        answer: `${tradeCount}件です。${prevText}や${nextText}の実績と合わせて、資産推移と売買判断を確認します。`,
      },
    ],
  };
};

export const generateResearchSeoMeta = ({ ticker, companyName, theme } = {}) => {
  const symbol = String(ticker || '').toUpperCase();
  const company = companyName ? `（${companyName}）` : '';
  const themeText = theme || '米国株';
  return {
    title: truncate(`${symbol}株の見通し｜${themeText}銘柄の注目理由と売買条件`, 60),
    metaDescription: truncate(`${symbol}${company}を${themeText}銘柄として検討。決算、ニュース、株価材料、分割エントリー、損切り条件を整理します。`, 120),
  };
};

export const dailyPerformanceNunjucksTemplate = `{% set rateText = rate ~ "%" %}
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
  <meta name="robots" content="index,follow,max-image-preview:large">
</head>

<article class="article-body article-longform">
  <h1>{{ date }}の米国株実績公開: 100万円トレード {{ rateText }}</h1>
  <p>{{ date }}の米国株トレード実績公開です。100万円から始めた投資ブログとして、評価額{{ jpyTotalText }}、前日比{{ dailyPnlText }}、100万円比{{ rateText }}を記録します。主要保有銘柄は{{ holdings }}、売買件数は{{ trade_count }}件でした。日々の投資実績公開を通じて、資産推移、銘柄判断、売買ルールを後から検証できる形で残します。</p>

  <h2>米国株トレード実績: 今日の損益と資産推移</h2>
  <p>評価額、前日比、100万円比を同じ基準で記録し、短期の値動きと資産曲線を比較します。</p>

  <h2>保有銘柄: {{ holdings }}の見方</h2>
  <p>保有銘柄ごとに、上昇要因、下落要因、次回確認する材料を整理します。</p>

  <h2>売買件数{{ trade_count }}件の振り返り</h2>
  <p>分割エントリー、利確、損切り、持ち越し判断を分けて、結果だけでなく判断の背景を残します。</p>

  <h2>自動売買と裁量判断で見るポイント</h2>
  <p>Autotradeの記録を土台にしつつ、ニュース、出来高、決算、指数の方向感を合わせて確認します。</p>

  <h2>明日以降に見る米国株のポイント</h2>
  <p>決算、ニュース、出来高、指数の方向感を確認し、次の売買条件を事前に整理します。</p>

  <h2>よくある質問</h2>
  <dl class="faq-list">
    <dt>100万円比{{ rateText }}とは何ですか？</dt>
    <dd>初期資金100万円に対して、現在の評価額がどれだけ増減したかを示す目安です。</dd>
    <dt>{{ holdings }}は推奨銘柄ですか？</dt>
    <dd>推奨ではありません。MUKIMUKI tradeの保有・検討記録であり、投資判断は各自で確認してください。</dd>
    <dt>前日比{{ dailyPnlText }}は確定利益ですか？</dt>
    <dd>ページ内で明記がない限り、評価額の増減を含みます。確定損益とは分けて確認します。</dd>
  </dl>

  <nav class="pagination-nav" aria-label="日次実績の前後移動">
    <a href="/performance/{{ prev_date | replace('-', '/') }}/">前日 {{ prev_date }}</a>
    {% if next_date %}<a href="/performance/{{ next_date | replace('-', '/') }}/">翌日 {{ next_date }}</a>{% endif %}
  </nav>
</article>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "100万円比{{ rateText }}とは何ですか？",
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
      "name": "前日比{{ dailyPnlText }}は確定利益ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ページ内で明記がない限り、評価額の増減を含みます。確定損益とは分けて確認します。"
      }
    }
  ]
}
</script>`;

export const monthlyPerformanceNunjucksTemplate = `{% set titleText = year + "年" + month + "月の実績まとめ: 米国株トレード記録" %}
<head>
  <title>{{ titleText }} | MUKIMUKI trade</title>
  <meta name="description" content="{{ year }}年{{ month }}月の米国株トレード実績まとめ。日付別の評価額、前日比、保有銘柄を一覧で確認できます。">
  <link rel="canonical" href="https://mukimuki-trade.com/performance/{{ year }}/{{ month }}/">
  <meta name="robots" content="index,follow,max-image-preview:large">
</head>

<article class="article-body article-longform">
  <h1>{{ year }}年{{ month }}月の実績まとめ: 米国株トレード記録</h1>
  <p>{{ year }}年{{ month }}月の米国株トレード実績を、日付、評価額、前日比、保有銘柄で一覧化します。日次ページに進むと、その日の100万円比、売買件数、保有銘柄の内訳を確認できます。</p>

  <h2>月間サマリー表</h2>
  <table class="performance-summary-table">
    <thead>
      <tr>
        <th>日付</th>
        <th>評価額</th>
        <th>前日比</th>
        <th>保有銘柄</th>
      </tr>
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

  <nav class="pagination-nav" aria-label="月次実績の前後移動">
    {% if prev_month_url %}<a href="{{ prev_month_url }}">前月の実績</a>{% endif %}
    {% if next_month_url %}<a href="{{ next_month_url }}">翌月の実績</a>{% endif %}
  </nav>
</article>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{{ titleText }}",
  "url": "https://mukimuki-trade.com/performance/{{ year }}/{{ month }}/",
  "inLanguage": "ja-JP",
  "isPartOf": {
    "@type": "WebSite",
    "name": "MUKIMUKI trade",
    "url": "https://mukimuki-trade.com/"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {% for item in reports %}
      {
        "@type": "ListItem",
        "position": {{ loop.index }},
        "url": "https://mukimuki-trade.com{{ item.url }}",
        "name": "{{ item.date }} 実績レポート"
      }{% if not loop.last %},{% endif %}
      {% endfor %}
    ]
  }
}
</script>`;

export const renderDailyPerformanceHtml = ({
  date = '2026-05-28',
  rate = '+10.1%',
  jpyTotal = '¥1,100,567',
  dailyPnl = '+¥14,384',
  holdings = 'SOUN / SOFI / RKLB',
  tradeCount = '24',
  prevUrl = '/performance/2026/05/27/',
  nextUrl = '',
} = {}) => {
  const pagePath = datePath(date);
  const title = truncate(`${date}実績 ${rate}｜${holdings}`, 60);
  const description = truncate(`${date}の米国株トレード実績。評価額${jpyTotal}、前日比${dailyPnl}、保有${holdings}。前後の日次レポートも確認。`, 120);
  const faqs = [
    {
      question: `100万円比${rate}とは何ですか？`,
      answer: '初期資金100万円に対して、現在の評価額がどれだけ増減したかを示す目安です。',
    },
    {
      question: `${holdings}は推奨銘柄ですか？`,
      answer: '推奨ではありません。MUKIMUKI tradeの保有・検討記録であり、投資判断は各自で確認してください。',
    },
    {
      question: `前日比${dailyPnl}は確定利益ですか？`,
      answer: 'ページ内で明記がない限り、評価額の増減を含みます。確定損益とは分けて確認します。',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ${siteName}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${siteUrl}${pagePath}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
</head>
<body>
  <article class="article-body article-longform">
    <h1>${escapeHtml(date)}実績: 100万円トレード ${escapeHtml(rate)}、評価額${escapeHtml(jpyTotal)}</h1>
    <p>${escapeHtml(date)}の米国株トレード実績公開です。100万円からの運用は${escapeHtml(rate)}、評価額は${escapeHtml(jpyTotal)}、前日比は${escapeHtml(dailyPnl)}でした。主要保有銘柄は${escapeHtml(holdings)}、売買件数は${escapeHtml(tradeCount)}件です。</p>
    <h2>今日の損益と資産推移</h2>
    <p>評価額、前日比、100万円比を同じ基準で記録し、短期の値動きと資産曲線を比較します。</p>
    <h2>保有銘柄: ${escapeHtml(holdings)}</h2>
    <p>保有銘柄ごとに、上昇要因、下落要因、次回確認する材料を整理します。</p>
    <h2>売買件数${escapeHtml(tradeCount)}件の振り返り</h2>
    <p>分割エントリー、利確、損切り、持ち越し判断を分けて、結果だけでなく判断の背景を残します。</p>
    <h2>明日以降に見るポイント</h2>
    <p>決算、ニュース、出来高、指数の方向感を確認し、次の売買条件を事前に整理します。</p>
    <h2>よくある質問</h2>
    <dl class="faq-list">
${faqs.map((faq) => `      <dt>${escapeHtml(faq.question)}</dt>
      <dd>${escapeHtml(faq.answer)}</dd>`).join('\n')}
    </dl>
    <nav class="pagination-nav" aria-label="日次実績の前後移動">
      <a href="${escapeHtml(prevUrl)}">前日の実績</a>
      ${nextUrl ? `<a href="${escapeHtml(nextUrl)}">翌日の実績</a>` : ''}
    </nav>
  </article>
</body>
</html>`;
};

export const generateResearchArticleTemplate = ({
  ticker,
  companyName = '',
  theme = '米国小型成長株',
  focusReason = '',
  tradeConditions = [],
  avoidConditions = [],
  relatedPerformanceUrl = '/performance/',
  relatedLogicUrl = '/logic/',
} = {}) => {
  if (!ticker) throw new Error('ticker is required');

  const symbol = String(ticker).toUpperCase();
  const title = truncate(`${symbol}株の見通し｜注目理由と売買条件`, 60);
  const description = truncate(`${symbol}${companyName ? `（${companyName}）` : ''}の注目理由、決算・ニュース確認、分割エントリー、損切り、利確条件をMUKIMUKI tradeの実績と合わせて整理。`, 120);
  const h1 = `${symbol}株の見通し: 注目理由と売買条件`;
  const reason = focusReason || `${symbol}は${theme}の候補として、成長余地と値動きの大きさを分けて確認したい銘柄です。`;
  const buyRules = tradeConditions.length
    ? tradeConditions
    : ['決算や重要ニュースの確認後に出来高が増える', '直近高値を更新し、下値を切り上げる', '1回で買い切らず、分割エントリーでリスクを抑える'];
  const stopRules = avoidConditions.length
    ? avoidConditions
    : ['決算後に売上成長やガイダンスが弱い', '出来高を伴って重要サポートを割る', '想定した材料が消えたまま反発が弱い'];
  const slug = `${symbol.toLowerCase()}-stock-outlook`;
  const url = `${siteUrl}/research/${slug}/`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    inLanguage: 'ja-JP',
    articleSection: '銘柄検討',
    keywords: [symbol, `${symbol} 株 見通し`, theme, '米国株', '小型成長株'],
    author: {
      '@type': 'Person',
      name: siteName,
      url: `${siteUrl}/profile/`,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
  };

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ${siteName}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)} | ${siteName}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
</head>
<body>
  <article class="article-body article-longform">
    <p class="eyebrow">RESEARCH / ${escapeHtml(symbol)}</p>
    <h1>${escapeHtml(h1)}</h1>
    <p>${escapeHtml(symbol)}株の見通しを、注目理由、買いを検討する条件、見送る条件に分けて整理します。MUKIMUKI tradeでは、実績公開ページと投資ロジックをつなげ、候補銘柄を後から振り返れる形で記録します。</p>

    <h2>${escapeHtml(symbol)}はどんな銘柄か</h2>
    <p>${escapeHtml(companyName || symbol)}は${escapeHtml(theme)}として確認する銘柄です。事業内容、決算、ニュース、株価の反応を分けて見ます。</p>

    <h2>注目理由</h2>
    <p>${escapeHtml(reason)}</p>

    <h2>買いを検討する条件</h2>
    <ul>
${buyRules.map((rule) => `      <li>${escapeHtml(rule)}</li>`).join('\n')}
    </ul>

    <h2>見送る・撤退する条件</h2>
    <ul>
${stopRules.map((rule) => `      <li>${escapeHtml(rule)}</li>`).join('\n')}
    </ul>

    <h2>関連する実績と次に読む記事</h2>
    <p><a href="${escapeHtml(relatedPerformanceUrl)}">最新実績</a>で保有・売買の有無を確認し、<a href="${escapeHtml(relatedLogicUrl)}">投資ロジック</a>で分割エントリー、損切り、利確の判断基準を確認します。</p>
  </article>
</body>
</html>`;
};

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll('\\', '/'))) {
  const sample = renderDailyPerformanceHtml();
  console.log(sample.slice(0, 500));
  console.log(generateResearchArticleTemplate({
    ticker: 'SOUN',
    companyName: 'SoundHound AI',
    theme: 'AI音声関連の米国小型成長株',
    focusReason: 'AI音声、レストラン向け自動応答、車載音声の成長余地を確認したい銘柄です。',
  }).slice(0, 500));
}
