const site = {
  url: 'https://mukimuki-trade.com',
  name: 'MUKIMUKI trade',
  description: '100万円からの株式投資実績、資産曲線、銘柄検討、相場メモを整理する投資ブログ。',
  language: 'ja-JP',
  logo: '/assets/mukimuki-main.png',
  authorId: 'https://mukimuki-trade.com/profile/#author',
  websiteId: 'https://mukimuki-trade.com/#website',
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
  'archive',
  'category',
  'research-index',
  'collection'
];

const truthy = new Set(['true', 'yes', 'on']);
const falsy = new Set(['false', 'no', 'off']);

const trimSlash = (value) => String(value || '').replace(/\/$/, '');
const ensureTrailingSlash = (value) => String(value || '/').endsWith('/') ? String(value || '/') : `${value}/`;

export const normalizeSameAs = (value) => {
  const defaults = [
    'https://x.com/OnigoGames',
    'https://note.com/mukimuki_trade'
  ];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === 'string') return [value];
  return defaults;
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

const inferPageType = (path, section) => {
  if (path === '/') return 'top';
  if (path === '/profile/') return 'profile';
  if (path === '/about/') return 'about';
  if (path === '/performance/latest/') return 'skip';
  if (path.startsWith('/archive/')) return 'archive';
  if (path.startsWith('/category/')) return 'category';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/$/.test(path)) return 'daily-performance';
  if (/^\/performance\/\d{4}\/\d{2}\/\d{2}\/topics\/[^/]+\/$/.test(path)) return 'trade-topic';
  if (/^\/performance\/\d{4}\/\d{2}\/$/.test(path)) return 'monthly-archive';
  if (/^\/performance\/\d{4}\/$/.test(path)) return 'yearly-archive';
  if (path === '/performance/' || path.startsWith('/performance/')) return 'daily-performance';
  if (path === '/research/' || path.startsWith('/research/')) return path === '/research/' ? 'research-index' : 'research';
  if (path === '/logic/' || path.startsWith('/logic/')) return 'logic';
  return 'top';
};

const normalizePageType = (value, path = '/') => {
  const type = String(value || inferPageType(path)).trim();
  const aliases = new Map([
    ['home', 'top'],
    ['website', 'top'],
    ['dailyPerformance', 'daily-performance'],
    ['performanceDaily', 'daily-performance'],
    ['performance-daily', 'daily-performance'],
    ['monthlyPerformance', 'monthly-archive'],
    ['monthly-performance', 'monthly-archive'],
    ['performanceMonthly', 'monthly-archive'],
    ['performance-monthly', 'monthly-archive'],
    ['yearlyArchive', 'yearly-archive'],
    ['yearly-performance', 'yearly-archive'],
    ['performanceYearly', 'yearly-archive'],
    ['performance-yearly', 'yearly-archive'],
    ['tradeTopic', 'trade-topic'],
    ['trade-topic', 'trade-topic'],
    ['stockResearch', 'research'],
    ['stock-research', 'research'],
    ['investmentLogic', 'logic'],
    ['investment-logic', 'logic'],
    ['profilePage', 'profile'],
    ['profile-page', 'profile'],
    ['legal', 'about'],
    ['disclaimer', 'about'],
    ['legalDocument', 'about'],
    ['legal-document', 'about'],
    ['latest-performance', 'skip'],
    ['latestPerformance', 'skip'],
    ['noindex', 'skip'],
    ['archive', 'collection'],
  ]);
  return aliases.get(type) || type;
};

export const breadcrumbMapping = {
  "performance": { label: "実績", url: "/performance/latest/" },
  "research":    { label: "銘柄検討", url: "/research/" },
  "logic":       { label: "投資ロジック", url: "/logic/" },
  "moomoo":      { label: "moomoo証券", url: "/moomoo/" },
  "topics":      { label: "売買トピック" },
  "category":    { label: "カテゴリ" },
  "profile":     { label: "運営者プロフィール" },
  "about":       { label: "免責事項" },
  "archive":     { label: "アーカイブ" },
  "sitemap":     { label: "サイトマップ" }
};

const titleizeSegment = (segment) => segment
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const formatDateSegment = (segment, index, segments) => {
  if (/^\d{4}$/.test(segment)) {
    return `${segment}年`;
  }
  if (/^\d{2}$/.test(segment)) {
    const prev = segments[index - 1];
    const prevPrev = segments[index - 2];
    if (prev && /^\d{4}$/.test(prev)) {
      return `${parseInt(segment, 10)}月`;
    }
    if (prev && prevPrev && /^\d{2}$/.test(prev) && /^\d{4}$/.test(prevPrev)) {
      return `${parseInt(prev, 10)}月${parseInt(segment, 10)}日`;
    }
  }
  return null;
};

