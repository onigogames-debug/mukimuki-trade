import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBreadcrumbListJsonLd, buildJsonLdScriptFromFrontMatter } from './scripts/structured-data.mjs';
import performanceLatest from './_data/performanceLatest.mjs';
import {
  buildArticleIndex,
  extractTickers,
  suggestPerformanceArticlesByTickers,
  suggestResearchArticlesByTickers,
} from './scripts/internal-links.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const content = readJson(path.join(root, 'data', 'content.json'), { posts: [] });
const { articles = [] } = readJson(path.join(root, 'data', 'articles.json'), { articles: [] });
const datasetsDir = path.join(root, 'datasets');
const performanceReports = existsSync(datasetsDir)
  ? readdirSync(datasetsDir)
    .filter((file) => /^performance-\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort()
    .map((file) => readJson(path.join(datasetsDir, file), null))
    .filter(Boolean)
  : [];
const defaultArticleIndex = buildArticleIndex({ articles, posts: content.posts, performanceReports });

const relatedItemForTemplate = (article) => ({
  title: article.title,
  url: article.url || article.path,
  path: article.path,
  ticker: article.ticker,
  tickers: article.matchedTickers || [],
  date: article.date,
  description: article.description || article.summary || '',
});

const renderBreadcrumbJsonLdScript = (pagePath = '/', title = '') => {
  const schema = buildBreadcrumbListJsonLd(pagePath, { title });
  const json = JSON.stringify(schema, null, 2).replaceAll('</script', '<\\/script');
  return `<script type="application/ld+json">${json}</script>`;
};

function tickerArchivePlugin(eleventyConfig) {
  eleventyConfig.addCollection('tickerArchives', (collectionApi) => {
    const tickerMap = new Map();
    for (const item of collectionApi.getAll()) {
      const tags = item.data.tags || [];
      const body = `${item.data.title || ''} ${item.data.description || ''} ${tags.join(' ')} ${item.templateContent || ''}`;
      for (const ticker of extractTickers(body)) {
        if (!tickerMap.has(ticker)) tickerMap.set(ticker, []);
        tickerMap.get(ticker).push(item);
      }
    }
    return [...tickerMap.entries()].map(([ticker, items]) => ({
      ticker,
      url: `/research/tag/${ticker.toLowerCase()}/`,
      title: `${ticker}の銘柄検討記事一覧 | MUKIMUKI trade`,
      items,
    }));
  });

  eleventyConfig.addCollection('tradeTopics', (collectionApi) => (
    collectionApi.getAll()
      .filter((item) => /^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(item.url || item.data?.page?.url || ''))
      .sort((a, b) => String(b.data?.date || b.date || '').localeCompare(String(a.data?.date || a.date || '')))
  ));
}

export default function configureEleventy(eleventyConfig) {
  eleventyConfig.addPlugin(tickerArchivePlugin);
  eleventyConfig.addShortcode('jsonLd', (pageData = {}) => buildJsonLdScriptFromFrontMatter(pageData));
  eleventyConfig.addFilter('jsonLd', (pageData = {}) => buildJsonLdScriptFromFrontMatter(pageData));
  eleventyConfig.addShortcode('breadcrumbJsonLd', (pagePath = '/', title = '') => renderBreadcrumbJsonLdScript(pagePath, title));
  eleventyConfig.addFilter('breadcrumbJsonLd', (pagePath = '/', title = '') => renderBreadcrumbJsonLdScript(pagePath, title));
  eleventyConfig.addFilter('relatedResearchByTickers', (tickers = [], index = defaultArticleIndex) => (
    suggestResearchArticlesByTickers(tickers, Array.isArray(index) ? index : defaultArticleIndex, { max: 3 })
      .map(relatedItemForTemplate)
  ));
  eleventyConfig.addFilter('performanceByTickers', (tickers = [], index = defaultArticleIndex) => (
    suggestPerformanceArticlesByTickers(tickers, Array.isArray(index) ? index : defaultArticleIndex, { max: 5 })
      .map(relatedItemForTemplate)
  ));
  eleventyConfig.addShortcode('inlinePerformanceData', (data = performanceLatest) => {
    const json = JSON.stringify(data).replaceAll('</script', '<\\/script');
    return `<script id="perf-data" type="application/json">${json}</script>`;
  });

  return {
    dir: {
      input: '.',
      includes: '_includes',
      output: '_site',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
