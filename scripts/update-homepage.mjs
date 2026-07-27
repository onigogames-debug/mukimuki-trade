import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const articlesPath = path.join(root, 'data', 'articles.json');
const latestPath = path.join(root, 'datasets', 'performance-latest.json');
const indexPath = path.join(root, 'index.html');

// Read files
let indexHtml = await readFile(indexPath, 'utf8');
const { articles } = JSON.parse(await readFile(articlesPath, 'utf8'));
const latest = JSON.parse(await readFile(latestPath, 'utf8'));

const latestArticle = articles[0]; // SpaceX research article or latest performance topic
const latestDailyPath = `/performance/${latest.latest.reportDate.replaceAll('-', '/')}/`;

// 1. Update Hero Card
const heroCardRegex = /<a class="hero-brief-card hero-brief-card--lead" href="\/performance\/[^"]+">([\s\S]*?)<\/a>/;
const newHeroCard = `<a class="hero-brief-card hero-brief-card--lead" href="${latestArticle.path}">
              <span>TODAY'S STORY</span>
              <strong>まず読む: ${latestArticle.title}</strong>
              <small>最新の解説記事へ</small>
            </a>`;
indexHtml = indexHtml.replace(heroCardRegex, () => newHeroCard);

// 2. Update Reading Path START card
const readingPathRegex = /<a class="story-card feature-story" href="\/performance\/[^"]+">([\s\S]*?)<\/a>/;
const newReadingPathCard = `<a class="story-card feature-story" href="${latestArticle.path}">
        <span>START</span>
        <strong>${latestArticle.title}を読む</strong>
        <p>${latestArticle.description}</p>
        <small>最新記事へ</small>
      </a>`;
indexHtml = indexHtml.replace(readingPathRegex, () => newReadingPathCard);

// 3. Update Hero Actions "最新実績を読む" Button
const heroActionRegex = /<a class="button primary" href="\/performance\/[^"]+">最新実績を読む<\/a>/;
indexHtml = indexHtml.replace(
  heroActionRegex,
  () => `<a class="button primary" href="${latestDailyPath}">最新実績を読む</a>`
);

// 4. Update Article List Section (Top 5 articles)
const categoryImages = {
  performance: '/assets/mukimuki-performance.png',
  research: '/assets/mukimuki-research.png',
  logic: '/assets/mukimuki-editor.png',
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const latestArticlesListHtml = articles.slice(0, 5).map((article, index) => {
  const imgUrl = categoryImages[article.categoryKey] || '/assets/mukimuki-diary.png';
  const kicker = index === 0 ? '最新記事' : (article.categoryKey === 'performance' ? '売買トピック' : '銘柄検討');
  
  return `        <article class="post-card" data-category="${article.categoryKey}">
          <picture data-cwv-picture>
            <img src="${imgUrl}" alt="${article.category}アイコン" width="1226" height="766" loading="lazy" decoding="async">
          </picture>
          <div>
            <span class="post-kicker">${kicker}</span>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.description || article.summary || '')}</p>
            <a href="${article.path}">この記事を読む</a>
          </div>
        </article>`;
}).join('\n');

const articleListRegex = /<div class="article-list">([\s\S]*?)<\/div>\s*<div class="category-strip"/;
indexHtml = indexHtml.replace(articleListRegex, () => `<div class="article-list">\n${latestArticlesListHtml}\n      </div>\n\n      <div class="category-strip"`);

// 5. Update Inline Performance Data Script
if (latest) {
  if (Array.isArray(latest.history)) {
    latest.history = latest.history.map((point) => {
      const pointDate = point.date;
      if (!pointDate) return point;
      const formattedDatePath = pointDate.replaceAll('-', '/');
      const targetTopicPrefix = `/performance/${formattedDatePath}/topics/`;
      const matchedArticle = articles.find((art) => art.path && art.path.startsWith(targetTopicPrefix));
      return {
        ...point,
        articleUrl: matchedArticle ? matchedArticle.path : `/performance/${formattedDatePath}/`
      };
    });
  }

  const perfDataRegex = /<script id="perf-data" type="application\/json">([\s\S]*?)<\/script>/;
  indexHtml = indexHtml.replace(
    perfDataRegex,
    () => `<script id="perf-data" type="application/json">${JSON.stringify(latest)}</script>`
  );
}

// 6. Update script.js Cache Buster Parameter
const scriptRegex = /<script src="script\.js\?v=[^"]+"/;
const currentTimestamp = new Date().toISOString().replaceAll(/[-:.TZ]/g, '').slice(0, 12);
indexHtml = indexHtml.replace(
  scriptRegex,
  () => `<script src="script.js?v=${currentTimestamp}"`
);

// 7. Update Stale Homepage Metrics statically (Point 2)
let latestJpyText = "データ更新中";
let totalPnlText = "データ更新中";
let dailyPnlText = "データ更新中";
let totalReturnText = "データ更新中";
let dailyReturnText = "データ更新中";
let posText = "データ更新中";
let holdSummary = "データ更新中";
let totalPnlPolarity = '';
let dailyPnlPolarity = '';
let tradeCount = '---';
let reportDate = 'データ更新中';
let generatedAt = 'データ更新中';
let isOutdated = false;

