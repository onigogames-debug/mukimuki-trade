import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { absoluteUrl, renderJsonLdScript } from './structured-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datasetsDir = path.join(root, 'datasets');
const siteUrl = 'https://mukimuki-trade.com';
const officialXUrl = 'https://x.com/OnigoGames';

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
});

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

const displayDate = (date) => date.replaceAll('-', '.');

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

const renderDailyPage = (report) => {
  const latest = report.latest;
  const pagePath = datePath(latest.reportDate);
  const monthlyPath = monthPath(latest.reportDate);
  const title = `${latest.label}実績レポート: 100万円比 ${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(1)}%`;
  const description = `${latest.reportDateDisplay}の固定実績ページ。評価額${formatJpy(latest.jpy.end)}、前日比${formatJpy(latest.jpy.delta)}、取引${latest.summary.totalTrades}件を記録。`;
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
    keywords: ['実績公開', '100万円チャレンジ', '株式投資', latest.reportDate],
    breadcrumbs: [
      { name: 'Home', item: `${siteUrl}/` },
      { name: '実績公開', item: absoluteUrl('/performance/latest/') },
      { name: `${dateParts(latest.reportDate).year}年${Number(dateParts(latest.reportDate).month)}月`, item: absoluteUrl(monthlyPath) },
      { name: latest.reportDateDisplay, item: absoluteUrl(pagePath) },
    ],
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
        <nav class="breadcrumb" aria-label="breadcrumb"><a href="/">Home</a><span>/</span><a href="/performance/latest/">実績公開</a><span>/</span><a href="${escapeHtml(monthlyPath)}">${escapeHtml(dateParts(latest.reportDate).year)}年${Number(dateParts(latest.reportDate).month)}月</a><span>/</span><span>${escapeHtml(latest.reportDateDisplay)}</span></nav>
        <p class="eyebrow">PERFORMANCE / DAILY ARCHIVE</p>
        <h1>${escapeHtml(title)}</h1>
        <p>このページは${escapeHtml(latest.reportDateDisplay)}の固定実績URLです。最新ページが更新されても、この日の評価額、損益、保有銘柄、取引ログは同じURLで残ります。</p>
      </div>
    </section>
    <article class="article-body">
      <section class="article-panel">
        <h2>この日の実績</h2>
        ${renderMetrics(report)}
      </section>
      <section class="article-panel">
        <h2>読者向けの読み方</h2>
        <p>評価額は${formatJpy(latest.jpy.end)}、100万円スタート比は${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(2)}%です。単日の増減だけでなく、取引件数、買付と売却の偏り、翌日に残した銘柄を合わせて見ると、資産曲線の変化を追いやすくなります。</p>
        <p>この記録は投資助言ではありません。銘柄名が出ていても売買を推奨するものではなく、自己運用ログを検証しやすくするための公開データです。</p>
      </section>
      <section class="article-panel">
        <h2>保有銘柄</h2>
        ${renderPositions(latest.positions)}
      </section>
      <section class="article-panel">
        <h2>約定履歴</h2>
        ${renderTrades(latest.trades)}
      </section>
      <section class="article-panel">
        <h2>データ確認</h2>
        <p><a href="/datasets/performance-${escapeHtml(latest.reportDate)}.json">この日のJSONデータ</a>、<a href="/performance/latest/">最新実績</a>、<a href="${escapeHtml(monthlyPath)}">月次アーカイブ</a>を確認できます。</p>
      </section>
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

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | MUKIMUKI trade</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index,follow,max-image-preview:large">
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
        <nav class="breadcrumb" aria-label="breadcrumb"><a href="/">Home</a><span>/</span><span>最新実績</span></nav>
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

  lines.push(`/performance/ ${latestPath} 301`);
  await writeFile(redirectsPath, `${lines.join('\n')}\n`);
};

const { latest, reports } = await loadPerformanceDatasets();

for (const { report } of reports) {
  const outputDir = path.join(root, datePath(report.latest.reportDate));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), renderDailyPage(report));
}

const monthKeys = [...new Set(reports.map(({ report }) => report.latest.reportDate.slice(0, 7)))];
for (const key of monthKeys) {
  const outputDir = path.join(root, 'performance', ...key.split('-'));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), renderMonthPage(`${key}-01`, reports));
}

const latestOutputDir = path.join(root, 'performance', 'latest');
await mkdir(latestOutputDir, { recursive: true });
await writeFile(path.join(latestOutputDir, 'index.html'), renderLatestPage(latest));
await updateRedirects(datePath(latest.latest.reportDate));

console.log(`Generated ${reports.length} daily performance pages, ${monthKeys.length} month archive page, and latest page.`);
