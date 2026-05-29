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

export const keywordMap = {
  performance: [
    ['100万円 トレード 実績', '情報収集', '中', 'H1 / title'],
    ['投資実績 公開 ブログ', '情報収集', '中', 'meta description / 本文'],
    ['米国株 投資実績', '情報収集', '高', 'H2 / 本文'],
    ['米国株 損益 公開', '情報収集', '中', 'H2 / 本文'],
    ['100万円 米国株 運用', '情報収集', '中', 'title / H2'],
    ['米国株 資産推移', '情報収集', '中', 'H2 / 本文'],
    ['株式投資 実績公開', '情報収集', '中', 'meta description / 本文'],
    ['100万円 チャレンジ 投資', '情報収集', '中', 'H1 / H2'],
    ['米国株 日次レポート', '情報収集', '低', 'H2 / 本文'],
    ['米国株 トレード 振り返り', '情報収集', '中', 'H2 / 本文'],
  ],
  research: [
    ['SOUN 株 見通し', '情報収集', '中', 'H1 / title'],
    ['SOFI 株 見通し', '情報収集', '高', 'H1 / title'],
    ['RKLB 株 見通し', '情報収集', '中', 'H1 / title'],
    ['米国 小型 成長株', '情報収集', '中', 'H2 / 本文'],
    ['米国株 注目銘柄 小型株', '情報収集', '高', 'meta description / 本文'],
    ['AI 関連株 米国株 小型', '情報収集', '高', 'H2 / 本文'],
    ['フィンテック 米国株 SOFI', '比較検討', '中', 'H2 / 本文'],
    ['宇宙関連株 米国株 RKLB', '情報収集', '中', 'H2 / 本文'],
    ['SOUN 決算 いつ', '情報収集', '中', 'H2 / FAQ'],
    ['米国株 候補銘柄 探し方', '情報収集', '中', 'H2 / 本文'],
  ],
  logic: [
    ['分割エントリー やり方', '情報収集', '中', 'H1 / title'],
    ['株 損切り ルール', '情報収集', '高', 'H2 / 本文'],
    ['株 利確 ルール', '情報収集', '中', 'H2 / 本文'],
    ['米国株 売買ルール', '情報収集', '中', 'H1 / H2'],
    ['トレード ロジック 作り方', '情報収集', '中', 'H1 / 本文'],
    ['株 エントリー タイミング', '情報収集', '高', 'H2 / 本文'],
    ['小型株 リスク管理', '情報収集', '中', 'H2 / 本文'],
    ['自動売買 ロジック 株', '情報収集', '高', 'title / H2'],
    ['トレード 振り返り 方法', '情報収集', '低', 'H2 / 本文'],
    ['利確 損切り 判断基準', '情報収集', '中', 'H2 / FAQ'],
  ],
  brand: [
    ['MUKIMUKI trade', '取引', '低', 'title / H1'],
    ['MUKIMUKI trade 実績', '取引', '低', 'H1 / meta description'],
    ['MUKIMUKI trade 米国株', '情報収集', '低', '本文 / profile'],
    ['100万円 米国株 ブログ 実績公開', '情報収集', '中', 'top H1 / 本文'],
    ['40代 兼業投資家 米国株', '情報収集', '低', 'profile / about'],
    ['投資歴20年 兼業投資家 ブログ', '情報収集', '低', 'profile / 本文'],
    ['AIエージェント 自動売買 投資', '情報収集', '中', 'logic / profile'],
    ['OnigoGames 投資', '取引', '低', 'profile / footer'],
    ['MUKIMUKI trade 公式X', '取引', '低', 'footer / profile'],
    ['moomoo 米国株 実績ブログ', '比較検討', '中', 'moomoo / 本文'],
  ],
};

export const dailyPerformanceNunjucksTemplate = `{% set titleText = date + "実績 " + rate + "｜" + holdings %}
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
  relatedPerformanceUrl = '/performance/latest/',
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
