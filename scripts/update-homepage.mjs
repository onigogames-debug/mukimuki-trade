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
indexHtml = indexHtml.replace(heroCardRegex, newHeroCard);

// 2. Update Reading Path START card
const readingPathRegex = /<a class="story-card feature-story" href="\/performance\/[^"]+">([\s\S]*?)<\/a>/;
const newReadingPathCard = `<a class="story-card feature-story" href="${latestArticle.path}">
        <span>START</span>
        <strong>${latestArticle.title}を読む</strong>
        <p>${latestArticle.description}</p>
        <small>最新記事へ</small>
      </a>`;
indexHtml = indexHtml.replace(readingPathRegex, newReadingPathCard);

// 3. Update Hero Actions "最新実績を読む" Button
const heroActionRegex = /<a class="button primary" href="\/performance\/[^"]+">最新実績を読む<\/a>/;
indexHtml = indexHtml.replace(
  heroActionRegex,
  `<a class="button primary" href="${latestDailyPath}">最新実績を読む</a>`
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
indexHtml = indexHtml.replace(articleListRegex, `<div class="article-list">\n${latestArticlesListHtml}\n      </div>\n\n      <div class="category-strip"`);

// 5. Update Inline Performance Data Script
const perfDataRegex = /<script id="perf-data" type="application\/json">([\s\S]*?)<\/script>/;
indexHtml = indexHtml.replace(
  perfDataRegex,
  `<script id="perf-data" type="application/json">${JSON.stringify(latest)}</script>`
);

// Save index.html
await writeFile(indexPath, indexHtml);
console.log('Homepage index.html successfully updated with latest articles and performance!');
