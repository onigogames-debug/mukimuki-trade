const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://mukimuki-trade.com';
const ignoredDirs = new Set(['.git', '.wrangler', '_data', '_includes', '_site', 'assets', 'data', 'datasets', 'node_modules', 'scripts']);
const ignoredRoutes = new Set(['/performance/latest/']);

const normalizeRoute = (filePath) => {
  const relative = path.relative(root, filePath);
  if (relative === 'index.html') return '/';
  if (!relative.endsWith(`${path.sep}index.html`)) return null;
  return `/${relative.slice(0, -'index.html'.length).replaceAll(path.sep, '/')}`;
};

const hasNoindexRobots = (html) => /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

const htmlMeta = (html, name) => {
  const pattern = new RegExp(`<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
  return html.match(pattern)?.[1];
};

const toDateOrNull = (value) => {
  if (!value) return null;
  const datePart = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (datePart) return datePart;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const titleFromHtml = (html, pagePath) => {
  const rawTitle = html.match(/<title>(.*?)<\/title>/is)?.[1];
  return (rawTitle || pagePath)
    .replace(/\s*\|\s*MUKIMUKI trade\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const content = readJson(path.join(root, 'data', 'content.json'), { pages: [], posts: [], site: {} });
const { articles = [] } = readJson(path.join(root, 'data', 'articles.json'), { articles: [] });
const explicitPages = new Map((content.pages || []).map((page) => [page.path, page]));
const articlePages = new Map(articles.map((article) => [article.path, article]));
const postPages = new Map((content.posts || []).map((post) => [post.path, post]));

const walkHtmlPages = (dir = root) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) pages.push(...walkHtmlPages(filePath));
      continue;
    }

    if (!entry.isFile() || entry.name !== 'index.html') continue;
    const route = normalizeRoute(filePath);
    if (!route || ignoredRoutes.has(route)) continue;
    pages.push({ path: route, filePath });
  }

  return pages;
};

const sitemapChangefreqForPath = (pagePath) => {
  if (pagePath === '/') return 'daily';
  if (pagePath === '/performance/') return 'daily';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(pagePath)) return 'weekly';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(pagePath)) return 'weekly';
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(pagePath)) return 'monthly';
  if (/^\/performance\/\d{4}\/$/.test(pagePath)) return 'yearly';
  if (pagePath === '/research/' || /^\/research\/[^/]+\/$/.test(pagePath)) return 'weekly';
  if (pagePath === '/logic/' || /^\/logic\/[^/]+\/$/.test(pagePath)) return 'monthly';
  if (pagePath === '/moomoo/' || pagePath === '/archive/' || pagePath === '/profile/' || pagePath === '/about/') return 'monthly';
  if (pagePath.startsWith('/archive/')) return 'monthly';
  if (pagePath.startsWith('/category/') || pagePath === '/sitemap/') return 'weekly';
  return 'monthly';
};

const sitemapPriorityForPath = (pagePath) => {
  if (pagePath === '/') return '1.0';
  if (pagePath === '/performance/') return '0.8';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(pagePath)) return '0.9';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(pagePath)) return '0.8';
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(pagePath)) return '0.7';
  if (/^\/performance\/\d{4}\/$/.test(pagePath)) return '0.6';
  if (/^\/research\/[^/]+\/$/.test(pagePath)) return '0.7';
  if (pagePath === '/research/') return '0.6';
  if (/^\/logic\/[^/]+\/$/.test(pagePath)) return '0.6';
  if (pagePath === '/logic/' || pagePath === '/moomoo/' || pagePath === '/archive/' || pagePath.startsWith('/archive/') || pagePath.startsWith('/category/') || pagePath === '/sitemap/') return '0.5';
  if (pagePath === '/profile/' || pagePath === '/about/') return '0.4';
  return '0.5';
};

const lastmodForPage = (pagePath, filePath, html) => {
  const article = articlePages.get(pagePath);
  const post = postPages.get(pagePath);
  const explicit = explicitPages.get(pagePath);
  const lastmod = toDateOrNull(article?.modified || article?.modified_time || article?.published)
    || toDateOrNull(post?.modified_time || post?.modified || post?.pubDate)
    || toDateOrNull(explicit?.modified_time || explicit?.modifiedTime || explicit?.lastmod)
    || toDateOrNull(htmlMeta(html, 'article:modified_time') || htmlMeta(html, 'og:updated_time') || htmlMeta(html, 'dateModified'));

  if (lastmod) return lastmod;
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
};

const buildSitemapUrls = () => {
  const pageMap = new Map();

  for (const { path: pagePath, filePath } of walkHtmlPages()) {
    const html = fs.readFileSync(filePath, 'utf8');
    if (hasNoindexRobots(html)) continue;
    pageMap.set(pagePath, {
      path: pagePath,
      url: `${siteUrl}${pagePath}`,
      title: titleFromHtml(html, pagePath),
      lastmod: lastmodForPage(pagePath, filePath, html),
      changefreq: sitemapChangefreqForPath(pagePath),
      priority: sitemapPriorityForPath(pagePath),
    });
  }

  for (const page of content.pages || []) {
    if (!page?.path || ignoredRoutes.has(page.path) || pageMap.has(page.path)) continue;
    pageMap.set(page.path, {
      ...page,
      url: `${siteUrl}${page.path}`,
      title: page.title || page.name || page.path,
      lastmod: toDateOrNull(page.modified_time || page.modifiedTime || page.lastmod || content.site?.lastBuildDate) || new Date().toISOString().slice(0, 10),
      changefreq: sitemapChangefreqForPath(page.path),
      priority: sitemapPriorityForPath(page.path),
    });
  }

  if (!pageMap.has('/sitemap/')) {
    pageMap.set('/sitemap/', {
      path: '/sitemap/',
      url: `${siteUrl}/sitemap/`,
      title: 'サイトマップ',
      lastmod: toDateOrNull(content.site?.lastBuildDate) || new Date().toISOString().slice(0, 10),
      changefreq: sitemapChangefreqForPath('/sitemap/'),
      priority: sitemapPriorityForPath('/sitemap/'),
    });
  }

  return [...pageMap.values()].sort((a, b) => {
    const priority = Number(b.priority) - Number(a.priority);
    return priority || a.path.localeCompare(b.path);
  });
};

buildSitemapUrls.priorityForPath = sitemapPriorityForPath;
buildSitemapUrls.changefreqForPath = sitemapChangefreqForPath;

module.exports = buildSitemapUrls;
