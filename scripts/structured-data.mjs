const site = {
  url: 'https://mukimuki-trade.com',
  name: 'MUKIMUKI trade',
  description: '100万円からの株式投資実績、資産曲線、銘柄検討、相場メモを読者が追いやすい順番で整理する投資ブログ。',
  language: 'ja-JP',
  logo: '/assets/mukimuki-main.png',
  authorId: 'https://mukimuki-trade.com/profile/#author',
  websiteId: 'https://mukimuki-trade.com/#website',
  blogId: 'https://mukimuki-trade.com/#blog',
  officialX: 'https://x.com/OnigoGames',
};

const truthy = new Set(['true', 'yes', 'on']);
const falsy = new Set(['false', 'no', 'off']);

const trimSlash = (value) => String(value || '').replace(/\/$/, '');
const ensureTrailingSlash = (value) => String(value || '/').endsWith('/') ? String(value || '/') : `${value}/`;

export const absoluteUrl = (value = '/') => {
  if (/^https?:\/\//.test(String(value))) return String(value);
  const path = String(value || '/').startsWith('/') ? String(value || '/') : `/${value}`;
  return `${trimSlash(site.url)}${path}`;
};

export const absoluteUrlForSite = (value = '/', siteUrl = site.url) => {
  if (/^https?:\/\//.test(String(value))) return String(value);
  const path = String(value || '/').startsWith('/') ? String(value || '/') : `/${value}`;
  return `${trimSlash(siteUrl || site.url)}${path}`;
};

const imageUrl = (value) => absoluteUrl(value || site.logo);

const compactObject = (value) => {
  if (Array.isArray(value)) return value.map(compactObject).filter((item) => item !== undefined);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, compactObject(item)])
      .filter(([, item]) => {
        if (item === undefined || item === null || item === '') return false;
        if (Array.isArray(item) && item.length === 0) return false;
        if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0) return false;
        return true;
      }),
  );
};

const parseScalar = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => parseScalar(item)).filter(Boolean);
  }
  if (truthy.has(trimmed.toLowerCase())) return true;
  if (falsy.has(trimmed.toLowerCase())) return false;
  return trimmed;
};

export const parseFrontMatter = (source) => {
  const match = String(source).match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontMatter: {}, content: String(source) };

  const frontMatter = {};
  let currentArrayKey = null;
  let currentArrayItem = null;

  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && currentArrayKey) {
      const objectStart = arrayItem[1].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (objectStart) {
        currentArrayItem = { [objectStart[1]]: parseScalar(objectStart[2]) };
        frontMatter[currentArrayKey].push(currentArrayItem);
      } else {
        currentArrayItem = null;
        frontMatter[currentArrayKey].push(parseScalar(arrayItem[1]));
      }
      continue;
    }

    const nestedPair = line.match(/^\s{4,}([A-Za-z0-9_-]+):\s*(.*)$/);
    if (nestedPair && currentArrayKey && currentArrayItem) {
      currentArrayItem[nestedPair[1]] = parseScalar(nestedPair[2]);
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!pair) continue;

    const [, key, rawValue = ''] = pair;
    if (!rawValue.trim()) {
      frontMatter[key] = [];
      currentArrayKey = key;
      currentArrayItem = null;
      continue;
    }

    frontMatter[key] = parseScalar(rawValue);
    currentArrayKey = null;
    currentArrayItem = null;
  }

  return { frontMatter, content: String(source).slice(match[0].length) };
};

export const normalizePageMeta = (frontMatter = {}) => {
  const path = frontMatter.path || new URL(frontMatter.url || '/', site.url).pathname;
  return {
    pageType: frontMatter.pageType || frontMatter.type || inferPageType(path, frontMatter.section),
    title: frontMatter.title,
    description: frontMatter.description,
    published: frontMatter.publishedTime || frontMatter.published_time || frontMatter.published || frontMatter.datePublished || frontMatter.pubDate,
    modified: frontMatter.modifiedTime || frontMatter.modified_time || frontMatter.modified || frontMatter.dateModified || frontMatter.publishedTime || frontMatter.published_time,
    author: frontMatter.author || site.name,
    url: frontMatter.url || absoluteUrl(path),
    path,
    section: frontMatter.section || frontMatter.category,
    image: frontMatter.image || site.logo,
    keywords: frontMatter.keywords || frontMatter.tags || [],
    breadcrumbs: frontMatter.breadcrumbs || buildDefaultBreadcrumbs(path, frontMatter.title, frontMatter.section),
    faq: frontMatter.faq || frontMatter.faqs || [],
    items: frontMatter.items || [],
  };
};

