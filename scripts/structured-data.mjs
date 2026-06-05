const site = {
  url: 'https://mukimuki-trade.com',
  name: 'MUKIMUKI trade',
  description: '100万円からの株式投資実績、資産曲線、銘柄検討、相場メモを整理する投資ブログ。',
  language: 'ja-JP',
  logo: '/assets/mukimuki-main.png',
  authorId: 'https://mukimuki-trade.com/profile/#author',
  websiteId: 'https://mukimuki-trade.com/#website',
  blogId: 'https://mukimuki-trade.com/#blog',
  officialX: 'https://x.com/OnigoGames',
};

export const JSON_LD_PAGE_TYPES = [
  'daily-performance',
  'monthly-archive',
  'yearly-archive',
  'trade-topic',
  'research',
  'logic',
  'top',
  'profile',
  'about',
];

const truthy = new Set(['true', 'yes', 'on']);
const falsy = new Set(['false', 'no', 'off']);

const trimSlash = (value) => String(value || '').replace(/\/$/, '');
const ensureTrailingSlash = (value) => String(value || '/').endsWith('/') ? String(value || '/') : `${value}/`;
const normalizeSameAs = (value = site.officialX) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

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

const breadcrumbPageTypes = new Set([
  'performance',
  'performanceDaily',
  'performanceMonthly',
  'performanceYearly',
  'tradeTopic',
  'research',
  'logic',
  'article',
  'archive',
  'collection',
]);

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
  const pageType = normalizePageType(frontMatter.pageType || frontMatter.type || inferPageType(path, frontMatter.section), path);
  return {
    pageType,
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
    headline: frontMatter.headline,
    parentUrl: frontMatter.parentUrl || frontMatter.parent_url,
    breadcrumbs: frontMatter.breadcrumbs || buildBreadcrumbListFromPath(path, { title: frontMatter.title }),
    faq: frontMatter.faq || frontMatter.faqs || frontMatter.faqItems || [],
    items: frontMatter.items || [],
    sameAs: normalizeSameAs(frontMatter.sameAs || frontMatter.same_as || site.officialX),
  };
};

const inferPageType = (path, section) => {
  if (path === '/') return 'home';
  if (path === '/profile/') return 'profile';
  if (path === '/about/') return 'legal';
  if (path === '/performance/latest/') return 'skip';
  if (path.startsWith('/archive/')) return 'archive';
  if (path.startsWith('/category/')) return 'collection';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(path)) return 'performanceDaily';
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(path)) return 'performanceMonthly';
  if (/^\/performance\/\d{4}\/$/.test(path)) return 'performanceYearly';
  if (path === '/performance/' || path.startsWith('/performance/')) return 'performance';
  if (path === '/research/' || path.startsWith('/research/')) return 'research';
  if (path === '/logic/' || path.startsWith('/logic/')) return path === '/logic/' ? 'collection' : 'logic';
  if (section) return 'article';
  return 'page';
};

const normalizePageType = (value, path = '/') => {
  const type = String(value || inferPageType(path)).trim();
  const aliases = new Map([
    ['top', 'home'],
    ['website', 'home'],
    ['daily-performance', 'performanceDaily'],
    ['dailyPerformance', 'performanceDaily'],
    ['performance-daily', 'performanceDaily'],
    ['performance_daily', 'performanceDaily'],
    ['monthly-archive', 'performanceMonthly'],
    ['monthlyPerformance', 'performanceMonthly'],
    ['monthly-performance', 'performanceMonthly'],
    ['performance-monthly', 'performanceMonthly'],
    ['performance_monthly', 'performanceMonthly'],
    ['yearly-archive', 'performanceYearly'],
    ['yearlyArchive', 'performanceYearly'],
    ['annual-archive', 'performanceYearly'],
    ['annualArchive', 'performanceYearly'],
    ['performanceYearly', 'performanceYearly'],
    ['performance-yearly', 'performanceYearly'],
    ['trade-topic', 'tradeTopic'],
    ['tradeTopic', 'tradeTopic'],
    ['trade_topic', 'tradeTopic'],
    ['stockResearch', 'research'],
    ['stock-research', 'research'],
    ['investmentLogic', 'logic'],
    ['investment-logic', 'logic'],
    ['profilePage', 'profile'],
    ['profile-page', 'profile'],
    ['disclaimer', 'legal'],
    ['about', 'legal'],
    ['legalDocument', 'legal'],
    ['legal-document', 'legal'],
    ['archive', 'collection'],
    ['monthly', 'performanceMonthly'],
    ['latest-performance', 'skip'],
    ['latestPerformance', 'skip'],
    ['noindex', 'skip'],
  ]);
  return aliases.get(type) || type;
};

