import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datasetsDir = path.join(root, 'datasets');
const ignoredDirs = new Set([
  '.git',
  '.wrangler',
  '_data',
  '_includes',
  '_site',
  'assets',
  'data',
  'datasets',
  'functions',
  'node_modules',
  'scripts',
]);

const latestDataset = JSON.parse(await readFile(path.join(datasetsDir, 'performance-latest.json'), 'utf8'));
const latestPerformancePath = `/performance/${latestDataset.latest.reportDate.replaceAll('-', '/')}/`;
const noindexRobotsPattern = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i;
const latestHrefPattern = /href=(["'])\/performance\/latest\/\1/g;
const latestNavPattern = /href=(["'])\/performance\/latest\/\1([^>]*>\s*実績\s*<\/a>)/g;

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

const countMatches = (source, pattern) => {
  const freshPattern = new RegExp(pattern.source, pattern.flags);
  return source.match(freshPattern)?.length || 0;
};

let changedFiles = 0;
let replacedLinks = 0;
const violations = [];

for (const filePath of await walkHtml()) {
  const html = await readFile(filePath, 'utf8');
  if (noindexRobotsPattern.test(html)) continue;

  const originalLatestLinks = countMatches(html, latestHrefPattern);
  let next = html.replace(latestNavPattern, 'href=$1/performance/$1$2');
  next = next.replace(latestHrefPattern, `href=$1${latestPerformancePath}$1`);

  if (next !== html) {
    await writeFile(filePath, next);
    changedFiles += 1;
    replacedLinks += originalLatestLinks;
  }

  const freshLatestHrefPattern = new RegExp(latestHrefPattern.source, latestHrefPattern.flags);
  if (freshLatestHrefPattern.test(next)) {
    violations.push(path.relative(root, filePath));
  }
}

if (violations.length) {
  console.error(`Indexable pages still link to /performance/latest/: ${violations.join(', ')}`);
  process.exit(1);
}

console.log(`Canonicalized performance links in ${changedFiles} file(s); replaced ${replacedLinks} /performance/latest/ link(s) with /performance/ or ${latestPerformancePath}.`);