export const buildBreadcrumbListFromPath = (pathValue = '/', options = {}) => {
  const siteUrl = options.siteUrl || site.url;
  const title = options.title;
  
  // Normalize path
  const urlObj = new URL(pathValue, ensureTrailingSlash(siteUrl));
  const pathname = urlObj.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    {
      name: 'ホーム',
      item: absoluteUrlForSite('/', siteUrl),
      url: absoluteUrlForSite('/', siteUrl)
    }
  ];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    currentPath += `/${segment}`;
    
    if (isLast) {
      let name = title;
      if (!name) {
        const dateName = formatDateSegment(segment, index, segments);
        name = dateName || titleizeSegment(segment);
      }
      const itemUrl = absoluteUrlForSite(currentPath + '/', siteUrl);
      breadcrumbs.push({
        name,
        item: itemUrl,
        url: itemUrl
      });
    } else {
      let name = '';
      let url = undefined;
      
      if (breadcrumbMapping[segment]) {
        name = breadcrumbMapping[segment].label;
        if (breadcrumbMapping[segment].url) {
          url = absoluteUrlForSite(breadcrumbMapping[segment].url, siteUrl);
        }
      } else {
        const dateName = formatDateSegment(segment, index, segments);
        if (dateName) {
          name = dateName;
          url = absoluteUrlForSite(currentPath + '/', siteUrl);
        }
      }
      
      if (url) {
        breadcrumbs.push({
          name,
          item: url,
          url
        });
      }
    }
  });
  
  return breadcrumbs;
};

export const personSchema = () => ({
  '@type': 'Person',
  '@id': site.authorId,
  name: site.name,
  url: absoluteUrl('/profile/'),
  image: imageUrl(site.logo),
  sameAs: normalizeSameAs(),
  jobTitle: '兼業投資家',
  knowsAbout: ['AIエージェント', '自動売買', '事業開発', '株式投資（米国株）', 'Autotrade'],
  description: '投資歴20年弱の兼業投資家。40代男性、東京都港区在住。AIエージェント、自動売買、事業開発、株式投資を専門領域とします。',
  homeLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: '港区',
      addressRegion: '東京都',
      addressCountry: 'JP',
    },
  },
});

export const websiteSchema = (meta) => ({
  '@type': 'WebSite',
  '@id': site.websiteId,
  url: `${site.url}/`,
  name: site.name,
  description: meta.description || site.description,
  inLanguage: site.language,
  publisher: { '@id': site.authorId },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${site.url}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

export const articleSchema = (meta) => {
  const schema = {
    '@type': 'Article',
    '@id': `${meta.url}#article`,
    headline: meta.title,
    description: meta.description,
    image: [imageUrl(meta.image)],
    datePublished: meta.published,
    dateModified: meta.modified || meta.published,
    inLanguage: site.language,
    author: {
      '@type': 'Person',
      '@id': site.authorId,
    },
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
  };
  if (meta.section) {
    schema.articleSection = meta.section;
  }
  if (meta.parentUrl) {
    schema.isPartOf = {
      '@type': 'Article',
      '@id': `${absoluteUrl(meta.parentUrl)}#article`,
      url: absoluteUrl(meta.parentUrl),
    };
  }
  return schema;
};

export const collectionPageSchema = (meta) => ({
  '@type': 'CollectionPage',
  '@id': `${meta.url}#webpage`,
  url: meta.url,
  name: meta.title,
  description: meta.description,
  inLanguage: site.language,
  isPartOf: { '@id': site.websiteId },
});

export const profilePageSchema = (meta) => ({
  '@type': 'ProfilePage',
  '@id': `${meta.url}#webpage`,
  url: meta.url,
  name: meta.title || '運営者プロフィール',
  description: meta.description || 'MUKIMUKI tradeの運営者プロフィール。',
  inLanguage: site.language,
  isPartOf: { '@id': site.websiteId },
  mainEntity: { '@id': site.authorId },
});

export const aboutWebPageSchema = (meta) => ({
  '@type': 'WebPage',
  '@id': `${meta.url}#webpage`,
  url: meta.url,
  name: meta.title || '運営方針・免責事項',
  description: meta.description || 'MUKIMUKI tradeの運営方針と免責事項。',
  additionalType: 'https://schema.org/WebPage',
  inLanguage: site.language,
  isPartOf: { '@id': site.websiteId },
  author: { '@id': site.authorId },
});

export const faqPageSchema = (faqs = []) => {
  if (!Array.isArray(faqs) || !faqs.length) return undefined;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.slice(0, 3).map((item) => ({
      '@type': 'Question',
      name: item.question || item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer || item.text,
      },
    })),
  };
};

