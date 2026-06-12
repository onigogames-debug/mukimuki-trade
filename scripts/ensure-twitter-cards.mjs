import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTwitterCardTags } from './social-sharing.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirs = new Set(['.git', '.wrangler', '_data', '_includes', '_site', 'assets', 'data', 'datasets', 'functions', 'node_modules', 'scripts']);
const noindexRobotsPattern = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i;

const walkHtml = async (dir = root) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) files.push(...await walkHtml(filePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) files.push(filePath);
  }

  return files;
};

const metaContent = (html, selector) => html.match(selector)?.[1] || '';
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

let changed = 0;

for (const filePath of await walkHtml()) {
  const html = await readFile(filePath, 'utf8');
  if (noindexRobotsPattern.test(html) || html.includes('name="twitter:card"')) continue;

  const title = metaContent(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    || metaContent(html, /<title>(.*?)<\/title>/is);
  const description = metaContent(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    || metaContent(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const url = metaContent(html, /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)
    || metaContent(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const image = metaContent(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

  if (!title || !description || !url || !image) continue;

  const cardTags = renderTwitterCardTags({ title, description, url, image, escapeHtml });
  const next = html.replace(/(\s*<meta\s+property=["']og:image["']\s+content=["'][^"']+["']>\n)/i, `$1${cardTags}\n`);
  if (next === html) continue;

  await writeFile(filePath, next);
  changed += 1;
}

console.log(`Ensured X/Twitter card metadata on ${changed} HTML file(s).`);
