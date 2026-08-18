import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { absoluteUrl, buildBreadcrumbListFromPath, renderJsonLdScript } from './structured-data.mjs';
import { renderBreadcrumbHtml } from './breadcrumbs.mjs';
import { generateDailyPerformanceSeo } from './content-templates.mjs';
import { buildArticleIndex, renderRelatedArticlesSection, renderRelatedResearchSection } from './internal-links.mjs';
import { performanceXPostText, renderTwitterCardTags, renderXShareSection } from './social-sharing.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = process.env.PERFORMANCE_OUTPUT_DIR
  ? path.resolve(root, process.env.PERFORMANCE_OUTPUT_DIR)
  : root;
const datasetsDir = path.join(root, 'datasets');
const articlesPath = path.join(root, 'data', 'articles.json');
const contentPath = path.join(root, 'data', 'content.json');
const siteUrl = 'https://mukimuki-trade.com';
const officialXUrl = 'https://x.com/OnigoGames';
const officialNoteUrl = 'https://note.com/mukimuki_trade';
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

const monthLabel = (key) => {
  const [year, month] = key.split('-');
  return `${year}年${Number(month)}月`;
};

const primaryHoldings = (positions = [], limit = 3) => positions
  .slice(0, limit)
  .map((position) => shortSymbol(position.symbol))
  .filter(Boolean);

const allSymbols = (positions = [], limit = 4) => positions
  .slice(0, limit)
  .map((position) => shortSymbol(position.symbol))
  .filter(Boolean);

const header = `  <header class="site-header">
    <a class="brand" href="/" aria-label="MUKIMUKI trade home">
      <img src="/assets/mukimuki-main.png" alt="MUKIMUKIキャラクター - 100万円トレード記録ブログのロゴ">
      <span><strong>MUKIMUKI trade</strong><small>数字で追う公開記録</small></span>
    </a>
    <details class="site-nav-container">
      <summary aria-label="メニュー">
        <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </summary>
      <nav class="nav-links" aria-label="主要メニュー">
        <a href="/performance/">実績</a>
        <a href="/research/">銘柄検討</a>
        <a href="/logic/">ロジック</a>
        <a href="/moomoo/">moomoo</a>
        <a href="/archive/">アーカイブ</a>
        <a href="/profile/">運営者</a>
        <a href="${officialNoteUrl}" target="_blank" rel="noopener">公式note</a>
        <a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a>
      </nav>
    </details>
  </header>`;

const footer = `  <footer class="site-footer">
    <strong>MUKIMUKI trade</strong>
    <p>100万円からの米国株トレード実績、銘柄メモ、売買ロジックを記録しています。掲載内容には広告リンクを含む場合があります。</p>
    <p class="footer-rss-promo">最新記事をチェック：<a href="/feed.xml" target="_blank" rel="noopener">RSSフィードで更新を購読する</a></p>
    <nav class="footer-links" aria-label="補助リンク"><a href="/profile/">運営者</a><a href="/archive/">アーカイブ</a><a href="/sitemap/">サイトマップ</a><a href="/feed.xml">RSS</a><a href="/about/">運営方針</a><a href="${officialNoteUrl}" target="_blank" rel="noopener">公式note</a><a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a></nav>
  </footer>`;

const renderMukiStamp = (label, tone = 'yellow') => `<span class="muki-stamp muki-stamp--${escapeHtml(tone)}">
          <img src="/assets/mukimuki-main.png" alt="MUKIMUKIキャラクターのチェックスタンプ">
          <strong>${escapeHtml(label)}</strong>
        </span>`;

const renderStampRow = (items = []) => {
  if (!items.length) return '';
  return `        <div class="stamp-row" aria-label="MUKIMUKIチェック">
${items.map(([label, tone]) => `          ${renderMukiStamp(label, tone)}`).join('\n')}
        </div>`;
};

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
  if (!positions.length) return '<p>この日は引け後保有なしです。翌営業日に持ち越した含み損益はなく、売買履歴と前日比からポジションを外した判断を確認します。</p>';
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
        ${trades.length > 12 ? `<p>主要な約定を先頭から12件掲載しています。全体像は取引件数、買付額、売却額のサマリーで確認します。</p>` : ''}`;
};

const renderTrustSignals = (report) => {
  const latest = report.latest;
  return `      <section class="article-panel trust-signals" aria-labelledby="trust-signals-title">
        <h2 id="trust-signals-title">信頼性の確認</h2>