export const breadcrumbSchema = (meta) => ({
  '@type': 'BreadcrumbList',
  '@id': `${meta.url}#breadcrumb`,
  itemListElement: meta.breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.item || crumb.url,
  })),
});

export const buildStructuredData = ({
  pageType,
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  section,
  parentUrl,
  faqs = []
}) => {
  const absolutePageUrl = absoluteUrl(url);
  const normalizedParentUrl = parentUrl ? absoluteUrl(parentUrl) : undefined;
  
  const meta = {
    url: absolutePageUrl,
    title,
    description: description || title,
    published: publishedTime,
    modified: modifiedTime || publishedTime,
    section,
    parentUrl: normalizedParentUrl,
    breadcrumbs: buildBreadcrumbListFromPath(absolutePageUrl, { title }),
    image: pageType === 'daily-performance' || pageType === 'trade-topic'
      ? `/assets/mukimuki-performance.png`
      : (pageType === 'research' ? `/assets/mukimuki-research.png` : site.logo)
  };

  const graph = [];

  if (pageType === 'top') {
    graph.push(websiteSchema(meta));
    graph.push(personSchema());
  } else if (pageType === 'daily-performance') {
    graph.push(articleSchema(meta));
    graph.push(breadcrumbSchema(meta));
    const faq = faqPageSchema(faqs);
    if (faq) graph.push(faq);
  } else if (pageType === 'trade-topic') {
    graph.push(articleSchema(meta));
    graph.push(breadcrumbSchema(meta));
  } else if (pageType === 'research') {
    graph.push(articleSchema(meta));
    graph.push(breadcrumbSchema(meta));
    const faq = faqPageSchema(faqs);
    if (faq) graph.push(faq);
  } else if (pageType === 'monthly-archive' || pageType === 'yearly-archive' || pageType === 'category' || pageType === 'research-index' || pageType === 'archive' || pageType === 'collection') {
    graph.push(collectionPageSchema(meta));
    graph.push(breadcrumbSchema(meta));
  } else if (pageType === 'logic') {
    if (absolutePageUrl.replace(/\/$/, '').endsWith('/logic')) {
      graph.push(collectionPageSchema(meta));
    } else {
      graph.push(articleSchema(meta));
    }
    graph.push(breadcrumbSchema(meta));
  } else if (pageType === 'profile') {
    graph.push(personSchema());
    graph.push(profilePageSchema(meta));
  } else if (pageType === 'about') {
    graph.push(aboutWebPageSchema(meta));
  }

  return compactObject({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
};

export const renderJsonLdScript = (frontMatter = {}) => {
  const options = {
    pageType: normalizePageType(frontMatter.pageType || frontMatter.type, frontMatter.path || frontMatter.url),
    title: frontMatter.title,
    description: frontMatter.description,
    url: frontMatter.url || frontMatter.path,
    publishedTime: frontMatter.publishedTime || frontMatter.published_time || frontMatter.published || frontMatter.datePublished || frontMatter.pubDate,
    modifiedTime: frontMatter.modifiedTime || frontMatter.modified_time || frontMatter.modified || frontMatter.dateModified,
    section: frontMatter.section || frontMatter.category,
    parentUrl: frontMatter.parentUrl || frontMatter.parent_url,
    faqs: frontMatter.faqs || frontMatter.faq
  };
  const jsonLd = buildStructuredData(options);
  if (!jsonLd['@graph'] || !jsonLd['@graph'].length) return '';
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
};

export const generateJsonLdScript = (options = {}) => {
  const opts = {
    pageType: normalizePageType(options.pageType || options.type, options.url),
    title: options.title,
    description: options.description,
    url: options.url,
    publishedTime: options.publishedTime || options.published_time || options.published || options.datePublished || options.pubDate,
    modifiedTime: options.modifiedTime || options.modified_time || options.modified || options.dateModified,
    section: options.section || options.category,
    parentUrl: options.parentUrl || options.parent_url,
    faqs: options.faqs || options.faq
  };
  const jsonLd = buildStructuredData(opts);
  if (!jsonLd['@graph'] || !jsonLd['@graph'].length) return '';
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
};

export const buildFAQPageSchema = (faqs = [], options = {}) => {
  const schema = faqPageSchema(faqs.map(f => ({
    question: f.question || f.name,
    answer: f.answer || f.text
  })));
  return compactObject({
    '@context': 'https://schema.org',
    ...schema
  });
};

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

export const buildJsonLdScriptFromFrontMatter = (frontMatter = {}) => {
  return renderJsonLdScript(frontMatter);
};
