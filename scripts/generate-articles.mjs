import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderJsonLdScript } from './structured-data.mjs';
import { buildBreadcrumbsFromPath, renderBreadcrumbHtml } from './breadcrumbs.mjs';
import { buildArticleIndex, renderRelatedArticlesSection } from './internal-links.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://mukimuki-trade.com';
const officialXUrl = 'https://x.com/OnigoGames';
const articlesPath = path.join(root, 'data', 'articles.json');
const contentPath = path.join(root, 'data', 'content.json');
const { articles } = JSON.parse(await readFile(articlesPath, 'utf8'));
const content = JSON.parse(await readFile(contentPath, 'utf8'));
const articleIndex = buildArticleIndex({ articles, posts: content.posts });

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const absoluteUrl = (pagePath) => `${siteUrl}${pagePath}`;
const imageUrl = (imagePath) => `${siteUrl}${imagePath}`;
const displayDate = (value) => value.slice(0, 10).replaceAll('-', '.');

const nav = `    <nav class="nav-links" aria-label="主要メニュー">
      <a href="/performance/latest/">実績</a>
      <a href="/research/">銘柄検討</a>
      <a href="/logic/">ロジック</a>
      <a href="/moomoo/">moomoo</a>
      <a href="/archive/">アーカイブ</a>
      <a href="/profile/">運営者</a>
      <a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a>
    </nav>`;

const mobileMenu = `    <details class="mobile-menu">
      <summary aria-label="メニュー">
        <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </summary>
      <nav class="mobile-nav-links" aria-label="スマホメニュー">
        <a href="/performance/latest/">実績</a>
        <a href="/research/">銘柄検討</a>
        <a href="/logic/">ロジック</a>
        <a href="/moomoo/">moomoo</a>
        <a href="/archive/">アーカイブ</a>
        <a href="/profile/">運営者</a>
        <a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a>
      </nav>
    </details>`;

const header = `  <header class="site-header">
    <a class="brand" href="/" aria-label="MUKIMUKI trade home">
      <img src="/assets/mukimuki-main.png" alt="">
      <span><strong>MUKIMUKI trade</strong><small>数字で追う公開記録</small></span>
    </a>
${mobileMenu}
${nav}
  </header>`;

const footer = `  <footer class="site-footer">
    <strong>MUKIMUKI trade</strong>
    <p>初めての方は最新実績からどうぞ。資産曲線、銘柄候補、売買ロジックを短く追えるように整理しています。広告リンクを含む場合があります。</p>
    <nav class="footer-links" aria-label="補助リンク"><a href="/profile/">運営者</a><a href="/archive/">アーカイブ</a><a href="/feed.xml">RSS</a><a href="/about/">運営方針</a><a href="${officialXUrl}" target="_blank" rel="me noopener">公式X</a></nav>
  </footer>`;

const renderSection = (section) => `      <section class="article-panel">
        <h2>${escapeHtml(section.heading)}</h2>
${(section.paragraphs || []).map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`).join('\n')}
${section.bullets ? `        <ul>
${section.bullets.map((item) => `          <li>${escapeHtml(item)}</li>`).join('\n')}
        </ul>` : ''}
${section.code ? `        <pre class="logic-code"><code>${escapeHtml(section.code)}</code></pre>` : ''}
      </section>`;

const renderSources = (sources = []) => {
  if (!sources.length) return '';
  return `      <section class="article-panel">
        <h2>参考にした外部情報</h2>
        <ul class="source-list">