${renderStampRow([['データ元を確認', 'yellow']])}
        <div class="fact-grid">
          <div class="fact-card">
            <h3>データソース</h3>
            <p>評価額、損益、取引件数、保有銘柄はAutotrade日次レポートをもとに掲載しています。</p>
            <blockquote>Source: ${escapeHtml(report.sourceName || 'Autotrade daily report')} / ${escapeHtml(report.sourceReport || `${latest.reportDate} report`)}</blockquote>
          </div>
          <div class="fact-card">
            <h3>著者と免責</h3>
            <p>運営者情報と投資情報の扱いを明示しています。掲載内容は投資助言ではありません。</p>
            <p><a href="/profile/" rel="author">運営者プロフィール</a> / <a href="/about/">免責事項</a></p>
          </div>
          <div class="fact-card">
            <h3>検証用リンク</h3>
            <p>日次ページは月次アーカイブへ保存し、最新の公開データも確認できるようにしています。</p>
            <p><a href="${escapeHtml(monthPath(latest.reportDate))}">月次アーカイブ</a> / <a href="/datasets/performance-latest.json">公開JSONデータ</a></p>
          </div>
        </div>
      </section>`;
};

const renderDailyPagination = (report, reports) => {
  const dates = reports.map((entry) => entry.report.latest.reportDate).sort();
  const currentDate = report.latest.reportDate;
  const currentIndex = dates.indexOf(currentDate);
  const prevDate = currentIndex > 0 ? dates[currentIndex - 1] : '';
  const nextDate = currentIndex >= 0 && currentIndex < dates.length - 1 ? dates[currentIndex + 1] : '';

  if (!prevDate && !nextDate) return '';

  return `      <nav class="pagination-nav" aria-label="日次実績の前後移動">
        ${prevDate ? `<a href="${escapeHtml(datePath(prevDate))}"><span>前日</span><strong>${escapeHtml(displayDate(prevDate))}</strong></a>` : '<span></span>'}
        ${nextDate ? `<a href="${escapeHtml(datePath(nextDate))}"><span>翌日</span><strong>${escapeHtml(displayDate(nextDate))}</strong></a>` : '<span></span>'}
      </nav>`;
};

const renderDailyPage = (report, articleIndex, reports) => {
  const latest = report.latest;
  const pagePath = datePath(latest.reportDate);
  const monthlyPath = monthPath(latest.reportDate);
  const holdings = primaryHoldings(latest.positions);
  
  // Rich holdings insight
  let holdingsInsight = '';
  if (latest.positions && latest.positions.length > 0) {
    const totalHoldingUsd = latest.positions.reduce((sum, p) => sum + (p.shares * p.averagePriceUsd), 0);
    const posDetails = latest.positions.map(p => {
      const pnlText = p.unrealizedPnlPct >= 0 ? `+${(p.unrealizedPnlPct * 100).toFixed(1)}%` : `${(p.unrealizedPnlPct * 100).toFixed(1)}%`;
      return `${p.symbol.replace(/^US\./, '')} (${p.shares}株, 平均単価: $${p.averagePriceUsd.toFixed(2)}, 含み損益: ${pnlText})`;
    }).join('、');
    holdingsInsight = `引け後に保有している銘柄は ${latest.positions.length} 件で、保有銘柄の内訳は ${posDetails} です。ポジションの総評価額は約 $${Math.round(totalHoldingUsd).toLocaleString('en-US')} となっています。保有銘柄ごとに上昇要因・下落要因を確認し、次の日足サポートラインや決算などの株価材料に沿ってリスク調整を行います。`;
  } else {
    holdingsInsight = 'この日は引け後に保有株はなく、完全なノーポジション（現金比率100%）でクローズしました。相場全体のセンチメント過熱や金利上昇などの地合いリスクから一時退避し、次の明確な売買シグナル点灯を待つニュートラルな判断を行っています。';
  }

  // Rich trades insight
  let tradesInsight = '';
  if (latest.trades && latest.trades.length > 0) {
    const buyTrades = latest.trades.filter(t => t.side === 'BUY' || t.side === 'BUY_TO_OPEN');
    const sellTrades = latest.trades.filter(t => t.side === 'SELL' || t.side === 'SELL_TO_CLOSE' || t.side === 'CLOSED_TRADE_SELL');
    const buyTotal = buyTrades.reduce((sum, t) => sum + (t.amountUsd || (t.shares * t.priceUsd)), 0);
    const sellTotal = sellTrades.reduce((sum, t) => sum + (t.amountUsd || (t.shares * t.priceUsd)), 0);
    
    tradesInsight = `この日は合計 ${latest.summary.totalTrades} 件の約定（買付 ${buyTrades.length} 件、売却 ${sellTrades.length} 件）を記録しました。一日の取引総額は買付 $${Math.round(buyTotal).toLocaleString('en-US')} / 売却 $${Math.round(sellTotal).toLocaleString('en-US')} でした。エントリー価格が適切か、損切りルールに基づいた規律ある撤退ができているかを個別に振り返り、自動売買プログラムの調整に役立てます。`;
  } else {
    tradesInsight = 'この日は新規の買い付けや売却などの取引は約定しませんでした。事前に設定した分割エントリー注文や損切りの逆指値注文の価格帯に市場価格が達しなかったため、ルール通り静観を貫きました。不要な裁量売買（ポジポジ病）を回避できています。';
  }

  const rateText = `${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(1)}%`;
  const dailyReturnText = `${latest.summary.dailyReturnPct >= 0 ? '+' : ''}${latest.summary.dailyReturnPct.toFixed(1)}%`;
  
  // Extract actions context from matched topics in articleIndex
  const dateFormatted = latest.reportDate.replaceAll('-', '/');
  const dateTopicPrefix = `/performance/${dateFormatted}/topics/`;
  const matchedTopics = articleIndex.filter(art => art.path && art.path.startsWith(dateTopicPrefix));
  
  const getActionText = () => {
    const actions = [];
    if (matchedTopics.length > 0) {
      for (const topic of matchedTopics) {
        const titleText = topic.title || '';
        const topicTickers = topic.tickers || [];
        if (topicTickers.length > 0) {
          const ticker = topicTickers[0];
          if (titleText.includes('利確') || titleText.includes('利益確定')) {
            actions.push(`${ticker}利確`);
          } else if (titleText.includes('損切') || titleText.includes('ロスカット')) {
            actions.push(`${ticker}損切`);
          } else if (titleText.includes('決済') || titleText.includes('売却')) {
            actions.push(`${ticker}決済`);
          } else if (titleText.includes('買') || titleText.includes('仕込') || titleText.includes('エントリー')) {
            actions.push(`${ticker}買い`);
          }
        }
      }
    }
    
    // Check other tickers if they also had sells/buys
    if (actions.length === 0 && latest.trades && latest.trades.length > 0) {
      const buys = [...new Set(latest.trades.filter(t => t.side === 'BUY' || t.side === 'BUY_TO_OPEN').map(t => t.symbol.replace(/^US\./, '')))];
      const sells = [...new Set(latest.trades.filter(t => t.side === 'SELL' || t.side === 'SELL_TO_CLOSE' || t.side === 'CLOSED_TRADE_SELL').map(t => t.symbol.replace(/^US\./, '')))];
      if (sells.length) {
        actions.push(`${sells.slice(0, 2).join('・')}決済`);
      }
      if (buys.length) {
        actions.push(`${buys.slice(0, 2).join('・')}買い`);
      }
    }
    
    if (actions.length === 0) {
      return '取引なし';
    }
    return actions.slice(0, 2).join('・');
  };
  
  const actionText = getActionText();
  
  const dates = reports.map((entry) => entry.report.latest.reportDate).sort();
  const currentIndex = dates.indexOf(latest.reportDate);
  const prevDate = currentIndex > 0 ? dates[currentIndex - 1] : '';
  const nextDate = currentIndex >= 0 && currentIndex < dates.length - 1 ? dates[currentIndex + 1] : '';
  const seo = generateDailyPerformanceSeo({
    date: latest.reportDate,
    rate: rateText,
    rateNum: `${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(2)}%`,
    jpyTotal: Math.round(latest.jpy.end).toLocaleString('ja-JP'),
    dailyPnl: `${latest.jpy.delta >= 0 ? '+' : ''}${Math.round(latest.jpy.delta).toLocaleString('ja-JP')}`,
    holdings,
    tradeCount: latest.summary.totalTrades,
    prevDate,
    nextDate,
    rateStr: dailyReturnText,
    actionText,
  });
  const { title, h1, metaDescription: description, intro, faqs } = seo;
  const breadcrumbs = buildBreadcrumbListFromPath(pagePath);
  const jsonLdScript = renderJsonLdScript({
    pageType: 'daily-performance',
    title,
    headline: h1,
    description,
    published_time: report.generatedAt,
    modified_time: report.generatedAt,
    author: 'MUKIMUKI trade',
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    image: '/assets/mukimuki-performance.png',
    keywords: ['100万円トレード', '投資実績公開', '米国株', '100万円チャレンジ', latest.reportDate, ...(holdings.length ? holdings : ['ノーポジション'])],
    breadcrumbs,
    faq: faqs,
  });
  const relatedContext = {
    title,
    description,
    summary: `${latest.reportDateDisplay} ${(latest.positions || []).length ? `保有銘柄 ${(latest.positions || []).map((position) => position.symbol).join(', ')}` : '引け後保有なし'}`,
    path: pagePath,
    category: '実績公開',
    categoryKey: 'performance',
    tags: ['実績公開', '100万円チャレンジ', ...((latest.positions || []).length ? (latest.positions || []).map((position) => position.symbol) : ['ノーポジション'])],
    tickers: (latest.positions || []).map((position) => shortSymbol(position.symbol)),
  };

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
${renderTwitterCardTags({
    title: `${title} | MUKIMUKI trade`,
    description,
    url: absoluteUrl(pagePath),
    image: `${siteUrl}/assets/mukimuki-performance.png`,
    escapeHtml,
  })}
  <meta property="article:published_time" content="${escapeHtml(report.generatedAt)}">
  <meta property="article:modified_time" content="${escapeHtml(report.generatedAt)}">
  <meta property="article:section" content="実績公開">
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
        ${renderBreadcrumbHtml(breadcrumbs, escapeHtml)}
        <p class="eyebrow">PERFORMANCE / DAILY ARCHIVE</p>
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(intro)}</p>
${renderStampRow([['数字チェック', 'yellow'], ['投資助言ではありません', 'alert']])}
      </div>
    </section>
    <article class="article-body">
      <section class="article-panel">
        <h2>${escapeHtml(seo.h2s[0])}</h2>
${renderStampRow([['まず評価額', 'blue']])}
        ${renderMetrics(report)}
      </section>
${renderTrustSignals(report)}
      <section class="article-panel">
        <h2>${escapeHtml(seo.h2s[1])}</h2>
        <p>${escapeHtml(holdingsInsight)}</p>
      </section>
      <section class="article-panel">
        <h2>主要保有銘柄</h2>
        ${renderPositions(latest.positions)}
      </section>
      <section class="article-panel">
        <h2>${escapeHtml(seo.h2s[2])}</h2>
        <p>${escapeHtml(tradesInsight)}</p>
        ${renderTrades(latest.trades)}
      </section>
      <section class="article-panel">
        <h2>${escapeHtml(seo.h2s[3])}</h2>
        <p>Autotradeの日次レポートで約定、保有、資産推移を確認し、裁量判断ではニュース、出来高、決算、指数の方向感を重ねて見ます。自動売買だけに寄せず、翌日に残す銘柄と外す銘柄を分けて記録します。</p>
      </section>
      <section class="article-panel">
        <h2>${escapeHtml(seo.h2s[4])}</h2>
        <p><a href="${escapeHtml(monthlyPath)}">月次アーカイブ</a>、<a href="/category/performance/">売買トピック</a>、<a href="/logic/">投資ロジック</a>では、同じ期間の資産推移と判断基準を別の角度から整理しています。</p>
      </section>
${renderDailyPagination(report, reports)}
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
${renderRelatedResearchSection(relatedContext, articleIndex, { escapeHtml })}
${renderXShareSection({
    url: absoluteUrl(pagePath),
    title,
    text: performanceXPostText({ report, url: absoluteUrl(pagePath) }),
    hashtags: ['MUKIMUKItrade', '米国株', '投資記録', ...holdings.slice(0, 2)],
    escapeHtml,
  })}
    </article>
  </main>
${footer}
</body>
</html>
`;
};

