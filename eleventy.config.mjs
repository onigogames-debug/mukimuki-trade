import { buildJsonLdScriptFromFrontMatter } from './scripts/structured-data.mjs';
import performanceLatest from './_data/performanceLatest.mjs';

export default function configureEleventy(eleventyConfig) {
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