export const breadcrumbLabelMap = {
  performance: { label: '実績', url: '/performance/latest/' },
  research: { label: '銘柄検討', url: '/research/' },
  logic: { label: '投資ロジック', url: '/logic/' },
  topics: { label: '売買トピック' },
  profile: { label: '運営者プロフィール' },
  about: { label: '免責事項' },
};

const titleizeSegment = (segment) => segment
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export const breadcrumbLabelForSegment = (segment, { previous, next } = {}) => {
  if (segment === '') return 'ホーム';
  if (breadcrumbLabelMap[segment]) return breadcrumbLabelMap[segment].label;
  if (segment === 'archive') return 'アーカイブ';
  if (segment === 'category') return 'カテゴリ';
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
  const breadcrumbs = [{ name: 'ホーム', item: absoluteUrlForSite('/', siteUrl), url: absoluteUrlForSite('/', siteUrl) }];

  const performanceMatch = path.match(/^\/performance\/(\d{4})(?:\/(\d{2})(?:\/(\d{2}))?)?\/$/);
  if (performanceMatch) {
    const [, year, month, day] = performanceMatch;
    breadcrumbs.push({ name: '実績', item: absoluteUrlForSite('/performance/latest/', siteUrl), url: absoluteUrlForSite('/performance/latest/', siteUrl) });
    if (year) {
      breadcrumbs.push({
        name: `${year}年`,
        item: absoluteUrlForSite(`/performance/${year}/`, siteUrl),
        url: absoluteUrlForSite(`/performance/${year}/`, siteUrl),
      });
    }
    if (month) {
      breadcrumbs.push({
        name: `${Number(month)}月`,
        item: absoluteUrlForSite(`/performance/${year}/${month}/`, siteUrl),
        url: absoluteUrlForSite(`/performance/${year}/${month}/`, siteUrl),
      });
    }
    if (day) {
      breadcrumbs.push({
        name: `${Number(month)}月${Number(day)}日`,
        item: absoluteUrlForSite(`/performance/${year}/${month}/${day}/`, siteUrl),
        url: absoluteUrlForSite(`/performance/${year}/${month}/${day}/`, siteUrl),
      });
    }
    return breadcrumbs;
  }

  const topicMatch = path.match(/^\/performance\/(\d{4})\/(\d{2})\/(\d{2})\/topics\/[^/]+\/$/);
  if (topicMatch) {
    const [, year, month, day] = topicMatch;
    breadcrumbs.push(
      { name: '実績', item: absoluteUrlForSite('/performance/latest/', siteUrl), url: absoluteUrlForSite('/performance/latest/', siteUrl) },
      { name: `${year}年`, item: absoluteUrlForSite(`/performance/${year}/`, siteUrl), url: absoluteUrlForSite(`/performance/${year}/`, siteUrl) },
      { name: `${Number(month)}月`, item: absoluteUrlForSite(`/performance/${year}/${month}/`, siteUrl), url: absoluteUrlForSite(`/performance/${year}/${month}/`, siteUrl) },
      { name: `${Number(month)}月${Number(day)}日`, item: absoluteUrlForSite(`/performance/${year}/${month}/${day}/`, siteUrl), url: absoluteUrlForSite(`/performance/${year}/${month}/${day}/`, siteUrl) },
      { name: '売買トピック' },
    );
    return breadcrumbs;
  }

  if (path === '/performance/latest/' || path === '/performance/') {
    breadcrumbs.push({ name: '実績', item: absoluteUrlForSite('/performance/latest/', siteUrl), url: absoluteUrlForSite('/performance/latest/', siteUrl) });
    return breadcrumbs;
  }

  let current = '';

  segments.forEach((segment, index) => {
    current += `/${segment}`;
    const isLast = index === segments.length - 1;
    const previous = segments[index - 1];
    const next = segments[index + 1];
    const mappedUrl = breadcrumbLabelMap[segment]?.url;
    const itemUrl = absoluteUrlForSite(mappedUrl || `${current}/`, siteUrl);
    breadcrumbs.push({
      name: isLast && title ? title : breadcrumbLabelForSegment(segment, { previous, next }),
      item: itemUrl,
      url: itemUrl,
    });
  });

  return breadcrumbs;
};