const inferPageType = (path, section) => {
  if (path === '/') return 'home';
  if (path.startsWith('/archive/')) return 'archive';
  if (path.startsWith('/category/')) return 'collection';
  if (path === '/performance/' || path.startsWith('/performance/')) return 'performance';
  if (path === '/research/' || path.startsWith('/research/')) return 'research';
  if (section) return 'article';
  return 'page';
};

const titleizeSegment = (segment) => segment
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export const breadcrumbLabelForSegment = (segment, { previous, next } = {}) => {
  if (segment === 'performance') return '実績';
  if (segment === 'research') return '銘柄検討';
  if (segment === 'logic') return '投資ロジック';
  if (segment === 'archive') return 'アーカイブ';
  if (segment === 'category') return 'カテゴリ';
  if (segment === 'profile') return 'プロフィール';
  if (segment === 'about') return '運営方針';
  if (segment === 'moomoo') return 'moomoo証券';
  if (segment === 'latest') return '最新実績';
  if (/^\d{4}$/.test(segment)) return `${segment}年`;
  if (/^\d{2}$/.test(segment) && /^\d{4}$/.test(previous || '')) return `${Number(segment)}月`;
  if (/^\d{2}$/.test(segment) && /^\d{2}$/.test(previous || '')) return `${Number(previous)}月${Number(segment)}日`;
  return next ? titleizeSegment(segment) : titleizeSegment(segment);
};

export const buildBreadcrumbListFromPath = (pathValue = '/', options = {}) => {
  const siteUrl = options.siteUrl || site.url;
  const title = options.title;
  const path = new URL(pathValue, ensureTrailingSlash(siteUrl)).pathname;
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', item: absoluteUrlForSite('/', siteUrl) }];
  let current = '';

  segments.forEach((segment, index) => {
    current += `/${segment}`;
    const isLast = index === segments.length - 1;
    const previous = segments[index - 1];
    const next = segments[index + 1];
    breadcrumbs.push({
      name: isLast && title ? title : breadcrumbLabelForSegment(segment, { previous, next }),
      item: absoluteUrlForSite(`${current}/`, siteUrl),
    });
  });

  return breadcrumbs;
};

const buildDefaultBreadcrumbs = (path, title, section) => {
  const crumbs = [{ name: 'Home', item: `${site.url}/` }];
  if (path.startsWith('/performance/') && path !== '/performance/') {
    crumbs.push({ name: '実績公開', item: absoluteUrl('/category/performance/') });
  }
  if (path.startsWith('/research/') && path !== '/research/') {
    crumbs.push({ name: '銘柄検討', item: absoluteUrl('/category/research/') });
  }
  if (path.startsWith('/logic/') && path !== '/logic/') {
    crumbs.push({ name: '投資ロジック', item: absoluteUrl('/logic/') });
  }
  crumbs.push({ name: section || title || site.name, item: absoluteUrl(path) });
  return crumbs;
};

export const personSchema = () => ({
  '@type': 'Person',
  '@id': site.authorId,
  name: 'MUKIMUKI trade編集部',
  alternateName: 'OnigoGames',
  url: absoluteUrl('/profile/'),
  image: imageUrl(site.logo),
  sameAs: [site.officialX],
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
  jobTitle: '兼業投資家 / 事業開発',
  knowsAbout: ['株式投資', '自動売買', 'AIエージェント', '事業開発', '米国株ニュース確認', '投資実績の記録'],
  description: '40代・港区在住の兼業投資家。投資歴20年弱。AIエージェント、自動売買、事業開発の視点から公開実績と投資メモを整理します。投資助言業者ではありません。',
});

export const websiteSchema = (meta) => ({
  '@type': 'WebSite',
  '@id': site.websiteId,
  url: `${site.url}/`,
  name: site.name,
  description: meta.description || site.description,
  inLanguage: site.language,
  publisher: { '@id': `${site.url}/#organization` },
  author: { '@id': site.authorId },
});

export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  url: `${site.url}/`,
  logo: {
    '@type': 'ImageObject',
    url: imageUrl(site.logo),
  },
  sameAs: [site.officialX],
  founder: { '@id': site.authorId },
});