const renderMonthSummaryTable = (monthReports) => {
  if (!monthReports.length) return '<p>この月の実績データはまだありません。</p>';

  return `<div class="performance-table-wrap">
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
${monthReports.map(({ report }) => `            <tr>
              <td><a href="${escapeHtml(datePath(report.latest.reportDate))}">${escapeHtml(displayDate(report.latest.reportDate))}</a></td>
              <td>${escapeHtml(formatJpy(report.latest.jpy.end))}</td>
              <td>${escapeHtml(`${report.latest.jpy.delta >= 0 ? '+' : ''}${formatJpy(report.latest.jpy.delta)}`)}</td>
              <td>${escapeHtml(allSymbols(report.latest.positions).join(' / ') || '-')}</td>
            </tr>`).join('\n')}
          </tbody>
        </table>
      </div>`;
};

const renderMonthPagination = (currentKey, reports) => {
  const monthKeys = [...new Set(reports.map(({ report }) => report.latest.reportDate.slice(0, 7)))].sort();
  const currentIndex = monthKeys.indexOf(currentKey);
  const prevKey = currentIndex > 0 ? monthKeys[currentIndex - 1] : '';
  const nextKey = currentIndex >= 0 && currentIndex < monthKeys.length - 1 ? monthKeys[currentIndex + 1] : '';

  if (!prevKey && !nextKey) return '';

  return `      <nav class="pagination-nav" aria-label="月次実績の前後移動">
        ${prevKey ? `<a href="/performance/${escapeHtml(prevKey.replace('-', '/'))}/"><span>前月</span><strong>${escapeHtml(monthLabel(prevKey))}</strong></a>` : '<span></span>'}
        ${nextKey ? `<a href="/performance/${escapeHtml(nextKey.replace('-', '/'))}/"><span>翌月</span><strong>${escapeHtml(monthLabel(nextKey))}</strong></a>` : '<span></span>'}
      </nav>`;
};