if (latest) {
  try {
    const reportTime = new Date(latest.latest.reportDate + 'T12:00:00Z').getTime();
    const diffDays = (new Date().getTime() - reportTime) / (1000 * 60 * 60 * 24);
    if (diffDays > 5) {
      isOutdated = true;
    }
  } catch (err) {
    isOutdated = true;
  }
} else {
  isOutdated = true;
}

if (!isOutdated && latest) {
  const latestJpy = latest.latest.jpy.end;
  const totalPnl = latest.latest.summary.totalPnlJpy;
  const dailyPnl = latest.latest.jpy.delta;
  const totalReturn = latest.latest.summary.totalReturnPct;
  const dailyReturn = latest.latest.summary.dailyReturnPct;
  tradeCount = latest.latest.summary.totalTrades;
  const positions = latest.latest.positions || [];
  reportDate = latest.latest.reportDateDisplay;
  generatedAt = latest.generatedAtDisplay;

  const formatYen = (val) => "¥" + Math.round(val).toLocaleString("ja-JP");
  const formatSignedYen = (val) => (val >= 0 ? "+" : "-") + "¥" + Math.round(Math.abs(val)).toLocaleString("ja-JP");
  const formatSignedPercent = (val) => (val >= 0 ? "+" : "") + val.toFixed(1) + "%";
  const positionsText = (posList) => {
    if (!posList || !posList.length) return "ノーポジション";
    return posList.map(p => `${p.symbol.replace(/^US\./, "")} ${p.shares}株`).join(" / ");
  };
  const holdingSummary = (posList) => {
    if (!posList || !posList.length) return "週末はノーポジション";
    return "引け後保有は" + positionsText(posList);
  };

  latestJpyText = formatYen(latestJpy);
  totalPnlText = formatSignedYen(totalPnl);
  dailyPnlText = formatSignedYen(dailyPnl);
  totalReturnText = formatSignedPercent(totalReturn);
  dailyReturnText = formatSignedPercent(dailyReturn);
  posText = positionsText(positions);
  holdSummary = holdingSummary(positions);
  totalPnlPolarity = totalPnl >= 0 ? 'positive' : 'negative';
  dailyPnlPolarity = dailyPnl >= 0 ? 'positive' : 'negative';
}

const replacePerformanceTag = (html, attrName, value, newPolarity = null) => {
  const regex = new RegExp(`(<[a-zA-Z0-9]+[^>]*\\bdata-performance="${attrName}"[^>]*>)([\\s\\S]*?)(</[a-zA-Z0-9]+>)`, 'gi');
  return html.replace(regex, (match, openingTag, oldContent, closingTag) => {
    let tag = openingTag;
    if (newPolarity !== null) {
      if (/class="[^"]*"/i.test(tag)) {
        tag = tag.replace(/class="[^"]*"/i, `class="${newPolarity}"`);
      } else {
        tag = tag.replace(/>$/, ` class="${newPolarity}">`);
      }
    } else if (newPolarity === '') {
      tag = tag.replace(/\s*class="[^"]*"/i, '');
    }
    return `${tag}${value}${closingTag}`;
  });
};

indexHtml = replacePerformanceTag(indexHtml, 'latest-jpy', latestJpyText);
indexHtml = replacePerformanceTag(indexHtml, 'total-pnl', totalPnlText, totalPnlPolarity);
indexHtml = replacePerformanceTag(indexHtml, 'daily-pnl', dailyPnlText, dailyPnlPolarity);
indexHtml = replacePerformanceTag(indexHtml, 'total-return-label', isOutdated ? 'データ更新中' : `100万円比 ${totalReturnText}`);
indexHtml = replacePerformanceTag(indexHtml, 'total-return', totalReturnText);
indexHtml = replacePerformanceTag(indexHtml, 'daily-return', isOutdated ? 'データ更新中' : `日次 ${dailyReturnText}`);
indexHtml = replacePerformanceTag(indexHtml, 'trade-count', isOutdated ? 'データ更新中' : `約定${tradeCount}件`);
indexHtml = replacePerformanceTag(indexHtml, 'positions', posText);
indexHtml = replacePerformanceTag(indexHtml, 'hero-summary', isOutdated ? 'データ更新中' : `今の状態: 100万円比 ${totalReturnText}。約定${tradeCount}件、${holdSummary}。`);
indexHtml = replacePerformanceTag(indexHtml, 'report-date', reportDate);
indexHtml = replacePerformanceTag(indexHtml, 'dashboard-updated', isOutdated ? `最新データ: データ更新中` : `最新データ: ${reportDate} / 更新: ${generatedAt}`);
indexHtml = replacePerformanceTag(indexHtml, 'latest-title', isOutdated ? 'データ更新中' : `${latest.latest.label || '今日'}の実績: 100万円比 ${totalReturnText}`);

// Save index.html
await writeFile(indexPath, indexHtml);
console.log('Homepage index.html successfully updated with latest articles, performance and cache buster!');