export const articleSchema = (meta) => ({
  '@type': 'Article',
  '@id': `${meta.url}#article`,
  headline: meta.title,
  description: meta.description,
  image: [imageUrl(meta.image)],
  datePublished: meta.published,
  dateModified: meta.modified || meta.published,
  inLanguage: site.language,
  articleSection: meta.section,
  keywords: Array.isArray(meta.keywords) ? meta.keywords : String(meta.keywords || '').split(',').map((item) => item.trim()).filter(Boolean),
  author: { '@id': site.authorId, name: meta.author || site.name },
  publisher: {
    '@type': 'Organization',
    name: site.name,
    logo: {
      '@type': 'ImageObject',
      url: imageUrl(site.logo),
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': meta.url,
  },
});

export const collectionPageSchema = (meta) => ({
  '@type': 'CollectionPage',
  '@id': `${meta.url}#webpage`,
  url: meta.url,
  name: meta.title,
  description: meta.description,
  inLanguage: site.language,
  isPartOf: { '@id': site.websiteId },
  mainEntity: meta.items.length ? { '@id': `${meta.url}#list` } : undefined,
});

export const itemListSchema = (meta) => {
  if (!meta.items.length) return undefined;
  return {
    '@type': 'ItemList',
    '@id': `${meta.url}#list`,
    itemListElement: meta.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name || item.title,
      url: absoluteUrl(item.url || item.path),
    })),
  };
};

export const faqPageSchema = (meta) => {
  if (!Array.isArray(meta.faq) || !meta.faq.length) return undefined;
  return {
    '@type': 'FAQPage',
    '@id': `${meta.url}#faq`,
    mainEntity: meta.faq.map((item) => ({
      '@type': 'Question',
      name: item.question || item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer || item.text,
      },
    })),
  };
};

export const faqPageSchemaFromQa = (qaItems = [], options = {}) => {
  const url = options.url || site.url;
  const faq = qaItems
    .map((item) => ({
      question: item.question || item.name || item.heading || item.h2,
      answer: item.answer || item.text || item.body,
    }))
    .filter((item) => item.question && item.answer);

  return faqPageSchema({ url, faq });
};

export const breadcrumbSchema = (meta) => ({
  '@type': 'BreadcrumbList',
  '@id': `${meta.url}#breadcrumb`,
  itemListElement: meta.breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.item || crumb.url || crumb.path),
  })),
});

export const buildStructuredData = (frontMatter = {}) => {
  const meta = normalizePageMeta(frontMatter);
  const graph = [];

  if (meta.pageType === 'home') {
    graph.push(websiteSchema(meta), personSchema(), organizationSchema());
  }

  if (['performance', 'research', 'article'].includes(meta.pageType)) {
    graph.push(articleSchema(meta));
  }

  if (['archive', 'collection'].includes(meta.pageType)) {
    graph.push(collectionPageSchema(meta), itemListSchema(meta));
  }

  const faq = faqPageSchema(meta);
  if (faq && ['performance', 'research', 'article'].includes(meta.pageType)) graph.push(faq);

  if (meta.breadcrumbs.length) graph.push(breadcrumbSchema(meta));

  return compactObject({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
};

export const renderJsonLdScript = (frontMatter = {}) => {
  const jsonLd = buildStructuredData(frontMatter);
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
};

export const buildJsonLdScriptFromFrontMatter = ({
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  section,
  author,
  siteUrl = site.url,
  faq = [],
  items = [],
  image = site.logo,
  pageType,
} = {}) => {
  const pageUrl = url || siteUrl;
  const path = new URL(pageUrl, ensureTrailingSlash(siteUrl)).pathname;
  const normalizedPageType = pageType || inferPageType(path, section);
  const breadcrumbs = buildBreadcrumbListFromPath(path, { siteUrl });
  const meta = {
    pageType: normalizedPageType,
    title,
    description: description || title,
    published: publishedTime,
    modified: modifiedTime || publishedTime,
    author: author || site.name,
    url: absoluteUrlForSite(path, siteUrl),
    path,
    section,
    image,
    keywords: [],
    breadcrumbs,
    faq,
    items,
  };
  const graph = [];

  if (normalizedPageType === 'home') {
    graph.push(
      websiteSchema(meta),
      personSchema(),
    );
  }

  if (['performance', 'research', 'article'].includes(normalizedPageType)) {
    graph.push(articleSchema(meta));
  }

  if (['archive', 'collection'].includes(normalizedPageType)) {
    graph.push(collectionPageSchema(meta), itemListSchema(meta));
  }

  const faqSchema = faqPageSchemaFromQa(faq, { url: meta.url });
  if (faqSchema && normalizedPageType === 'research') graph.push(faqSchema);

  if (breadcrumbs.length) graph.push(breadcrumbSchema(meta));

  const jsonLd = compactObject({
    '@context': 'https://schema.org',
    '@graph': graph,
  });

  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
};
