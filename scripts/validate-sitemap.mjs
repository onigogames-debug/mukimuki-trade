import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitemapPath = path.join(root, 'sitemap.xml');

const parseSitemap = (xml) => [...xml.matchAll(/<url>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<changefreq>(.*?)<\/changefreq>\s*<priority>(.*?)<\/priority>\s*<\/url>/gs)]
  .map((match) => ({
    loc: match[1],
    lastmod: match[2],
    changefreq: match[3],
    priority: match[4],
    path: new URL(match[1]).pathname,
  }));

const expectedForPath = (pagePath) => {
  if (pagePath === '/') return { priority: '1.0', changefreq: 'daily' };
  if (pagePath === '/performance/') return { priority: '0.8', changefreq: 'daily' };
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(pagePath)) return { priority: '0.9', changefreq: 'weekly' };
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(pagePath)) return { priority: '0.8', changefreq: 'weekly' };
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(pagePath)) return { priority: '0.7', changefreq: 'monthly' };
  if (/^\/performance\/\d{4}\/$/.test(pagePath)) return { priority: '0.6', changefreq: 'yearly' };
  if (/^\/research\/[^/]+\/$/.test(pagePath)) return { priority: '0.7', changefreq: 'weekly' };
  if (pagePath === '/research/') return { priority: '0.6', changefreq: 'weekly' };
  if (/^\/logic\/[^/]+\/$/.test(pagePath)) return { priority: '0.6', changefreq: 'monthly' };
  if (pagePath === '/logic/') return { priority: '0.5', changefreq: 'monthly' };
  if (pagePath === '/moomoo/' || pagePath === '/archive/') return { priority: '0.5', changefreq: 'monthly' };
  if (pagePath.startsWith('/archive/')) return { priority: '0.5', changefreq: 'monthly' };
  if (pagePath.startsWith('/category/')) return { priority: '0.5', changefreq: 'weekly' };
  if (pagePath.startsWith('/research/tag/')) return { priority: '0.5', changefreq: 'monthly' };
  if (pagePath === '/sitemap/') return { priority: '0.5', changefreq: 'weekly' };
  if (pagePath === '/profile/' || pagePath === '/about/') return { priority: '0.4', changefreq: 'monthly' };
  return { priority: '0.5', changefreq: 'monthly' };
};

const xml = await readFile(sitemapPath, 'utf8');
const urls = parseSitemap(xml);
const rawUrlCount = (xml.match(/<url>/g) || []).length;
const errors = [];

if (urls.length !== rawUrlCount) {
  errors.push(`Parsed ${urls.length}/${rawUrlCount} sitemap entries. Every <url> must include loc, lastmod, changefreq, and priority.`);
}

for (const entry of urls) {
  if (!entry.lastmod) errors.push(`${entry.loc} is missing lastmod.`);
  if (!entry.changefreq) errors.push(`${entry.loc} is missing changefreq.`);
  if (!entry.priority) errors.push(`${entry.loc} is missing priority.`);
  if (entry.path === '/performance/latest/') errors.push('/performance/latest/ must stay excluded from sitemap.xml.');

  const expected = expectedForPath(entry.path);
  if (entry.changefreq !== expected.changefreq) {
    errors.push(`${entry.loc} changefreq is ${entry.changefreq}, expected ${expected.changefreq}.`);
  }
  if (entry.priority !== expected.priority) {
    errors.push(`${entry.loc} priority is ${entry.priority}, expected ${expected.priority}.`);
  }
}

if (errors.length) {
  console.error(`sitemap.xml validation failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 50)) console.error(`- ${error}`);
  if (errors.length > 50) console.error(`- ...and ${errors.length - 50} more`);
  process.exit(1);
}

console.log(`sitemap.xml validation passed: ${urls.length} URLs include priority/changefreq with SEO routing rules.`);
