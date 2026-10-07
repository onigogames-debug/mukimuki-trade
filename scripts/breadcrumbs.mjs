import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { absoluteUrl, breadcrumbSchema } from './structured-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datasetsDir = path.join(root, 'datasets');

const staticLabels = new Map([
  ['performance', '実績'],
  ['latest', '最新実績'],
  ['research', '銘柄検討'],
  ['logic', '投資ロジック'],
  ['moomoo', 'moomoo証券'],
  ['archive', 'アーカイブ'],
  ['category', 'カテゴリ'],
  ['profile', '運営者プロフィール'],
  ['about', '免責事項'],
  ['topics', '売買トピック'],
]);

export const buildBreadcrumbsFromPath = (pagePath, title) => {
  const pathStr = String(pagePath || '/');
  const breadcrumbs = [{ name: 'ホーム', item: absoluteUrl('/') }];

  if (pathStr === '/' || pathStr === '') {
    return breadcrumbs;
  }

  // 1. Topic Article: /performance/YYYY/MM/DD/topics/slug/
  const topicMatch = pathStr.match(/^\/performance\/(\d{4})\/(\d{2})\/(\d{2})\/topics\/([^/]+)\/?$/);
  if (topicMatch) {
    const [, year, month, day, slug] = topicMatch;
    breadcrumbs.push({ name: '実績', item: absoluteUrl('/performance/') });
    breadcrumbs.push({ name: `${year}年`, item: absoluteUrl(`/performance/${year}/`) });
    breadcrumbs.push({ name: `${Number(month)}月`, item: absoluteUrl(`/performance/${year}/${month}/`) });

    const dailyDatasetExists = fs.existsSync(path.join(datasetsDir, `performance-${year}-${month}-${day}.json`));
    if (dailyDatasetExists) {
      breadcrumbs.push({ name: `${Number(month)}月${Number(day)}日`, item: absoluteUrl(`/performance/${year}/${month}/${day}/`) });
    }

    breadcrumbs.push({ name: title || slug, item: absoluteUrl(pathStr) });
    return breadcrumbs;
  }

  // 2. Performance Daily / Month / Year / Index: /performance/...
  const performanceMatch = pathStr.match(/^\/performance\/(?:(\d{4})(?:\/(\d{2})(?:\/(\d{2}))?)?\/)?$/);
  if (performanceMatch) {
    const [, year, month, day] = performanceMatch;
    breadcrumbs.push({ name: '実績', item: absoluteUrl('/performance/') });
    if (year) breadcrumbs.push({ name: `${year}年`, item: absoluteUrl(`/performance/${year}/`) });
    if (month) breadcrumbs.push({ name: `${Number(month)}月`, item: absoluteUrl(`/performance/${year}/${month}/`) });
    if (day) breadcrumbs.push({ name: title || `${Number(month)}月${Number(day)}日`, item: absoluteUrl(`/performance/${year}/${month}/${day}/`) });
    return breadcrumbs;
  }

  // 3. Research Tag page: /research/tag/ticker/
  const tagMatch = pathStr.match(/^\/research\/tag\/([^/]+)\/?$/);
  if (tagMatch) {
    const [, ticker] = tagMatch;
    breadcrumbs.push({ name: '銘柄検討', item: absoluteUrl('/research/') });
    breadcrumbs.push({ name: title || ticker.toUpperCase(), item: absoluteUrl(pathStr) });
    return breadcrumbs;
  }

  // 4. Research Detail page: /research/slug/
  const researchMatch = pathStr.match(/^\/research\/([^/]+)\/?$/);
  if (researchMatch) {
    const [, slug] = researchMatch;
    breadcrumbs.push({ name: '銘柄検討', item: absoluteUrl('/research/') });
    breadcrumbs.push({ name: title || slug, item: absoluteUrl(pathStr) });
    return breadcrumbs;
  }

  // 5. Category page: /category/cat/
  const categoryMatch = pathStr.match(/^\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const [, cat] = categoryMatch;
    const catLabel = staticLabels.get(cat) || cat;
    breadcrumbs.push({ name: title || catLabel, item: absoluteUrl(pathStr) });
    return breadcrumbs;
  }

  // 6. Generic single-segment page: /slug/
  const singleMatch = pathStr.match(/^\/([^/]+)\/?$/);
  if (singleMatch) {
    const [, seg] = singleMatch;
    const label = title || staticLabels.get(seg) || seg;
    breadcrumbs.push({ name: label, item: absoluteUrl(pathStr) });
    return breadcrumbs;
  }

  // 7. Fallback for any other path: split segments, skipping 'topics' / 'category' / 'tag'
  const segments = pathStr.split('/').filter(Boolean);
  let current = '';
  segments.forEach((segment, index) => {
    current += `/${segment}`;
    if (segment === 'topics' || segment === 'category' || segment === 'tag') {
      return;
    }
    const isLast = index === segments.length - 1;
    const name = isLast && title ? title : (staticLabels.get(segment) || segment);
    breadcrumbs.push({ name, item: absoluteUrl(`${current}/`) });
  });

  return breadcrumbs;
};

export const renderBreadcrumbHtml = (breadcrumbs, escapeHtml = (value) => String(value ?? '')) => {
  const items = breadcrumbs.map((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    if (isLast) return `<span>${escapeHtml(crumb.name)}</span>`;
    const href = new URL(crumb.item).pathname;
    return `<a href="${escapeHtml(href)}">${escapeHtml(crumb.name)}</a><span>/</span>`;
  }).join('');

  return `<nav class="breadcrumb" aria-label="breadcrumb">${items}</nav>`;
};

export const renderBreadcrumbJsonLd = (breadcrumbs, pageUrl) => breadcrumbSchema({
  url: pageUrl || breadcrumbs.at(-1)?.item,
  breadcrumbs,
});

export const renderBreadcrumbComponent = ({ path: pagePath, title, escapeHtml } = {}) => {
  const breadcrumbs = buildBreadcrumbsFromPath(pagePath, title);
  return {
    breadcrumbs,
    html: renderBreadcrumbHtml(breadcrumbs, escapeHtml),
    jsonLd: renderBreadcrumbJsonLd(breadcrumbs),
  };
};
