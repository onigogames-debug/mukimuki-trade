import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = path.join(root, 'data', 'content.json');
const content = JSON.parse(await readFile(contentPath, 'utf8'));

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const absoluteUrl = (pagePath) => {
  const normalized = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${content.site.url}${normalized}`;
};

const toRssDate = (value) => new Date(value).toUTCString();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${content.pages.map((page) => `  <url>
    <loc>${escapeXml(absoluteUrl(page.path))}</loc>
    <lastmod>${escapeXml(page.lastmod)}</lastmod>
    <changefreq>${escapeXml(page.changefreq)}</changefreq>
    <priority>${escapeXml(page.priority)}</priority>
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

await writeFile(path.join(root, 'sitemap.xml'), sitemap);
await writeFile(path.join(root, 'feed.xml'), feed);

console.log(`Generated sitemap.xml (${content.pages.length} URLs) and feed.xml (${content.posts.length} posts).`);