const countValues = (values = []) => {
  const counts = new Map();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
};

const topCountEntries = (counts, limit = 6) => [...counts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, limit);

const buildMonthInsights = (monthReports) => {
  if (!monthReports.length) return null;
  const sorted = [...monthReports].sort((a, b) => a.report.latest.reportDate.localeCompare(b.report.latest.reportDate));
  const first = sorted[0].report.latest;
  const last = sorted.at(-1).report.latest;
  const dayRows = sorted.map(({ report }) => report.latest);
  const bestDay = [...dayRows].sort((a, b) => b.jpy.delta - a.jpy.delta)[0];
  const worstDay = [...dayRows].sort((a, b) => a.jpy.delta - b.jpy.delta)[0];
  const totalTrades = dayRows.reduce((sum, latest) => sum + Number(latest.summary.totalTrades || 0), 0);
  const winningDays = dayRows.filter((latest) => Number(latest.jpy.delta || 0) >= 0).length;
  const monthStart = Number(first.jpy.start || first.jpy.end || 0);
  const monthEnd = Number(last.jpy.end || 0);
  const monthDelta = monthEnd - monthStart;
  const monthReturnPct = monthStart ? (monthDelta / monthStart) * 100 : 0;
  const tradeTickers = dayRows.flatMap((latest) => (latest.trades || []).map((trade) => shortSymbol(trade.symbol)));
  const holdingTickers = dayRows.flatMap((latest) => (latest.positions || []).map((position) => shortSymbol(position.symbol)));
  const activeTickers = topCountEntries(countValues([...tradeTickers, ...holdingTickers]), 8);
  const latestHoldings = allSymbols(last.positions, 6);

  return {
    bestDay,
    worstDay,
    totalTrades,
    winningDays,
    monthStart,
    monthEnd,
    monthDelta,
    monthReturnPct,
    activeTickers,
    latestHoldings,
    dayCount: dayRows.length,
  };
};

