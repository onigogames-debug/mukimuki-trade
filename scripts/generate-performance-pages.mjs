import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { absoluteUrl, renderJsonLdScript } from './structured-data.mjs';
import { renderBreadcrumbHtml } from './breadcrumbs.mjs';
import { buildArticleIndex, renderRelatedArticlesSection } from './internal-links.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = process.env.PERFORMANCE_OUTPUT_DIR
  ? path.resolve(root, process.env.PERFORMANCE_OUTPUT_DIR)
  : root;
const datasetsDir = path.join(root, 'datasets');
const articlesPath = path.join(root, 'data', 'articles.json');
const contentPath = path.join(root, 'data', 'content.json');
const siteUrl = 'https://mukimuki-trade.com';
const officialXUrl = 'https://x.com/OnigoGames';
const { articles } = JSON.parse(await readFile(articlesPath, 'utf8'));
const content = JSON.parse(await readFile(contentPath, 'utf8'));

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatJpy = (value) => Number(value || 0).toLocaleString('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
}).replace('￥', '¥');

const formatUsd = (value) => Number(value || 0).toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const dateParts = (date) => {
  const [year, month, day] = date.split('-');
  return { year, month, day };
};

const datePath = (date) => {
  const { year, month, day } = dateParts(date);
  return `/performance/${year}/${month}/${day}/`;
};

const monthPath = (date) => {
  const { year, month } = dateParts(date);
  return `/performance/${year}/${month}/`;
};

const yearPath = (date) => {
  const { year } = dateParts(date);
  return `/performance/${year}/`;
};

const displayDate = (date) => date.replaceAll('-', '.');

const shortSymbol = (symbol) => String(symbol || '').replace(/^US\./, '');

const primaryHoldings = (positions = [], limit = 3) => positions
  .slice(0, limit)
  .map((position) => shortSymbol(position.symbol))
  .filter(Boolean);

const nav = `    <nav class="nav-links" aria-label="主要メニュー">
      <a href="/performance/latest/">実績</a>
      <a href="/research/">銘柄検討</a>
      <a href="/logic/">ロジック</a>
      <a href="/moomoo/">moomoo</a>
      <a href="/archive/">アーカイブ</a>
      <a href="/profile/">運営者</a>
      <a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a>
    </nav>`;

const mobileMenu = `    <details class="mobile-menu">
      <summary aria-label="メニュー">
        <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </summary>
      <nav class="mobile-nav-links" aria-label="スマホメニュー">
        <a href="/performance/latest/">実績</a>
        <a href="/research/">銘柄検討</a>
        <a href="/logic/">ロジック</a>
        <a href="/moomoo/">moomoo</a>
        <a href="/archive/">アーカイブ</a>
        <a href="/profile/">運営者</a>
        <a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a>
      </nav>
    </details>`;

const header = `  <header class="site-header">
    <a class="brand" href="/" aria-label="MUKIMUKI trade home">
      <img src="/assets/mukimuki-main.png" alt="">
      <span><strong>MUKIMUKI trade</strong><small>数字で追う公開記録</small></span>
    </a>
${mobileMenu}
${nav}
  </header>`;

const footer = `  <footer class="site-footer">
    <strong>MUKIMUKI trade</strong>
    <p>初めての方は最新実績からどうぞ。資産曲線、銘柄候補、売買ロジックを短く追えるように整理しています。広告リンクを含む場合があります。</p>
    <nav class="footer-links" aria-label="補助リンク"><a href="/profile/">運営者</a><a href="/archive/">アーカイブ</a><a href="/feed.xml">RSS</a><a href="/about/">運営方針</a><a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a></nav>
  </footer>`;