const buildDefaultBreadcrumbs = (path, title, section) => {
  const crumbs = [{ name: 'ホーム', item: `${site.url}/` }];
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

export const personSchema = (options = {}) => ({
  '@type': 'Person',
  '@id': site.authorId,
  name: options.name || 'MUKIMUKI trade 編集部',
  alternateName: options.alternateName || ['MUKIMUKI trade', 'OnigoGames'],
  url: options.url || absoluteUrl('/profile/'),
  image: imageUrl(options.image || site.logo),
  sameAs: normalizeSameAs(options.sameAs || site.officialX),
  mainEntityOfPage: {
    '@type': 'ProfilePage',
    '@id': absoluteUrl('/profile/#webpage'),
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
  jobTitle: options.jobTitle || '兼業投資家・投資ブロガー',
  knowsAbout: options.knowsAbout || ['米国株投資', '自動売買', 'AIエージェント', '株式トレード', 'リスク管理', '事業開発', 'Autotrade'],
  description: options.description || '投資歴20年弱の兼業投資家。40代男性、東京都港区在住。AIエージェント、自動売買、事業開発、株式投資を専門領域とし、Autotradeの日次レポートをもとに米国株トレード実績、銘柄検討、投資ロジックを検証しやすい形で整理します。投資助言業者ではありません。',
});

export const websiteSchema = (meta) => ({
  '@type': 'WebSite',
  '@id': site.websiteId,
  url: `${site.url}/`,
  name: site.name,
  description: meta.description || site.description,
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

const stripSiteName = (value = '') => String(value).replace(/\s*\|\s*MUKIMUKI trade\s*$/i, '').trim();

const deriveDailyPerformanceHeadline = (meta) => {
  if (meta.headline) return meta.headline;
  if (meta.pageType !== 'performanceDaily') return stripSiteName(meta.title);
  const sourceTitle = stripSiteName(meta.title);
  const date = sourceTitle.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const rate = sourceTitle.match(/[+-]\d+(?:\.\d+)?%/)?.[0];
  const value = String(meta.description || '').match(/評価額\s*(¥[\d,]+)/)?.[1];
  if (date && rate && value) return `${date}実績: 100万円比 ${rate}、評価額 ${value}`;
  return sourceTitle;
};

export const articleSchema = (meta) => ({
  '@type': 'Article',
  '@id': `${meta.url}#article`,
  headline: deriveDailyPerformanceHeadline(meta),
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
  isPartOf: meta.parentUrl ? {
    '@type': 'Article',
    '@id': `${absoluteUrl(meta.parentUrl)}#article`,
    url: absoluteUrl(meta.parentUrl),
  } : undefined,
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

export const profilePageSchema = (meta) => ({
  '@type': 'ProfilePage',
  '@id': `${absoluteUrl('/profile/')}#webpage`,
  url: absoluteUrl('/profile/'),
  name: meta.title || '運営者プロフィール',
  description: meta.description || 'MUKIMUKI tradeの運営者プロフィール。',
  datePublished: meta.published,
  dateModified: meta.modified || meta.published,
  inLanguage: site.language,
  isPartOf: { '@id': site.websiteId },
  publishedOn: { '@id': site.websiteId },
  mainEntity: { '@id': site.authorId },
});

export const legalWebPageSchema = (meta) => ({
  '@type': ['WebPage', 'AboutPage'],
  '@id': `${meta.url}#webpage`,
  url: meta.url,
  name: meta.title || '運営方針・免責事項',
  description: meta.description || 'MUKIMUKI tradeの運営方針と免責事項。',
  datePublished: meta.published,
  dateModified: meta.modified || meta.published,
  additionalType: 'https://schema.org/LegalDocument',
  inLanguage: site.language,
  isPartOf: { '@id': site.websiteId },
  author: { '@id': site.authorId },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['#disclaimer-summary', '#affiliate-disclosure', '#data-source-policy'],
  },
  hasPart: {
    '@type': ['DigitalDocument', 'WebPageElement'],
    '@id': `${meta.url}#legal-document`,
    name: '投資情報に関する免責事項',
    additionalType: 'https://schema.org/LegalDocument',
    text: '掲載内容は情報提供と運用記録を目的としたもので、金融商品取引法上の投資助言・代理業、投資運用業、または投資勧誘を目的としたものではありません。',
  },
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
    mainEntity: meta.faq.slice(0, 3).map((item) => ({
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

  if (meta.pageType === 'skip') {
    return compactObject({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
  }

  if (meta.pageType === 'home') {
    graph.push(websiteSchema(meta), personSchema({ sameAs: meta.sameAs }));
  }

  if (['performance', 'performanceDaily', 'tradeTopic', 'research', 'logic', 'article'].includes(meta.pageType)) {
    graph.push(articleSchema(meta));
  }

  if (['performanceMonthly', 'performanceYearly', 'archive', 'collection'].includes(meta.pageType)) {
    graph.push(collectionPageSchema(meta));
  }

  if (meta.pageType === 'profile') {
    graph.push(profilePageSchema(meta), personSchema({ sameAs: meta.sameAs }));
  }

  if (meta.pageType === 'legal') {
    graph.push(legalWebPageSchema(meta));
  }

  const faq = faqPageSchema(meta);
  if (faq && ['performance', 'performanceDaily', 'research', 'article', 'legal'].includes(meta.pageType)) graph.push(faq);

  if (breadcrumbPageTypes.has(meta.pageType) && meta.breadcrumbs.length) graph.push(breadcrumbSchema(meta));

  return compactObject({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
};

export const renderJsonLdScript = (frontMatter = {}) => {
  const jsonLd = buildStructuredData(frontMatter);
  if (!jsonLd['@graph']?.length) return '';
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
};

export const generateJsonLdScript = ({
  pageType = 'top',
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  section,
  author,
  faqs = [],
  items = [],
  image = site.logo,
  siteUrl = site.url,
  sameAs = site.officialX,
  parentUrl,
} = {}) => buildJsonLdScriptFromFrontMatter({
  pageType,
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  section,
  author,
  faqs,
  items,
  image,
  siteUrl,
  sameAs,
  parentUrl,
});

export const buildFAQPageSchema = (faqs = [], options = {}) => compactObject({
  '@context': 'https://schema.org',
  ...faqPageSchemaFromQa(faqs, options),
});

export const buildBreadcrumbListJsonLd = (pathValue = '/', options = {}) => {
  const siteUrl = options.siteUrl || site.url;
  const url = absoluteUrlForSite(pathValue, siteUrl);
  return compactObject({
    '@context': 'https://schema.org',
    ...breadcrumbSchema({
      url,
      breadcrumbs: buildBreadcrumbListFromPath(pathValue, options),
    }),
  });
};

export const buildJsonLdScriptFromFrontMatter = ({
  type,
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  section,
  author,
  siteUrl = site.url,
  faq = [],
  faqs = [],
  items = [],
  image = site.logo,
  pageType,
  sameAs = site.officialX,
  parentUrl,
  parent_url,
  headline,
} = {}) => {
  const pageUrl = url || siteUrl;
  const path = new URL(pageUrl, ensureTrailingSlash(siteUrl)).pathname;
  const normalizedPageType = normalizePageType(type || pageType || inferPageType(path, section), path);
  const breadcrumbs = buildBreadcrumbListFromPath(path, { siteUrl, title });
  const faqItems = faqs.length ? faqs : faq;
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
    headline,
    parentUrl: parentUrl || parent_url,
    breadcrumbs,
    faq: faqItems,
    items,
    sameAs: normalizeSameAs(sameAs),
  };
  const graph = [];

  if (normalizedPageType === 'skip') return '';

  if (normalizedPageType === 'home') {
    graph.push(
      websiteSchema(meta),
      personSchema({ sameAs: meta.sameAs }),
    );
  }

  if (['performance', 'performanceDaily', 'tradeTopic', 'research', 'logic', 'article'].includes(normalizedPageType)) {
    graph.push(articleSchema(meta));
  }

  if (['performanceMonthly', 'performanceYearly', 'archive', 'collection'].includes(normalizedPageType)) {
    graph.push(collectionPageSchema(meta));
  }

  if (normalizedPageType === 'profile') {
    graph.push(profilePageSchema(meta), personSchema({ sameAs: meta.sameAs }));
  }

  if (normalizedPageType === 'legal') {
    graph.push(legalWebPageSchema(meta));
  }

  const faqSchema = faqPageSchemaFromQa(faqItems, { url: meta.url });
  if (faqSchema && ['performance', 'performanceDaily', 'research', 'article', 'legal'].includes(normalizedPageType)) graph.push(faqSchema);

  if (breadcrumbPageTypes.has(normalizedPageType) && breadcrumbs.length) graph.push(breadcrumbSchema(meta));

  const jsonLd = compactObject({
    '@context': 'https://schema.org',
    '@graph': graph,
  });

  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
};
