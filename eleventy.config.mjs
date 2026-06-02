import { buildJsonLdScriptFromFrontMatter } from './scripts/structured-data.mjs';
import performanceLatest from './_data/performanceLatest.mjs';
import { extractTickers } from './scripts/internal-links.mjs';

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