const loadPerformanceDatasets = async () => {
  const latest = JSON.parse(await readFile(path.join(datasetsDir, 'performance-latest.json'), 'utf8'));
  const files = (await readdir(datasetsDir))
    .filter((file) => /^performance-\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort();

  const reports = [];
  for (const file of files) {
    const report = JSON.parse(await readFile(path.join(datasetsDir, file), 'utf8'));
    reports.push({ file, report });
  }

  reports.sort((a, b) => a.report.latest.reportDate.localeCompare(b.report.latest.reportDate));
  return { latest, reports };
};

const renderMetrics = (report) => {
  const latest = report.latest;
  const metrics = [
    ['評価額', formatJpy(latest.jpy.end)],
    ['前日比', `${latest.jpy.delta >= 0 ? '+' : ''}${formatJpy(latest.jpy.delta)}`],
    ['100万円比', `${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(2)}%`],
    ['日次リターン', `${latest.summary.dailyReturnPct >= 0 ? '+' : ''}${latest.summary.dailyReturnPct.toFixed(2)}%`],
    ['取引件数', `${latest.summary.totalTrades}件`],
    ['USD損益', `${latest.summary.usdPnl >= 0 ? '+' : ''}${formatUsd(latest.summary.usdPnl)}`],
  ];

  return `<div class="stats-grid">
${metrics.map(([label, value]) => `          <div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('\n')}
        </div>`;
};

const renderPositions = (positions = []) => {
  if (!positions.length) return '<p>この日の保有銘柄データはありません。</p>';
  return `<div class="comparison-table">
${positions.map((position) => `          <div class="comparison-row">
            <span>${escapeHtml(position.symbol)}</span>
            <strong>${escapeHtml(position.shares)}株</strong>
            <span>平均 ${formatUsd(position.averagePriceUsd)} / 含み損益 ${position.unrealizedPnlPct >= 0 ? '+' : ''}${Number(position.unrealizedPnlPct).toFixed(2)}%</span>
          </div>`).join('\n')}
        </div>`;
};

const renderTrades = (trades = []) => {
  if (!trades.length) return '<p>この日の約定履歴データはありません。</p>';
  return `<div class="comparison-table">
${trades.slice(0, 12).map((trade) => `          <div class="comparison-row">
            <span>${escapeHtml(trade.side)} ${escapeHtml(trade.symbol)}</span>
            <strong>${escapeHtml(trade.shares)}株</strong>
            <span>${formatUsd(trade.priceUsd)} / ${formatUsd(trade.amountUsd)}</span>
          </div>`).join('\n')}
        </div>
        ${trades.length > 12 ? `<p>表示は先頭12件です。全${trades.length}件はJSONデータで確認できます。</p>` : ''}`;
};

const renderDailyPage = (report, articleIndex) => {
  const latest = report.latest;
  const pagePath = datePath(latest.reportDate);
  const monthlyPath = monthPath(latest.reportDate);
  const holdings = primaryHoldings(latest.positions);
  const holdingsText = holdings.join('・');
  const rateText = `${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(1)}%`;
  const title = `${latest.reportDate}実績 ${rateText}｜${holdingsText}保有`;
  const h1 = `${latest.reportDate}実績: 100万円比 ${rateText}、評価額 ${formatJpy(latest.jpy.end)}`;
  const description = `100万円米国株トレード実績。評価額${formatJpy(latest.jpy.end)}、前日比${latest.jpy.delta >= 0 ? '+' : ''}${formatJpy(latest.jpy.delta)}。${holdingsText}と${latest.summary.totalTrades}件の売買を確認。`;
  const intro = `100万円から始めた米国株トレードの実績公開です。${latest.reportDate}は評価額が${formatJpy(latest.jpy.end)}、前日比は${latest.jpy.delta >= 0 ? '+' : ''}${formatJpy(latest.jpy.delta)}、100万円比は${rateText}でした。主要保有銘柄は${holdings.join('、')}で、売買件数は${latest.summary.totalTrades}件です。投資実績公開ブログとして、資産推移と売買判断を日次で確認します。`;
  const faqs = [
    {
      question: 'この実績は投資助言ですか？',
      answer: 'いいえ。MUKIMUKI tradeは自己運用の実績を公開する情報サイトであり、特定銘柄の売買を推奨するものではありません。',
    },
    {
      question: `100万円比 ${rateText} は何を意味しますか？`,
      answer: `初期資金100万円に対して、評価額がどれだけ増減したかを示す指標です。この日は評価額${formatJpy(latest.jpy.end)}で、100万円比${rateText}です。`,
    },
    {
      question: `${holdings.join('、')}は買うべき銘柄ですか？`,
      answer: '買い推奨ではありません。保有銘柄として公開しているだけで、投資判断は決算、ニュース、リスク許容度を確認したうえで読者自身が行う必要があります。',
    },
  ];
  const breadcrumbs = [
    { name: 'Home', item: `${siteUrl}/` },
    { name: '実績公開', item: absoluteUrl('/performance/latest/') },
    { name: `${dateParts(latest.reportDate).year}年${Number(dateParts(latest.reportDate).month)}月`, item: absoluteUrl(monthlyPath) },
    { name: latest.reportDateDisplay, item: absoluteUrl(pagePath) },
  ];
  const jsonLdScript = renderJsonLdScript({
    pageType: 'performance',
    title,
    description,
    published_time: report.generatedAt,
    modified_time: report.generatedAt,
    author: 'MUKIMUKI trade',
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    image: '/assets/mukimuki-performance.png',
    keywords: ['100万円トレード', '投資実績公開', '米国株', '100万円チャレンジ', latest.reportDate, ...holdings],
    breadcrumbs,
    faq: faqs,
  });
  const relatedContext = {
    title,
    description,
    summary: `${latest.reportDateDisplay} 保有銘柄 ${(latest.positions || []).map((position) => position.symbol).join(', ')}`,
    path: pagePath,
    category: '実績公開',
    categoryKey: 'performance',
    tags: ['実績公開', '100万円チャレンジ', ...(latest.positions || []).map((position) => position.symbol)],
  };

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(pagePath))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${escapeHtml(title)} | MUKIMUKI trade">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(pagePath))}">
  <meta property="og:image" content="${siteUrl}/assets/mukimuki-performance.png">
  <meta property="article:published_time" content="${escapeHtml(report.generatedAt)}">
  <meta property="article:modified_time" content="${escapeHtml(report.generatedAt)}">
  <meta property="article:section" content="実績公開">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="MUKIMUKI trade RSS" href="/feed.xml">
  <link rel="alternate" type="application/json" title="${escapeHtml(latest.reportDate)} performance data" href="/datasets/performance-${escapeHtml(latest.reportDate)}.json">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript}
</head>
<body>
${header}
  <main>
    <section class="article-hero">
      <div class="article-hero-inner">
        ${renderBreadcrumbHtml(breadcrumbs, escapeHtml)}
        <p class="eyebrow">PERFORMANCE / DAILY ARCHIVE</p>
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(intro)}</p>
      </div>
    </section>
    <article class="article-body">
      <section class="article-panel">
        <h2>この日の実績サマリー</h2>
        ${renderMetrics(report)}
      </section>
      <section class="article-panel">
        <h2>保有銘柄の見方</h2>
        <p>${escapeHtml(holdings.join('、'))}は値動きが大きくなりやすい米国株です。単日の損益だけでなく、翌日に持ち越した理由、含み益・含み損の変化、出来高の継続を確認します。</p>
      </section>
      <section class="article-panel">
        <h2>主要保有銘柄</h2>
        ${renderPositions(latest.positions)}
      </section>
      <section class="article-panel">
        <h2>売買件数${escapeHtml(latest.summary.totalTrades)}件から見るトレードの特徴</h2>
        <p>売買件数が多い日は、利益額だけでなく回転の多さにも注意します。買付と売却の偏り、利確した銘柄、翌日に残した銘柄を分けて見ることで、実績の再現性を確認できます。</p>
        ${renderTrades(latest.trades)}
      </section>
      <section class="article-panel">
        <h2>次に読むべき内容</h2>
        <p>この日の実績だけで判断せず、<a href="${escapeHtml(monthlyPath)}">月次アーカイブ</a>、<a href="/category/performance/">売買トピック</a>、<a href="/logic/">投資ロジック</a>を合わせて確認すると、資産推移と判断基準をつなげて読みやすくなります。元データは<a href="/datasets/performance-${escapeHtml(latest.reportDate)}.json">この日のJSONデータ</a>で確認できます。</p>
      </section>
      <section class="article-panel">
        <h2>よくある質問</h2>
        <div class="faq-list">
${faqs.map((faq) => `          <div class="faq-item">
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          </div>`).join('\n')}
        </div>
      </section>
${renderRelatedArticlesSection(relatedContext, articleIndex, { escapeHtml })}
    </article>
  </main>
${footer}
</body>
</html>
`;
};

