import { buildJsonLdScriptFromFrontMatter } from './scripts/structured-data.mjs';

export default function configureEleventy(eleventyConfig) {
  eleventyConfig.addShortcode('jsonLd', (pageData = {}) => buildJsonLdScriptFromFrontMatter(pageData));
  eleventyConfig.addFilter('jsonLd', (pageData = {}) => buildJsonLdScriptFromFrontMatter(pageData));

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
