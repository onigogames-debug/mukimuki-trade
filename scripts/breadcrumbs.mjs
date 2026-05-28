import { absoluteUrl, breadcrumbSchema } from './structured-data.mjs';

const staticLabels = new Map([
  ['performance', '実績公開'],
  ['latest', '最新実績'],
  ['research', '銘柄検討'],
  ['logic', '投資ロジック'],
  ['moomoo', 'moomoo証券'],
  ['archive', 'アーカイブ'],
  ['category', 'カテゴリ'],
  ['profile', '運営者プロフィール'],
  ['about', '運営方針'],
]);

const monthLabel = (value) => `${Number(value)}月`;
const dayLabel = (value) => `${Number(value)}日`;

export const buildBreadcrumbsFromPath = (pagePath, title) => {
  const segments = String(pagePath || '/').split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', item: absoluteUrl('/') }];
  let current = '';

  segments.forEach((segment, index) => {
    current += `/${segment}`;
    const previous = segments[index - 1];
    const next = segments[index + 1];
    const isLast = index === segments.length - 1;
    const name = isLast && title
      ? title
      : labelForSegment(segment, { previous, next });

    breadcrumbs.push({
      name,
      item: absoluteUrl(segment === 'performance' ? '/performance/latest/' : `${current}/`),
    });
  });

  return breadcrumbs;
};

const labelForSegment = (segment, { previous, next } = {}) => {
  if (/^\d{4}$/.test(segment)) return `${segment}年`;
  if (/^\d{2}$/.test(segment) && /^\d{4}$/.test(previous || '')) return monthLabel(segment);
  if (/^\d{2}$/.test(segment) && /^\d{2}$/.test(previous || '') && !next) return dayLabel(segment);
  if (staticLabels.has(segment)) return staticLabels.get(segment);
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

export const renderBreadcrumbComponent = ({ path, title, escapeHtml } = {}) => {
  const breadcrumbs = buildBreadcrumbsFromPath(path, title);
  return {
    breadcrumbs,
    html: renderBreadcrumbHtml(breadcrumbs, escapeHtml),
    jsonLd: renderBreadcrumbJsonLd(breadcrumbs),
  };
};