const renderMonthPage = (date, reports) => {
  const { year, month } = dateParts(date);
  const pagePath = `/performance/${year}/${month}/`;
  const title = `${year}年${Number(month)}月の実績アーカイブ`;
  const description = `MUKIMUKI tradeの${year}年${Number(month)}月実績アーカイブ。日別の評価額、前日比、100万円比を固定URLで確認できます。`;
  const monthReports = reports.filter(({ report }) => report.latest.reportDate.startsWith(`${year}-${month}`));
  const jsonLdScript = renderJsonLdScript({
    pageType: 'collection',
    title,
    description,
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    breadcrumbs: [
      { name: 'Home', item: `${siteUrl}/` },
      { name: '実績公開', item: absoluteUrl('/performance/latest/') },
      { name: title, item: absoluteUrl(pagePath) },
    ],
    items: monthReports.map(({ report }) => ({
      name: `${report.latest.reportDateDisplay} 実績レポート`,
      path: datePath(report.latest.reportDate),
    })),
  });

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | MUKIMUKI trade</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(pagePath))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${escapeHtml(title)} | MUKIMUKI trade">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(pagePath))}">
  <meta property="og:image" content="${siteUrl}/assets/mukimuki-performance.png">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="MUKIMUKI trade RSS" href="/feed.xml">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript}