${sources.map((source) => `          <li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`).join('\n')}
        </ul>
      </section>`;
};

const renderArticle = (article) => {
  const breadcrumbs = buildBreadcrumbsFromPath(article.path, article.title);
  const jsonLdScript = renderJsonLdScript({
    pageType: article.categoryKey === 'research' ? 'research' : 'article',
    title: article.title,
    description: article.description,
    published_time: article.published,
    modified_time: article.modified,
    author: 'MUKIMUKI trade',
    url: absoluteUrl(article.path),
    path: article.path,
    section: article.category,
    image: article.image,
    keywords: article.tags,
    breadcrumbs,
    faq: article.faq || [],
  });

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.title)} | MUKIMUKI trade</title>
  <meta name="description" content="${escapeHtml(article.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(article.path))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${escapeHtml(article.title)} | MUKIMUKI trade">
  <meta property="og:description" content="${escapeHtml(article.description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(article.path))}">
  <meta property="og:image" content="${escapeHtml(imageUrl(article.image))}">
  <meta property="article:published_time" content="${escapeHtml(article.published)}">
  <meta property="article:modified_time" content="${escapeHtml(article.modified)}">
  <meta property="article:section" content="${escapeHtml(article.category)}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="MUKIMUKI trade RSS" href="/feed.xml">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript}
</head>
<body>
${header}

  <main>
    <section class="article-hero">
      <div class="article-hero-inner">
        ${renderBreadcrumbHtml(breadcrumbs, escapeHtml)}
        <p class="eyebrow">${escapeHtml(article.eyebrow)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(article.summary)}</p>
      </div>
    </section>

    <article class="article-body article-longform">
      <section class="article-panel article-intro">
        <div class="article-meta-row">
          <span>${escapeHtml(displayDate(article.published))}</span>
          <span>${escapeHtml(article.category)}</span>
        </div>
        <p>${escapeHtml(article.summary)}</p>
        <div class="tag-row">
${article.tags.map((tag) => `          <span>${escapeHtml(tag)}</span>`).join('\n')}
        </div>
      </section>

${article.sections.map(renderSection).join('\n\n')}

${renderSources(article.sources)}

${renderRelatedArticlesSection(article, articleIndex, { escapeHtml })}

      <section class="article-panel">
        <h2>次に読む</h2>
        <p><a href="${escapeHtml(article.categoryUrl)}">${escapeHtml(article.category)}の記事一覧</a> と <a href="/performance/latest/">最新の実績レポート</a> をあわせて読むと、候補整理と実際の売買結果をつなげて確認できます。</p>
      </section>
    </article>
  </main>

${footer}
</body>
</html>
`;
};

const buildCollectionPage = (categoryKey) => {
  const categoryArticles = articles.filter((article) => article.categoryKey === categoryKey);
  const category = categoryArticles[0].category;
  const categoryUrl = categoryArticles[0].categoryUrl;
  const title = `${category}の記事一覧`;
  const description = 'MUKIMUKI tradeの投資ロジック記事一覧。シグナル、エントリー、リスク管理、出口判断を公開できる範囲で紹介します。';
  const jsonLdScript = renderJsonLdScript({
    pageType: 'collection',
    title,
    description,
    url: absoluteUrl(categoryUrl),
    path: categoryUrl,
    section: category,
    breadcrumbs: [
      { name: 'Home', item: `${siteUrl}/` },
      { name: category, item: absoluteUrl(categoryUrl) },
    ],
    items: categoryArticles.map((article) => ({
      name: article.title,
      path: article.path,
    })),
  });

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | MUKIMUKI trade</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(categoryUrl))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${escapeHtml(title)} | MUKIMUKI trade">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(categoryUrl))}">
  <meta property="og:image" content="${siteUrl}/assets/mukimuki-editor.png">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="MUKIMUKI trade RSS" href="/feed.xml">
  <link rel="stylesheet" href="/styles.css">
  ${jsonLdScript}
</head>
<body>
${header}

  <main>
    <section class="article-hero">
      <div class="article-hero-inner">
        <nav class="breadcrumb" aria-label="breadcrumb"><a href="/">Home</a><span>/</span><span>${escapeHtml(category)}</span></nav>
        <p class="eyebrow">CATEGORY / TRADE LOGIC</p>
        <h1>${escapeHtml(title)}</h1>
        <p>売買シグナル、エントリー、リスク管理、出口判断を、公開できる範囲で分かりやすく整理します。</p>
      </div>
    </section>

    <section class="collection-body" aria-label="${escapeHtml(category)}の記事">
${categoryArticles.map((article) => `      <article class="collection-card">
        <span class="post-kicker">${escapeHtml(displayDate(article.published))} / ${escapeHtml(article.category)}</span>
        <h2><a href="${escapeHtml(article.path)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.description)}</p>
        <div class="tag-row">
${article.tags.slice(0, 4).map((tag) => `          <span>${escapeHtml(tag)}</span>`).join('\n')}
        </div>
      </article>`).join('\n')}
    </section>
  </main>

${footer}
</body>
</html>
`;
};

for (const article of articles) {
  const outputDir = path.join(root, article.path);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), renderArticle(article));
}

const logicDir = path.join(root, 'logic');
await mkdir(logicDir, { recursive: true });
await writeFile(path.join(logicDir, 'index.html'), buildCollectionPage('logic'));

console.log(`Generated ${articles.length} article pages and logic index.`);