const renderMonthInsights = (monthReports, label) => {
  const insights = buildMonthInsights(monthReports);
  if (!insights) return '';
  const activeTickerText = insights.activeTickers.length
    ? insights.activeTickers.map(([ticker, count]) => `${ticker}(${count})`).join(' / ')
    : '主要銘柄は日次レポートの追加にあわせて更新されます。';
  const latestHoldingsText = insights.latestHoldings.length ? insights.latestHoldings.join(' / ') : '-';
  const bestDayText = `${displayDate(insights.bestDay.reportDate)} ${insights.bestDay.jpy.delta >= 0 ? '+' : ''}${formatJpy(insights.bestDay.jpy.delta)}`;
  const worstDayText = `${displayDate(insights.worstDay.reportDate)} ${insights.worstDay.jpy.delta >= 0 ? '+' : ''}${formatJpy(insights.worstDay.jpy.delta)}`;

  return `      <section class="article-panel">
        <h2>${escapeHtml(label)}の運用概況</h2>
${renderStampRow([['月間損益を確認', 'blue'], ['主要銘柄を把握', 'yellow']])}
        <div class="stats-grid">
          <div class="stat-card"><span>月初評価額</span><strong>${escapeHtml(formatJpy(insights.monthStart))}</strong></div>
          <div class="stat-card"><span>月末評価額</span><strong>${escapeHtml(formatJpy(insights.monthEnd))}</strong></div>
          <div class="stat-card"><span>月間変化</span><strong>${insights.monthDelta >= 0 ? '+' : ''}${escapeHtml(formatJpy(insights.monthDelta))}</strong></div>
          <div class="stat-card"><span>月間リターン</span><strong>${insights.monthReturnPct >= 0 ? '+' : ''}${insights.monthReturnPct.toFixed(2)}%</strong></div>
          <div class="stat-card"><span>記録日数</span><strong>${escapeHtml(insights.dayCount)}日</strong></div>
          <div class="stat-card"><span>総取引数</span><strong>${escapeHtml(insights.totalTrades)}件</strong></div>
        </div>
        <p>${escapeHtml(label)}は、${escapeHtml(insights.dayCount)}日分の実績をもとに月間変化、取引数、主要銘柄を整理しています。日別の勝ち負けだけでなく、どの日に評価額が動き、どの銘柄が繰り返し出ているかを確認します。</p>
        <div class="fact-grid">
          <div class="fact-card">
            <h3>上昇日と調整日</h3>
            <p>プラス日: ${escapeHtml(insights.winningDays)}日 / 最良日: <a href="${escapeHtml(datePath(insights.bestDay.reportDate))}">${escapeHtml(bestDayText)}</a> / 最大調整: <a href="${escapeHtml(datePath(insights.worstDay.reportDate))}">${escapeHtml(worstDayText)}</a></p>
          </div>
          <div class="fact-card">
            <h3>主要銘柄</h3>
            <p>${escapeHtml(activeTickerText)}</p>
          </div>
          <div class="fact-card">
            <h3>月末時点の保有</h3>
            <p>${escapeHtml(latestHoldingsText)}</p>
          </div>
        </div>
      </section>`;
};

const renderMonthSearchConsoleChecklist = (pagePath) => `      <section class="article-panel">
        <h2>検索流入の確認メモ</h2>
        <p>この月次まとめは、日次実績と売買トピックへの内部リンクを集約するページです。Search Consoleでは、<code>${escapeHtml(pagePath)}</code> のインデックス登録、日次ページへの内部リンク認識、旧売買トピックURLの301反映を確認します。</p>
      </section>`;