</head>
<body>
${header}
  <main>
    <section class="article-hero">
      <div class="article-hero-inner">
        <nav class="breadcrumb" aria-label="breadcrumb"><a href="/">Home</a><span>/</span><a href="/performance/latest/">実績公開</a><span>/</span><span>${escapeHtml(title)}</span></nav>
        <p class="eyebrow">PERFORMANCE / MONTHLY ARCHIVE</p>
        <h1>${escapeHtml(title)}</h1>
        <p>毎日の実績を日付URLで固定し、Googleにインデックスされる履歴資産として蓄積します。</p>
      </div>
    </section>
    <section class="collection-body" aria-label="${escapeHtml(title)}">
${monthReports.reverse().map(({ report }) => `      <article class="collection-card">
        <span class="post-kicker">${escapeHtml(report.latest.reportDateDisplay)} / 実績公開</span>
        <h2><a href="${escapeHtml(datePath(report.latest.reportDate))}">${escapeHtml(report.latest.label)}実績レポート</a></h2>
        <p>評価額 ${formatJpy(report.latest.jpy.end)}、前日比 ${report.latest.jpy.delta >= 0 ? '+' : ''}${formatJpy(report.latest.jpy.delta)}、100万円比 ${report.latest.summary.totalReturnPct >= 0 ? '+' : ''}${report.latest.summary.totalReturnPct.toFixed(2)}%。</p>
        <div class="tag-row"><span>実績公開</span><span>100万円チャレンジ</span><span>${escapeHtml(report.latest.summary.totalTrades)}件</span></div>
      </article>`).join('\n')}
    </section>
    <section class="article-body">
      <section class="article-panel">
        <h2>月次アーカイブの読み方</h2>
        <p>このページでは、日次実績を固定URLで残し、あとから資産推移を比較できるようにしています。単日の利益や損失だけを見るのではなく、前日比、100万円比、取引件数、保有銘柄の変化を並べて読むことで、トレードの流れを把握しやすくなります。</p>
        <p>月次で見ると、好調な日と調整した日がどの順番で出ているか、回転売買が多かった日と保有を優先した日がどこかを確認できます。日別ページには保有銘柄と売買履歴を残しているため、気になる日付から詳細へ進んでください。</p>
      </section>
      <section class="article-panel">
        <h2>関連して確認するページ</h2>
        <p>実績の背景を読む場合は<a href="/category/performance/">売買トピック</a>、判断基準を読む場合は<a href="/logic/">投資ロジック</a>、候補銘柄の見方を読む場合は<a href="/research/">銘柄検討</a>が入口になります。数字、理由、候補を分けて読むことで、公開実績を追いやすくしています。</p>
      </section>
    </section>
  </main>
