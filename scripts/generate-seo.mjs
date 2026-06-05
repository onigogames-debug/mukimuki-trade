import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './structured-data.mjs';

const require = createRequire(import.meta.url);
const loadSitemapUrls = require('../_data/sitemapUrls.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = path.join(root, 'data', 'content.json');
const articlesPath = path.join(root, 'data', 'articles.json');
const content = JSON.parse(await readFile(contentPath, 'utf8'));
const { articles } = JSON.parse(await readFile(articlesPath, 'utf8'));

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const absoluteUrl = (pagePath) => {
  const normalized = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${content.site.url}${normalized}`;
};

const toRssDate = (value) => new Date(value).toUTCString();
const toDate = (value) => new Date(value).toISOString().slice(0, 10);

const ignoredDirs = new Set(['.git', '.wrangler', '_site', 'assets', 'data', 'datasets', 'scripts', 'node_modules']);
const ignoredFiles = new Set(['404.html', 'googlefd5cf11d7eb2c415.html']);
const ignoredRoutes = new Set(['/performance/', '/performance/latest/']);
const hasNoindexRobots = (html) => /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

const htmlPathToRoute = (filePath) => {
  const relative = path.relative(root, filePath);
  if (relative === 'index.html') return '/';
  if (!relative.endsWith('/index.html')) return null;
  const route = `/${relative.slice(0, -'index.html'.length)}`;
  return ignoredRoutes.has(route) ? null : route;
};

const walkHtmlPages = async (dir = root) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      pages.push(...await walkHtmlPages(path.join(dir, entry.name)));
      continue;
    }

    if (!entry.isFile() || entry.name !== 'index.html') continue;
    const filePath = path.join(dir, entry.name);
    if (ignoredFiles.has(path.relative(root, filePath))) continue;
    const route = htmlPathToRoute(filePath);
    if (route) pages.push({ path: route, filePath });
  }

  return pages;
};

const inferChangefreq = (pagePath) => {
  if (pagePath === '/' || pagePath === '/performance/latest/') return 'daily';
  if (pagePath === '/sitemap/') return 'weekly';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(pagePath)) return 'weekly';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(pagePath)) return 'weekly';
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(pagePath)) return 'monthly';
  if (/^\/performance\/\d{4}\/$/.test(pagePath)) return 'yearly';
  if (pagePath.startsWith('/research/')) return 'weekly';
  if (pagePath.startsWith('/logic/')) return 'monthly';
  if (pagePath.startsWith('/archive/')) return 'monthly';
  if (pagePath === '/profile/' || pagePath === '/about/' || pagePath === '/moomoo/') return 'monthly';
  if (pagePath.startsWith('/performance/')) return 'monthly';
  if (pagePath.startsWith('/category/')) return 'weekly';
  return 'monthly';
};

const inferPriority = (pagePath) => {
  if (pagePath === '/') return '1.0';
  if (pagePath === '/performance/latest/') return '0.1';
  if (pagePath === '/sitemap/') return '0.6';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(pagePath)) return '0.9';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(pagePath)) return '0.8';
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(pagePath)) return '0.7';
  if (/^\/performance\/\d{4}\/$/.test(pagePath)) return '0.6';
  if (pagePath.startsWith('/research/')) return '0.7';
  if (pagePath.startsWith('/logic/')) return '0.6';
  if (pagePath === '/moomoo/') return '0.5';
  if (pagePath === '/archive/' || pagePath.startsWith('/archive/')) return '0.5';
  if (pagePath === '/profile/' || pagePath === '/about/') return '0.4';
  if (pagePath.startsWith('/category/')) return '0.5';
  return '0.5';
};

const explicitPages = new Map(content.pages.map((page) => [page.path, page]));
const articlePages = new Map(articles.map((article) => [article.path, article]));
const postPages = new Map(content.posts.map((post) => [post.path, post]));
const discoveredPages = await walkHtmlPages();
const pageMap = new Map();

const htmlMeta = (html, name) => {
  const pattern = new RegExp(`<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
  return html.match(pattern)?.[1];
};

const toDateOrNull = (value) => {
  if (!value) return null;
  const datePart = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (datePart) return datePart;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const titleFromHtml = (html, pagePath) => {
  const rawTitle = html.match(/<title>(.*?)<\/title>/is)?.[1];
  if (!rawTitle) return pagePath;
  return rawTitle
    .replace(/\s*\|\s*MUKIMUKI trade\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const lastmodForPage = async (pagePath, filePath) => {
  const source = await readFile(filePath, 'utf8');
  const { frontMatter } = parseFrontMatter(source);
  const frontMatterDate = toDateOrNull(frontMatter.modified_time || frontMatter.modifiedTime || frontMatter.modified || frontMatter.dateModified);
  if (frontMatterDate) return frontMatterDate;

  const article = articlePages.get(pagePath);
  const articleDate = toDateOrNull(article?.modified || article?.modified_time || article?.published);
  if (articleDate) return articleDate;

  const post = postPages.get(pagePath);
  const postDate = toDateOrNull(post?.modified_time || post?.modified || post?.pubDate);
  if (postDate) return postDate;

  const explicit = explicitPages.get(pagePath);
  const explicitDate = toDateOrNull(explicit?.modified_time || explicit?.modifiedTime || explicit?.lastmod);
  if (explicitDate) return explicitDate;

  const htmlDate = toDateOrNull(
    htmlMeta(source, 'article:modified_time')
    || htmlMeta(source, 'og:updated_time')
    || htmlMeta(source, 'dateModified'),
  );
  if (htmlDate) return htmlDate;

  const fileStat = await stat(filePath);
  return toDate(fileStat.mtime);
};

for (const { path: pagePath, filePath } of discoveredPages) {
  const html = await readFile(filePath, 'utf8');
  if (hasNoindexRobots(html)) continue;
  pageMap.set(pagePath, {
    path: pagePath,
    title: titleFromHtml(html, pagePath),
    lastmod: await lastmodForPage(pagePath, filePath),
    changefreq: inferChangefreq(pagePath),
    priority: inferPriority(pagePath),
  });
}

for (const page of content.pages) {
  if (ignoredRoutes.has(page.path)) continue;
  if (!pageMap.has(page.path)) {
    pageMap.set(page.path, {
      ...page,
      title: page.title || page.name || page.path,
      changefreq: inferChangefreq(page.path),
      priority: inferPriority(page.path),
    });
  }
}

pageMap.set('/sitemap/', {
  path: '/sitemap/',
  title: 'サイトマップ',
  lastmod: toDate(content.site.lastBuildDate),
  changefreq: inferChangefreq('/sitemap/'),
  priority: inferPriority('/sitemap/'),
});

const pages = loadSitemapUrls();

const imageForPage = (pagePath) => {
  if (pagePath.startsWith('/research/')) return '/assets/optimized/mukimuki-research-800.avif';
  if (pagePath.startsWith('/logic/')) return '/assets/optimized/mukimuki-editor-800.avif';
  if (pagePath.startsWith('/moomoo/') || pagePath.startsWith('/category/moomoo/')) return '/assets/optimized/mukimuki-editor-800.avif';
  if (pagePath.startsWith('/archive/') || pagePath.startsWith('/category/')) return '/assets/optimized/mukimuki-diary-800.avif';
  if (pagePath.startsWith('/performance/')) return '/assets/optimized/mukimuki-performance-800.avif';
  return '/assets/optimized/mukimuki-main-800.avif';
};

const imageCaptionForPage = (pagePath) => {
  if (pagePath.startsWith('/research/')) return 'MUKIMUKI tradeの米国株銘柄検討イメージ';
  if (pagePath.startsWith('/logic/')) return 'MUKIMUKI tradeの投資ロジック解説イメージ';
  if (pagePath.startsWith('/moomoo/') || pagePath.startsWith('/category/moomoo/')) return 'moomoo証券の活用メモを読むMUKIMUKI';
  if (pagePath.startsWith('/performance/')) return 'MUKIMUKI tradeの100万円トレード実績イメージ';
  return 'MUKIMUKI trade公式キャラクター';
};

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${escapeXml(absoluteUrl(page.path))}</loc>
    <lastmod>${escapeXml(page.lastmod)}</lastmod>
    <changefreq>${escapeXml(page.changefreq)}</changefreq>
    <priority>${escapeXml(page.priority)}</priority>
  </url>`).join('\n')}
</urlset>
`;

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map((page) => `  <url>
    <loc>${escapeXml(absoluteUrl(page.path))}</loc>
    <image:image>
      <image:loc>${escapeXml(absoluteUrl(imageForPage(page.path)))}</image:loc>
      <image:caption>${escapeXml(imageCaptionForPage(page.path))}</image:caption>
      <image:title>${escapeXml(content.site.title)}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>
`;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(content.site.title)}</title>
    <link>${escapeXml(content.site.url)}/</link>
    <description>${escapeXml(content.site.description)}</description>
    <language>${escapeXml(content.site.language)}</language>
    <lastBuildDate>${escapeXml(toRssDate(content.site.lastBuildDate))}</lastBuildDate>
    <atom:link href="${escapeXml(content.site.url)}/feed.xml" rel="self" type="application/rss+xml"/>
${content.posts.map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(absoluteUrl(post.path))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(post.path))}</guid>
      <pubDate>${escapeXml(toRssDate(post.pubDate))}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;

const sitemapGroups = [
  {
    heading: '主要ページ',
    match: (page) => ['/', '/profile/', '/about/', '/moomoo/', '/archive/', '/sitemap/'].includes(page.path),
  },
  {
    heading: '日次実績',
    match: (page) => /^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(page.path),
  },
  {
    heading: '月次・年次まとめ',
    match: (page) => /^\/performance\/\d{4}\/(\d{2}\/)?$/.test(page.path),
  },
  {
    heading: '売買トピック',
    match: (page) => /^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(page.path),
  },
  {
    heading: '銘柄検討・タグ',
    match: (page) => page.path.startsWith('/research/'),
  },
  {
    heading: '投資ロジック',
    match: (page) => page.path.startsWith('/logic/'),
  },
  {
    heading: 'アーカイブ・カテゴリ',
    match: (page) => (page.path !== '/archive/' && page.path.startsWith('/archive/')) || page.path.startsWith('/category/'),
  },
];

const renderSitemapList = (groupPages) => `      <ul class="sitemap-link-list">
${groupPages.map((page) => `        <li><a href="${escapeHtml(page.path)}">${escapeHtml(page.title || page.path)}</a><span>${escapeHtml(page.path)}</span></li>`).join('\n')}
      </ul>`;

const sitemapHtmlBody = sitemapGroups
  .map((group) => {
    const groupPages = pages.filter(group.match);
    if (!groupPages.length) return '';
    return `    <section class="article-panel">
      <h2>${escapeHtml(group.heading)}</h2>
${renderSitemapList(groupPages)}
    </section>`;
  })
  .filter(Boolean)
  .join('\n');

const sitemapJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'サイトマップ',
      url: `${content.site.url}/sitemap/`,
      inLanguage: content.site.language,
      isPartOf: {
        '@type': 'WebSite',
        name: content.site.title,
        url: `${content.site.url}/`,
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: pages.map((page, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: page.title || page.path,
          url: absoluteUrl(page.path),
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ホーム',
          item: `${content.site.url}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'サイトマップ',
          item: `${content.site.url}/sitemap/`,
        },
      ],
    },
  ],
};

const htmlSitemap = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>サイトマップ | MUKIMUKI trade</title>
  <meta name="description" content="MUKIMUKI tradeの主要ページ、日次実績、銘柄検討、投資ロジックを一覧で確認できます。">
  <link rel="canonical" href="${content.site.url}/sitemap/">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${JSON.stringify(sitemapJsonLd, null, 2)}</script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="MUKIMUKI trade home">
      <img src="/assets/mukimuki-main.png" alt="MUKIMUKIキャラクター - 100万円トレード記録ブログのロゴ">
      <span><strong>MUKIMUKI trade</strong><small>数字で追う公開記録</small></span>
    </a>
    <nav class="nav-links" aria-label="主要メニュー">
      <a href="/performance/latest/">実績</a>
      <a href="/research/">銘柄検討</a>
      <a href="/logic/">ロジック</a>
      <a href="/moomoo/">moomoo</a>
      <a href="/archive/">アーカイブ</a>
      <a href="/profile/">運営者</a>
    </nav>
  </header>
  <main class="article-page">
    <section class="article-hero">
      <p class="section-kicker">Site map</p>
      <h1>サイトマップ</h1>
      <p>MUKIMUKI tradeの実績公開、銘柄検討、投資ロジックを一覧からたどれます。</p>
    </section>
    <article class="article-body article-longform">
${sitemapHtmlBody}
    </article>
  </main>
  <footer class="site-footer">
    <strong>MUKIMUKI trade</strong>
    <p>100万円からの米国株トレード実績、銘柄メモ、売買ロジックを記録しています。掲載内容には広告リンクを含む場合があります。</p>
    <nav class="footer-links" aria-label="補助リンク"><a href="/profile/">運営者</a><a href="/archive/">アーカイブ</a><a href="/sitemap/">サイトマップ</a><a href="/feed.xml">RSS</a><a href="/about/">運営方針</a><a href="https://x.com/OnigoGames" target="_blank" rel="me noopener">公式X</a></nav>
  </footer>
</body>
</html>
`;

await writeFile(path.join(root, 'sitemap.xml'), sitemap);
await mkdir(path.join(root, '_site'), { recursive: true });
await writeFile(path.join(root, '_site', 'sitemap.xml'), sitemap);
await writeFile(path.join(root, 'image-sitemap.xml'), imageSitemap);
await writeFile(path.join(root, 'feed.xml'), feed);
await mkdir(path.join(root, 'sitemap'), { recursive: true });
await writeFile(path.join(root, 'sitemap', 'index.html'), htmlSitemap);
await mkdir(path.join(root, '_site', 'sitemap'), { recursive: true });
await writeFile(path.join(root, '_site', 'sitemap', 'index.html'), htmlSitemap);

const robots = `User-agent: *
Disallow: /datasets/
Allow: /assets/
Allow: /feed.xml

Sitemap: ${content.site.url}/sitemap.xml
`;

await writeFile(path.join(root, 'robots.txt'), robots);

console.log(`Generated sitemap.xml (${pages.length} URLs), HTML sitemap, _site/sitemap.xml, image-sitemap.xml, robots.txt, and feed.xml (${content.posts.length} posts).`);
