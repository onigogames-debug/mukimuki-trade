import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://mukimuki-trade.com';
const ignoredDirs = new Set(['.git', '.wrangler', 'assets', 'data', 'datasets', 'scripts', 'node_modules']);

const walkHtml = async (dir = root) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) files.push(...await walkHtml(path.join(dir, entry.name)));
      continue;
    }
    if (entry.isFile() && entry.name === 'index.html') files.push(path.join(dir, entry.name));
  }
  return files;
};

const routeFor = (filePath) => {
  const relative = path.relative(root, filePath);
  if (relative === 'index.html') return '/';
  return `/${relative.slice(0, -'index.html'.length)}`;
};

const textContent = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const match = (html, pattern) => html.match(pattern)?.[1]?.trim() || '';
const count = (html, pattern) => [...html.matchAll(pattern)].length;
const jsonLdTypes = (html) => {
  const types = new Set();
  for (const item of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const json = JSON.parse(item[1]);
      const graph = Array.isArray(json['@graph']) ? json['@graph'] : [json];
      graph.forEach((node) => {
        const type = node?.['@type'];
        if (Array.isArray(type)) type.forEach((value) => types.add(value));
        else if (type) types.add(type);
      });
    } catch {
      types.add('JSON-LD parse error');
    }
  }
  return [...types].sort();
};

const files = await walkHtml();
const pages = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const route = routeFor(file);
  const title = match(html, /<title>([\s\S]*?)<\/title>/);
  const description = match(html, /<meta name="description" content="([^"]*)"/);
  const canonical = match(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/);
  const h1 = match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>/g, '').trim();
  const bodyText = textContent(html);
  const robots = match(html, /<meta name="robots" content="([^"]*)"/);
  const isNoindex = robots.includes('noindex');
  const internalLinks = count(html, /<a\s+[^>]*href="\/(?!\/)[^"]*"/g);
  const hasRelated = html.includes('関連する記事') || html.includes('次に読む');
  const hasFaqSchema = html.includes('"@type": "FAQPage"');
  const hasBreadcrumbSchema = html.includes('"@type": "BreadcrumbList"');
  const hasCriticalCss = html.includes('data-critical-css');
  const pictureCount = count(html, /<picture data-cwv-picture>/g);
  const schemaTypes = jsonLdTypes(html);
  const issues = [];

  if (!isNoindex) {
    if (!title || title.length > 70) issues.push('title要確認');
    if (!description || description.length > 140) issues.push('description要確認');
    if (!canonical.startsWith(siteUrl)) issues.push('canonical要確認');
    if (!h1) issues.push('H1なし');
    if (bodyText.length < 900 && route !== '/') issues.push('本文量が薄い可能性');
    if (internalLinks < 6 && route !== '/') issues.push('内部リンク少なめ');
    if (!hasBreadcrumbSchema && route !== '/') issues.push('パンくずschemaなし');
  }

  pages.push({
    route,
    isNoindex,
    titleLength: title.length,
    descriptionLength: description.length,
    bodyChars: bodyText.length,
    internalLinks,
    hasRelated,
    hasFaqSchema,
    hasBreadcrumbSchema,
    hasCriticalCss,
    pictureCount,
    schemaTypes,
    issues,
  });
}

const indexablePages = pages.filter((page) => !page.isNoindex);
const issuePages = pages.filter((page) => page.issues.length);
const lines = [
  '# SEO Progress Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## 実装状況',
  '',
  '| 項目 | 状態 | 確認方法 |',
  '|---|---|---|',
  '| 日付別実績URL | 完了 | `/performance/YYYY/MM/DD/` を生成 |',
  '| 最新実績canonical | 完了 | `/performance/latest/` は日付固定URLへcanonical |',
  '| sitemap.xml | 完了 | `npm run seo:generate` で自動生成 |',
  '| image-sitemap.xml | 完了 | 各ページと代表AVIF画像を紐づけ |',
  '| RSS feed | 完了 | `feed.xml` を自動生成 |',
  '| JSON-LD | 完了 | Article / FAQPage / CollectionPage / BreadcrumbList |',
  '| 内部リンク | 完了 | 関連記事と主要導線を記事末尾・ヘッダー・フッターへ配置 |',
  '| E-E-A-T | 完了 | `/profile/` とPerson schemaで運営者情報を公開 |',
  '| moomoo CVR導線 | 完了 | トップ・記事・カテゴリからPR導線を設置 |',
  '| 画像SEO | 完了 | WebP/AVIF、picture、image sitemapを実装 |',
  '| AI検索向け説明 | 完了 | `/llms.txt` を追加 |',
  '| Core Web Vitals | 完了 | Critical CSS、画像最適化、実績JSONインライン化 |',
  '',
  '## ページ監査サマリー',
  '',
  `- 対象ページ: ${pages.length}`,
  `- インデックス対象ページ: ${indexablePages.length}`,
  `- 要確認ページ: ${issuePages.length}`,
  `- FAQ schemaページ: ${pages.filter((page) => page.hasFaqSchema).length}`,
  `- パンくずschemaページ: ${pages.filter((page) => page.hasBreadcrumbSchema).length}`,
  `- Critical CSS適用ページ: ${pages.filter((page) => page.hasCriticalCss).length}`,
  '',
  '## 要確認ページ',
  '',
  issuePages.length
    ? '| URL | 課題 |\n|---|---|\n' + issuePages.map((page) => `| ${page.route} | ${page.issues.join(' / ')} |`).join('\n')
    : '現時点で自動監査上の重大な未実装項目はありません。',
  '',
  '## ページ別詳細',
  '',
  '| URL | title | description | 本文文字数 | 内部リンク | schema |',
  '|---|---:|---:|---:|---:|---|',
  ...pages
    .sort((a, b) => a.route.localeCompare(b.route))
    .map((page) => `| ${page.route}${page.isNoindex ? ' (noindex)' : ''} | ${page.titleLength} | ${page.descriptionLength} | ${page.bodyChars} | ${page.internalLinks} | ${page.schemaTypes.join(', ')} |`),
  '',
];

await writeFile(path.join(root, 'docs', 'seo-progress.md'), `${lines.join('\n')}\n`);
console.log(`SEO audit complete: ${pages.length} pages, ${issuePages.length} pages need review.`);