${footer}
</body>
</html>
`;
};

const renderYearPage = (date, reports) => {
  const { year } = dateParts(date);
  const pagePath = `/performance/${year}/`;
  const title = `${year}年の実績アーカイブ`;
  const description = `MUKIMUKI tradeの${year}年実績アーカイブ。月別の実績まとめと日次実績ページを確認できます。`;
  const yearReports = reports.filter(({ report }) => report.latest.reportDate.startsWith(`${year}-`));
  const monthKeys = [...new Set(yearReports.map(({ report }) => report.latest.reportDate.slice(0, 7)))].sort();
  const jsonLdScript = renderJsonLdScript({
    pageType: 'collection',
    title,
    description,
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    breadcrumbs: [
      { name: 'Home', item: `${siteUrl}/` },
      { name: '実績公開', item: absoluteUrl('/performance/latest/') },
      { name: title, item: absoluteUrl(pagePath) },
    ],
    items: monthKeys.map((key) => ({
      name: `${key.replace('-', '年')}月の実績`,
      path: `/performance/${key.replace('-', '/')}/`,
    })),
  });
  const latestReport = yearReports.at(-1)?.report;
  const firstReport = yearReports[0]?.report;
  const yearlyDelta = latestReport && firstReport
    ? latestReport.latest.jpy.end - firstReport.latest.jpy.end
    : 0;

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | MUKIMUKI trade</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(pagePath))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${escapeHtml(title)} | MUKIMUKI trade">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(pagePath))}">
  <meta property="og:image" content="${siteUrl}/assets/mukimuki-performance.png">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="MUKIMUKI trade RSS" href="/feed.xml">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript}
</head>
<body>
${header}
  <main>
    <section class="article-hero">
      <div class="article-hero-inner">
        <nav class="breadcrumb" aria-label="breadcrumb"><a href="/">Home</a><span>/</span><a href="/performance/latest/">実績公開</a><span>/</span><span>${escapeHtml(title)}</span></nav>
        <p class="eyebrow">PERFORMANCE / YEARLY ARCHIVE</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${year}年の月次まとめと日次実績をたどる入口です。最新実績だけでなく、月単位・日単位の固定URLを積み上げて、過去のトレード記録を検索資産として残します。</p>
      </div>
    </section>
    <section class="article-body">
      <section class="article-panel">
        <h2>${year}年の概況</h2>
        <div class="stats-grid">
          <div class="stat-card"><span>記録日数</span><strong>${escapeHtml(yearReports.length)}日</strong></div>
          <div class="stat-card"><span>最新評価額</span><strong>${latestReport ? formatJpy(latestReport.latest.jpy.end) : '-'}</strong></div>
          <div class="stat-card"><span>期間内変化</span><strong>${yearlyDelta >= 0 ? '+' : ''}${formatJpy(yearlyDelta)}</strong></div>
        </div>
        <p>年次ページでは、月ごとの実績ページへ進み、そこから日次レポートを確認できます。評価額、前日比、取引数、保有銘柄を同じ形式で残すことで、実績公開ブログとしての履歴を読み返しやすくします。</p>
        <p>SEO上は、最新ページだけを更新し続けるよりも、年次、月次、日次の階層を分けておくほうが、過去実績を検索エンジンに発見してもらいやすくなります。この年次ページは、${year}年の実績全体を俯瞰し、月次まとめと日次の永続URLへ内部リンクを渡すためのハブです。</p>
        <p>読者はまず年次ページで全体の流れをつかみ、次に月次ページで好調日と調整日を比較し、最後に日次ページで保有銘柄、売買件数、前日比を確認できます。100万円トレードの推移を、単発の記事ではなく蓄積された記録として読める構造にしています。</p>
        <p>今後レポートが増えた場合も、この年次ページには月次まとめが自動で追加されます。日次JSONを置くだけで、日別ページ、月別ページ、年別ページ、最新ページへの導線が更新されるため、運用負荷を抑えながらSEO資産を増やせます。</p>
      </section>
    </section>
    <section class="collection-body" aria-label="${escapeHtml(title)}">
${monthKeys.reverse().map((key) => {
  const monthlyReports = yearReports.filter(({ report }) => report.latest.reportDate.startsWith(key));
  const monthlyLatest = monthlyReports.at(-1)?.report;
  return `      <article class="collection-card">
        <span class="post-kicker">${escapeHtml(key.replace('-', '年'))}月 / 月次まとめ</span>
        <h2><a href="/performance/${escapeHtml(key.replace('-', '/'))}/">${escapeHtml(key.replace('-', '年'))}月の実績</a></h2>
        <p>${monthlyReports.length}日分の実績を掲載。最新評価額 ${monthlyLatest ? formatJpy(monthlyLatest.latest.jpy.end) : '-'}、100万円比 ${monthlyLatest ? `${monthlyLatest.latest.summary.totalReturnPct >= 0 ? '+' : ''}${monthlyLatest.latest.summary.totalReturnPct.toFixed(2)}%` : '-'}。</p>
        <div class="tag-row"><span>月次実績</span><span>日次URL</span><span>100万円チャレンジ</span></div>
      </article>`;
}).join('\n')}
    </section>
  </main>
${footer}
</body>
</html>
`;
};

