import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const site = {
  url: 'https://mukimuki-trade.com',
  name: 'MUKIMUKI trade',
  description: '100万円からの株式投資実績、資産曲線、銘柄検討、相場メモを整理する投資ブログ。',
  language: 'ja-JP',
  logo: 'https://mukimuki-trade.com/assets/mukimuki-main.png',
  authorId: 'https://mukimuki-trade.com/profile/#author',
  websiteId: 'https://mukimuki-trade.com/#website',
  officialX: 'https://x.com/OnigoGames',
};

const ignoredDirs = new Set(['.git', '.wrangler', 'node_modules', 'assets', 'data', 'datasets', 'scripts']);
const ignoredFiles = new Set(['404.html', 'googlefd5cf11d7eb2c415.html']);

const hasNoindexRobots = (html) => /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);

const websiteSchema = {
  '@type': 'WebSite',
  '@id': site.websiteId,
  url: `${site.url}/`,
  name: site.name,
  description: site.description,
  inLanguage: site.language,
  publisher: { '@id': site.authorId },
  author: { '@id': site.authorId },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${site.url}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const personSchema = {
  '@type': 'Person',
  '@id': site.authorId,
  name: 'MUKIMUKI trade 編集部',
  alternateName: ['MUKIMUKI trade', 'OnigoGames'],
  url: `${site.url}/profile/`,
  image: site.logo,
  sameAs: [site.officialX],
  mainEntityOfPage: {
    '@type': 'ProfilePage',
    '@id': `${site.url}/profile/#webpage`,
  },
  gender: 'Male',
  homeLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: '港区',
      addressRegion: '東京都',
      addressCountry: 'JP',
    },
  },
  jobTitle: '兼業投資家・投資ブロガー',
  knowsAbout: ['米国株投資', '自動売買', 'AIエージェント', '株式トレード', 'リスク管理', '事業開発', 'Autotrade'],
  description: '投資歴20年弱の兼業投資家。40代男性、東京都港区在住。AIエージェント、自動売買、事業開発、株式投資を専門領域とし、Autotradeの日次レポートをもとに米国株トレード実績、銘柄検討、投資ロジックを検証しやすい形で整理します。投資助言業者ではありません。',
};

const htmlFiles = async (dir = root) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    const relative = path.relative(root, filePath);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      files.push(...await htmlFiles(filePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (ignoredFiles.has(relative)) continue;
    files.push(filePath);
  }

  return files;
};

const typeMatches = (schema, typeName) => {
  const type = schema?.['@type'];
  return Array.isArray(type) ? type.includes(typeName) : type === typeName;
};

const ensureGraphIdentity = (jsonLd) => {
  const graph = Array.isArray(jsonLd['@graph']) ? jsonLd['@graph'] : [jsonLd];
  const hasWebsite = graph.some((schema) => typeMatches(schema, 'WebSite'));
  const hasPerson = graph.some((schema) => typeMatches(schema, 'Person'));

  if (hasWebsite && hasPerson) return { jsonLd, changed: false };

  return {
    jsonLd: {
      '@context': jsonLd['@context'] || 'https://schema.org',
      '@graph': [
        ...(!hasWebsite ? [websiteSchema] : []),
        ...(!hasPerson ? [personSchema] : []),
        ...graph,
      ],
    },
    changed: true,
  };
};

const updateHtml = (html) => {
  const match = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return { html, changed: false, reason: 'no-jsonld' };

  let jsonLd;
  try {
    jsonLd = JSON.parse(match[1]);
  } catch {
    return { html, changed: false, reason: 'invalid-jsonld' };
  }

  const result = ensureGraphIdentity(jsonLd);
  if (!result.changed) return { html, changed: false, reason: 'already-complete' };

  const script = `<script type="application/ld+json">\n${JSON.stringify(result.jsonLd, null, 2)}\n</script>`;
  return {
    html: html.replace(match[0], script),
    changed: true,
    reason: 'updated',
  };
};

const files = await htmlFiles();
const summary = { checked: 0, updated: 0, skippedNoindex: 0, noJsonLd: 0, invalidJsonLd: 0 };

for (const filePath of files) {
  const html = await readFile(filePath, 'utf8');
  if (hasNoindexRobots(html)) {
    summary.skippedNoindex += 1;
    continue;
  }

  summary.checked += 1;
  const result = updateHtml(html);
  if (result.reason === 'no-jsonld') summary.noJsonLd += 1;
  if (result.reason === 'invalid-jsonld') summary.invalidJsonLd += 1;
  if (!result.changed) continue;

  await writeFile(filePath, result.html);
  summary.updated += 1;
}

console.log(`Ensured JSON-LD site identity: ${summary.updated}/${summary.checked} updated, ${summary.skippedNoindex} noindex skipped, ${summary.noJsonLd} without JSON-LD, ${summary.invalidJsonLd} invalid.`);