const renderMonthPage = (date, reports) => {
  const { year, month } = dateParts(date);
  const monthKey = `${year}-${month}`;
  const pagePath = `/performance/${year}/${month}/`;
  const title = `${year}年${Number(month)}月の実績まとめ: 米国株トレード記録`;
  const description = `MUKIMUKI tradeの${year}年${Number(month)}月実績まとめ。米国株トレードの日付別評価額、前日比、保有銘柄を一覧で確認できます。`;
  const monthReports = reports
    .filter(({ report }) => report.latest.reportDate.startsWith(`${year}-${month}`))
    .sort((a, b) => a.report.latest.reportDate.localeCompare(b.report.latest.reportDate));
  const jsonLdScript = renderJsonLdScript({
    pageType: 'monthly-archive',
    title,
    description,
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    breadcrumbs: buildBreadcrumbListFromPath(pagePath),
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
${renderTwitterCardTags({
    title: `${title} | MUKIMUKI trade`,
    description,
    url: absoluteUrl(pagePath),
    image: `${siteUrl}/assets/mukimuki-performance.png`,
    escapeHtml,
  })}
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
        ${renderBreadcrumbHtml(buildBreadcrumbListFromPath(pagePath), escapeHtml)}
        <p class="eyebrow">PERFORMANCE / MONTHLY ARCHIVE</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${year}年${Number(month)}月の米国株トレード記録を、日付、評価額、前日比、保有銘柄で一覧化しています。気になる日は日次ページで100万円比、売買件数、取引の背景を確認できます。</p>
${renderStampRow([['月次で比較', 'blue'], ['日別に深掘り', 'yellow']])}
      </div>
    </section>
    <section class="article-body">
${renderMonthInsights(monthReports, `${year}年${Number(month)}月`)}
      <section class="article-panel">
        <h2>月間サマリー表</h2>
        ${renderMonthSummaryTable(monthReports)}
      </section>
${renderMonthPagination(monthKey, reports)}
    </section>
    <section class="collection-body" aria-label="${escapeHtml(title)}の日次レポート">
${[...monthReports].reverse().map(({ report }) => `      <article class="collection-card">
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
${renderMonthSearchConsoleChecklist(pagePath)}
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
    pageType: 'yearly-archive',
    title,
    description,
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    breadcrumbs: buildBreadcrumbListFromPath(pagePath),
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

  const getWeekKey = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const weeklyReportsMap = new Map();
  for (const { report } of yearReports) {
    const weekKey = getWeekKey(report.latest.reportDate);
    weeklyReportsMap.set(weekKey, report);
  }

  const sortedWeekKeys = [...weeklyReportsMap.keys()].sort();
  const weeklyDataPoints = sortedWeekKeys.map((weekKey) => {
    const report = weeklyReportsMap.get(weekKey);
    const [, month, day] = weekKey.split('-');
    return {
      label: `${Number(month)}/${Number(day)}週`,
      value: report.latest.jpy.end,
      url: `/performance/${report.latest.reportDate.replaceAll('-', '/')}/`,
      dateLabel: `${report.latest.reportDate.replaceAll('-', '.')} EST 時点`,
    };
  });

  const chartPoints = [
    {
      label: 'スタート',
      value: 1000000,
      url: '/performance/',
      dateLabel: '元本100万円開始時点',
    },
    ...weeklyDataPoints,
  ];

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
${renderTwitterCardTags({
    title: `${title} | MUKIMUKI trade`,
    description,
    url: absoluteUrl(pagePath),
    image: `${siteUrl}/assets/mukimuki-performance.png`,
    escapeHtml,
  })}
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
        ${renderBreadcrumbHtml(buildBreadcrumbListFromPath(pagePath), escapeHtml)}
        <p class="eyebrow">PERFORMANCE / YEARLY ARCHIVE</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${year}年の月次まとめと日次実績をたどる入口です。最新実績だけでなく、月単位・日単位の固定URLを積み上げて、過去のトレード記録を検索資産として残します。</p>
${renderStampRow([['年次アーカイブ', 'blue']])}
      </div>
    </section>
    <section class="article-body">
      <div class="chart-panel" style="margin-bottom: 28px;">
        <div>
          <p class="eyebrow">WEEKLY ASSET LINE</p>
          <h3>週次の資産推移を折れ線グラフで確認</h3>
        </div>
        <canvas id="weeklyPerformanceChart" width="980" height="380" aria-label="週次ベースの資産曲線チャート"></canvas>
      </div>

      <section class="article-panel">
        <h2>${year}年の概況</h2>
        <div class="stats-grid">
          <div class="stat-card"><span>記録日数</span><strong>${escapeHtml(yearReports.length)}日</strong></div>
          <div class="stat-card"><span>最新評価額</span><strong>${latestReport ? formatJpy(latestReport.latest.jpy.end) : '-'}</strong></div>
          <div class="stat-card"><span>期間内変化</span><strong>${yearlyDelta >= 0 ? '+' : ''}${formatJpy(yearlyDelta)}</strong></div>
        </div>
        <p>年次ページでは、月ごとの実績ページへ進み、そこから日次レポートを確認できます。評価額、前日比、取引数、保有銘柄を同じ形式で残すことで、実績公開ブログとしての履歴を読み返しやすくします。</p>
        <p>${year}年の実績全体を俯瞰し、月次まとめと日次レポートをたどれる年次アーカイブです。月ごとの変化と日々の売買記録を分けて読むことで、100万円トレードの推移を振り返りやすくしています。</p>
        <p>年次ページで全体の流れをつかみ、月次ページで好調日と調整日を比較し、日次ページで保有銘柄、売買件数、前日比を確認できます。</p>
        <p>日次の実績だけでは、好調な銘柄に資金が集まったのか、相場全体の追い風で評価額が伸びたのかを判別しにくくなります。年次アーカイブでは、月ごとの評価額、取引件数、持ち越し銘柄の変化をたどり、運用の流れを大きく確認します。</p>
        <p>今後レポートが増えた場合も、この年次ページには月次まとめが追加されます。日別、月別、年別の記録を同じ形式で残していきます。</p>
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
  <script>
    (function() {
      const canvas = document.getElementById("weeklyPerformanceChart");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const points = ${JSON.stringify(chartPoints)};
      if (!points || points.length === 0) return;

      const padding = { top: 76, right: 40, bottom: 60, left: 90 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const values = points.map(function(p) { return p.value; });
      const rawMin = Math.min.apply(null, values.concat([1000000]));
      const rawMax = Math.max.apply(null, values.concat([1000000]));
      const min = Math.floor((rawMin - 50000) / 50000) * 50000;
      const max = Math.ceil((rawMax + 50000) / 50000) * 50000;

      const xFor = function(index) {
        if (points.length <= 1) return padding.left + chartWidth / 2;
        return padding.left + (chartWidth / (points.length - 1)) * index;
      };
      const yFor = function(val) {
        return padding.top + chartHeight - ((val - min) / (max - min)) * chartHeight;
      };

      let clickTargets = [];
      let hoveredIndex = null;

      function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#111827";
        ctx.font = "700 16px system-ui, sans-serif";
        ctx.fillText("週次資産推移 (" + ${year} + "年)", padding.left, 28);

        ctx.strokeStyle = "rgba(17, 24, 39, 0.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(width - padding.right, padding.top + chartHeight);
        ctx.stroke();

        ctx.strokeStyle = "rgba(17, 24, 39, 0.1)";
        ctx.fillStyle = "rgba(17, 24, 39, 0.68)";
        ctx.font = "700 11px system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        const yTickCount = 5;
        for (let i = 0; i < yTickCount; i++) {
          const val = min + ((max - min) / (yTickCount - 1)) * i;
          const y = yFor(val);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          ctx.fillText("¥" + Math.round(val).toLocaleString(), padding.left - 10, y);
        }

        const baselineY = yFor(1000000);
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = "rgba(31, 94, 255, 0.42)";
        ctx.beginPath();
        ctx.moveTo(padding.left, baselineY);
        ctx.lineTo(width - padding.right, baselineY);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#1f5eff";
        ctx.textAlign = "left";
        ctx.fillText("基準元本 ¥1,000,000", padding.left + 8, baselineY - 10);

        ctx.fillStyle = "rgba(17, 24, 39, 0.68)";
        ctx.font = "700 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        points.forEach(function(point, index) {
          const x = xFor(index);
          ctx.beginPath();
          ctx.moveTo(x, padding.top + chartHeight);
          ctx.lineTo(x, padding.top + chartHeight + 4);
          ctx.strokeStyle = "rgba(17, 24, 39, 0.2)";
          ctx.stroke();
          ctx.fillText(point.label, x, padding.top + chartHeight + 8);
        });

        const coords = points.map(function(point, index) {
          return {
            x: xFor(index),
            y: yFor(point.value),
          };
        });

        clickTargets = coords.map(function(point, index) {
          return {
            x: point.x,
            y: point.y,
            url: points[index].url,
            label: points[index].dateLabel,
            value: points[index].value,
          };
        });

        if (points.length > 1) {
          ctx.beginPath();
          coords.forEach(function(point, index) {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.lineTo(coords[coords.length - 1].x, padding.top + chartHeight);
          ctx.lineTo(coords[0].x, padding.top + chartHeight);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
          gradient.addColorStop(0, "rgba(31, 94, 255, 0.2)");
          gradient.addColorStop(1, "rgba(31, 94, 255, 0.01)");
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.beginPath();
          coords.forEach(function(point, index) {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.strokeStyle = "#1f5eff";
          ctx.lineWidth = 4;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.stroke();
        }

        coords.forEach(function(point, index) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = index === coords.length - 1 ? "#df5142" : "#f5c84b";
          ctx.fill();
          ctx.strokeStyle = "#111827";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        });

        if (hoveredIndex !== null && clickTargets[hoveredIndex]) {
          const target = clickTargets[hoveredIndex];
          ctx.save();

          ctx.beginPath();
          ctx.arc(target.x, target.y, 11, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(31, 94, 255, 0.2)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(target.x, target.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#1f5eff";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = "bold 11px system-ui, sans-serif";
          const textDate = target.label;
          const textVal = "評価額: ¥" + Math.round(target.value).toLocaleString();
          const textLink = target.url === "/performance/" ? "クリックで最新実績へ ↗" : "クリックで実績詳細へ ↗";
          const metrics = [ctx.measureText(textDate), ctx.measureText(textVal), ctx.measureText(textLink)];
          const tooltipWidth = Math.max.apply(null, metrics.map(function(m) { return m.width; })) + 20;
          const tooltipHeight = 64;

          let tooltipX = target.x - tooltipWidth / 2;
          if (tooltipX < padding.left) tooltipX = padding.left;
          if (tooltipX + tooltipWidth > width - padding.right) tooltipX = width - padding.right - tooltipWidth;

          let tooltipY = target.y - tooltipHeight - 12;
          if (tooltipY < 10) tooltipY = target.y + 12;

          ctx.fillStyle = "rgba(17, 24, 39, 0.94)";
          ctx.beginPath();
          ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6);
          ctx.fill();

          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          ctx.fillStyle = "rgba(255, 255, 255, 0.76)";
          ctx.fillText(textDate, tooltipX + tooltipWidth / 2, tooltipY + 8);

          ctx.fillStyle = "#f5c84b";
          ctx.fillText(textVal, tooltipX + tooltipWidth / 2, tooltipY + 24);

          ctx.fillStyle = "#93c5fd";
          ctx.font = "800 9px system-ui, sans-serif";
          ctx.fillText(textLink, tooltipX + tooltipWidth / 2, tooltipY + 44);

          ctx.restore();
        }
      }

      draw();

      canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        let nextHovered = null;
        for (let i = 0; i < clickTargets.length; i++) {
          const target = clickTargets[i];
          const dist = Math.hypot(mouseX - target.x, mouseY - target.y);
          if (dist < 18) {
            nextHovered = i;
            break;
          }
        }

        if (nextHovered !== hoveredIndex) {
          hoveredIndex = nextHovered;
          canvas.style.cursor = hoveredIndex !== null ? "pointer" : "default";
          draw();
        }
      });

      canvas.addEventListener("click", () => {
        if (hoveredIndex !== null && clickTargets[hoveredIndex]) {
          window.location.href = clickTargets[hoveredIndex].url;
        }
      });
    })();
  </script>
</body>
</html>
`;
};

const renderPerformanceIndexPage = (latestReport, reports) => {
  const pagePath = '/performance/';
  const latest = latestReport.latest;
  const latestPath = datePath(latest.reportDate);
  const title = '米国株トレード実績公開｜100万円チャレンジの最新記録';
  const description = '100万円から始めた米国株トレードの実績公開ページ。最新評価額、日次損益、月次・年次アーカイブを一覧で確認できます。';
  const recentReports = [...reports].slice(-6).reverse();
  const monthKeys = [...new Set(reports.map(({ report }) => report.latest.reportDate.slice(0, 7)))].sort().reverse();
  const yearKeys = [...new Set(reports.map(({ report }) => report.latest.reportDate.slice(0, 4)))].sort().reverse();
  const breadcrumbs = buildBreadcrumbListFromPath(pagePath, { title: '実績公開' });
  const jsonLdScript = renderJsonLdScript({
    pageType: 'collection',
    title,
    description,
    url: absoluteUrl(pagePath),
    path: pagePath,
    section: '実績公開',
    breadcrumbs,
    items: recentReports.map(({ report }) => ({
      name: `${report.latest.reportDate} 実績レポート`,
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
${renderTwitterCardTags({
    title: `${title} | MUKIMUKI trade`,
    description,
    url: absoluteUrl(pagePath),
    image: `${siteUrl}/assets/mukimuki-performance.png`,
    escapeHtml,
  })}
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
        ${renderBreadcrumbHtml(breadcrumbs, escapeHtml)}
        <p class="eyebrow">PERFORMANCE / INDEX</p>
        <h1>${escapeHtml(title)}</h1>
        <p>毎朝更新する日次実績、月次まとめ、年次まとめをここから確認できます。最新の数字と過去の固定記録を分けてたどれるように整理しています。</p>
${renderStampRow([['実績トップ', 'blue'], ['日付固定URLへ集約', 'yellow']])}
      </div>
    </section>
    <section class="article-body">
      <section class="article-panel">
        <h2>最新の米国株トレード実績</h2>
        <p>${escapeHtml(displayDate(latest.reportDate))}時点の評価額は${formatJpy(latest.jpy.end)}、100万円比は${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(2)}%です。保有銘柄、売買件数、前日比は日付固定URLで確認できます。</p>
        ${renderMetrics(latestReport)}
        <p><a class="btn btn-primary" href="${escapeHtml(latestPath)}">最新の日次実績を読む</a> <a class="btn btn-secondary" href="${escapeHtml(monthPath(latest.reportDate))}">今月の実績まとめ</a></p>
      </section>
      <section class="article-panel">
        <h2>直近の日次実績</h2>
        <div class="link-grid">
${recentReports.map(({ report }) => {
  const holdings = allSymbols(report.latest.positions, 3);
  return `          <a class="link-card" href="${escapeHtml(datePath(report.latest.reportDate))}"><span>${escapeHtml(displayDate(report.latest.reportDate))}</span><strong>${escapeHtml(report.latest.label)}実績レポート</strong><p>評価額 ${formatJpy(report.latest.jpy.end)} / 100万円比 ${report.latest.summary.totalReturnPct >= 0 ? '+' : ''}${report.latest.summary.totalReturnPct.toFixed(2)}%${holdings.length ? ` / ${holdings.join('・')}` : ''}</p></a>`;
}).join('\n')}
        </div>
      </section>
      <section class="article-panel">
        <h2>月次・年次アーカイブ</h2>
        <p>日次ページは固定URLで保存し、月次・年次ページにまとめています。特定の日の売買だけでなく、月単位の評価額推移と保有銘柄の変化を追える構成です。</p>
        <div class="fact-grid">
          <div class="fact-card">
            <h3>月次まとめ</h3>
            <p>${monthKeys.slice(0, 6).map((key) => `<a href="/performance/${escapeHtml(key.replace('-', '/'))}/">${escapeHtml(monthLabel(key))}</a>`).join(' / ')}</p>
          </div>
          <div class="fact-card">
            <h3>年次まとめ</h3>
            <p>${yearKeys.map((year) => `<a href="${escapeHtml(yearPath(`${year}-01-01`))}">${escapeHtml(year)}年</a>`).join(' / ')}</p>
          </div>
          <div class="fact-card">
            <h3>関連ページ</h3>
            <p><a href="/research/">銘柄検討</a> / <a href="/logic/">投資ロジック</a> / <a href="/archive/">記事アーカイブ</a></p>
          </div>
        </div>
      </section>
${renderXShareSection({
    url: absoluteUrl(pagePath),
    title,
    text: `${title}\n最新の日次実績と月次・年次アーカイブをまとめています。`,
    hashtags: ['MUKIMUKItrade', '米国株', '投資記録'],
    escapeHtml,
  })}
    </section>
  </main>
${footer}
</body>
</html>
`;
};

const renderLatestPage = (latestReport) => {
  const latestPath = datePath(latestReport.latest.reportDate);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>最新実績レポート | MUKIMUKI trade</title>
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(latestPath))}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(latestPath)}">
  <script>
    window.location.replace("${escapeHtml(latestPath)}");
  </script>
</head>
<body>
  <p>最新の実績ページへ移動しています。自動的に移動しない場合は、こちらのリンクをクリックしてください：<a href="${escapeHtml(latestPath)}">${escapeHtml(latestPath)}</a></p>
</body>
</html>
`;
};

const updateRedirects = async (latestPath) => {
  const redirectsPath = path.join(root, '_redirects');
  const current = await readFile(redirectsPath, 'utf8');
  const lines = current
    .split('\n')
    .filter((line) => line.trim()
      && !line.startsWith('/performance/ ')
      && !line.startsWith('/performance/latest ')
      && !line.startsWith('/performance/latest/ ')
      && !line.startsWith('/performance/old/ '));

  lines.push(`/performance/latest/ ${latestPath} 302`);
  lines.push(`/performance/latest ${latestPath} 302`);
  lines.push('/performance/old/ /performance/ 301');
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
  await writePerformancePage(datePath(report.latest.reportDate), renderDailyPage(report, articleIndex, reports));
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
await writePerformancePage('/performance/', renderPerformanceIndexPage(latest, reports));
await updateRedirects(datePath(latest.latest.reportDate));

console.log(`Generated performance index, ${reports.length} daily performance pages, ${monthKeys.length} month archive page(s), ${yearKeys.length} year archive page(s), and latest page into ${process.env.PERFORMANCE_OUTPUT_DIR || '.'}.`);