const renderLatestPage = (latestReport) => {
  const latestPath = datePath(latestReport.latest.reportDate);
  const title = '最新実績レポート';
  const description = 'MUKIMUKI tradeの最新実績ページ。JavaScriptで最新の実績JSONを読み込み、canonicalを日付固定URLへ向けます。';
  const breadcrumbs = [
    { name: 'Home', item: `${siteUrl}/` },
    { name: '実績公開', item: absoluteUrl('/category/performance/') },
    { name: '最新実績', item: absoluteUrl('/performance/latest/') },
  ];
  const jsonLdScript = renderJsonLdScript({
    pageType: 'collection',
    title,
    description,
    url: absoluteUrl('/performance/latest/'),
    path: '/performance/latest/',
    section: '実績公開',
    breadcrumbs,
    items: [
      { name: `${latestReport.latest.reportDateDisplay} 実績レポート`, path: latestPath },
    ],
  });

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | MUKIMUKI trade</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="noindex,follow,max-image-preview:large">
  <link id="dynamic-canonical" rel="canonical" href="${escapeHtml(absoluteUrl(latestPath))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${title} | MUKIMUKI trade">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl('/performance/latest/'))}">
  <meta property="og:image" content="${siteUrl}/assets/mukimuki-performance.png">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="MUKIMUKI trade RSS" href="/feed.xml">
  <link rel="alternate" type="application/json" title="MUKIMUKI trade latest performance data" href="/datasets/performance-latest.json">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript}
  <script>
    (async () => {
      try {
        const response = await fetch('/datasets/performance-latest.json', { cache: 'no-store' });
        const data = await response.json();
        const [year, month, day] = data.latest.reportDate.split('-');
        const canonicalUrl = \`https://mukimuki-trade.com/performance/\${year}/\${month}/\${day}/\`;
        const canonical = document.getElementById('dynamic-canonical') || document.createElement('link');
        canonical.id = 'dynamic-canonical';
        canonical.rel = 'canonical';
        canonical.href = canonicalUrl;
        if (!canonical.parentNode) document.head.appendChild(canonical);
        document.querySelector('[data-latest-link]').href = \`/performance/\${year}/\${month}/\${day}/\`;
        document.querySelector('[data-report-date]').textContent = data.latest.reportDateDisplay;
        document.querySelector('[data-asset]').textContent = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(data.latest.jpy.end);
        document.querySelector('[data-return]').textContent = \`\${data.latest.summary.totalReturnPct >= 0 ? '+' : ''}\${data.latest.summary.totalReturnPct.toFixed(2)}%\`;
      } catch (error) {
        console.error('Failed to load latest performance data', error);
      }
    })();
  </script>
</head>
<body>
${header}
  <main>
    <section class="article-hero">
      <div class="article-hero-inner">
        ${renderBreadcrumbHtml(breadcrumbs, escapeHtml)}
        <p class="eyebrow">PERFORMANCE / LATEST</p>
        <h1>最新実績レポート</h1>
        <p>このページは常に最新実績を表示します。検索エンジン向けの正規URLは、日付固定ページへ向けます。</p>
      </div>
    </section>
    <article class="article-body">
      <section class="article-panel">
        <h2><span data-report-date>${escapeHtml(latestReport.latest.reportDateDisplay)}</span></h2>
        <div class="stats-grid">
          <div class="stat-card"><span>評価額</span><strong data-asset>${formatJpy(latestReport.latest.jpy.end)}</strong></div>
          <div class="stat-card"><span>100万円比</span><strong data-return>${latestReport.latest.summary.totalReturnPct >= 0 ? '+' : ''}${latestReport.latest.summary.totalReturnPct.toFixed(2)}%</strong></div>
        </div>
        <p><a class="btn btn-primary" data-latest-link href="${escapeHtml(latestPath)}">日付固定URLで読む</a></p>
      </section>
      <section class="article-panel">
        <h2>検索エンジン向けの扱い</h2>
        <p>このページは読者が常に最新実績へ進むための入口です。SEO上の評価を日付別の固定ページに集めるため、canonicalは最新の日付URLへ向け、ページ自体はnoindexにしています。検索に残したい実績本文、FAQ、保有銘柄、売買件数は日付固定ページに蓄積します。</p>
      </section>
    </article>
  </main>
${footer}
</body>
</html>
`;
};

const updateRedirects = async (latestPath) => {
  const redirectsPath = path.join(root, '_redirects');
  const current = await readFile(redirectsPath, 'utf8');
  const lines = current
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('/performance/ '));

  lines.push('/performance/ /performance/latest/ 301');
  await writeFile(redirectsPath, `${lines.join('\n')}\n`);
};

const writePerformancePage = async (pagePath, html) => {
  const outputDir = path.join(outputRoot, pagePath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), html);
};

const { latest, reports } = await loadPerformanceDatasets();
const articleIndex = buildArticleIndex({
  articles,
  posts: content.posts,
  performanceReports: reports.map(({ report }) => report),
});

for (const { report } of reports) {
  await writePerformancePage(datePath(report.latest.reportDate), renderDailyPage(report, articleIndex));
}

const monthKeys = [...new Set(reports.map(({ report }) => report.latest.reportDate.slice(0, 7)))];
for (const key of monthKeys) {
  await writePerformancePage(`/performance/${key.replace('-', '/')}/`, renderMonthPage(`${key}-01`, reports));
}

const yearKeys = [...new Set(reports.map(({ report }) => report.latest.reportDate.slice(0, 4)))];
for (const key of yearKeys) {
  await writePerformancePage(`/performance/${key}/`, renderYearPage(`${key}-01-01`, reports));
}

await writePerformancePage('/performance/latest/', renderLatestPage(latest));
await updateRedirects(datePath(latest.latest.reportDate));

console.log(`Generated ${reports.length} daily performance pages, ${monthKeys.length} month archive page(s), ${yearKeys.length} year archive page(s), and latest page into ${process.env.PERFORMANCE_OUTPUT_DIR || '.'}.`);
