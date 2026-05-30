import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderJsonLdScript } from './structured-data.mjs';
import { buildBreadcrumbsFromPath, renderBreadcrumbHtml } from './breadcrumbs.mjs';
import { buildArticleIndex, extractTickers, renderRelatedArticlesSection } from './internal-links.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://mukimuki-trade.com';
const officialXUrl = 'https://x.com/OnigoGames';
const articlesPath = path.join(root, 'data', 'articles.json');
const contentPath = path.join(root, 'data', 'content.json');
const datasetsDir = path.join(root, 'datasets');
const { articles } = JSON.parse(await readFile(articlesPath, 'utf8'));
const content = JSON.parse(await readFile(contentPath, 'utf8'));

const loadPerformanceReports = async () => {
  const files = (await readdir(datasetsDir))
    .filter((file) => /^performance-\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort();
  const reports = [];
  for (const file of files) {
    reports.push(JSON.parse(await readFile(path.join(datasetsDir, file), 'utf8')));
  }
  return reports;
};

const performanceReports = await loadPerformanceReports();
const articleIndex = buildArticleIndex({ articles, posts: content.posts, performanceReports });

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
      <img src="/assets/mukimuki-main.png" alt="MUKIMUKIキャラクター - 100万円トレード記録ブログのロゴ">
      <span><strong>MUKIMUKI trade</strong><small>数字で追う公開記録</small></span>
    </a>
${mobileMenu}
${nav}
  </header>`;

const footer = `  <footer class="site-footer">
    <strong>MUKIMUKI trade</strong>
    <p>100万円からの米国株トレード実績、銘柄メモ、売買ロジックを記録しています。掲載内容には広告リンクを含む場合があります。</p>
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

const defaultResearchFaq = (article) => {
  if (article.categoryKey !== 'research') return [];
  return [
    {
      question: `${article.title}は買い推奨ですか？`,
      answer: 'いいえ。銘柄検討は自己運用の候補整理であり、特定銘柄の売買を推奨するものではありません。',
    },
    {
      question: '銘柄検討では何を確認しますか？',
      answer: '注目理由、決算や売上成長、利益率、ニュース、株価位置、出来高、撤退条件を分けて確認します。',
    },
    {
      question: '実際の保有状況はどこで確認できますか？',
      answer: '最新実績ページと日付別の実績ページで、評価額、前日比、保有銘柄、売買件数を記録しています。',
    },
  ];
};

const displayArchiveDate = (value = '') => {
  if (!value) return '';
  return String(value).slice(0, 10).replaceAll('-', '.');
};

const articleFaq = (article) => article.faq || article.faqs || defaultResearchFaq(article);

const renderFaqSection = (faqs = []) => {
  if (!faqs.length) return '';
  return `      <section class="article-panel">
        <h2>よくある質問</h2>
        <div class="faq-list">
${faqs.map((item) => `          <div class="faq-item">
            <h3>${escapeHtml(item.question || item.name)}</h3>
            <p>${escapeHtml(item.answer || item.text)}</p>
          </div>`).join('\n')}
        </div>
      </section>`;
};

const renderArticle = (article) => {
  const breadcrumbs = buildBreadcrumbsFromPath(article.path, article.title);
  const faqs = articleFaq(article);
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
    faq: faqs,
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

${renderFaqSection(faqs)}

${renderRelatedArticlesSection(article, articleIndex, { escapeHtml })}

      <section class="article-panel">
        <h2>関連する記録</h2>
        <p><a href="${escapeHtml(article.categoryUrl)}">${escapeHtml(article.category)}の記事一覧</a> と <a href="/performance/latest/">最新の実績レポート</a> では、候補整理と実際の売買結果を別の角度から記録しています。</p>
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

    <section class="article-body">
      <section class="article-panel">
        <h2>このカテゴリで確認できること</h2>
        <p>投資ロジックの記事では、売買判断をひとつの正解として見せるのではなく、シグナル、エントリー、リスク管理、利確、撤退の順番で整理します。毎日の実績公開とあわせることで、数字の変化と判断の流れをつなげて確認できます。</p>
        <p>特に米国株は材料、出来高、決算、金利感応度によって短期の値動きが大きく変わります。ここでは公開できる範囲で、どの情報を先に見て、どの条件なら見送り、どの条件なら株数を抑えるのかを記事ごとに分けています。</p>
      </section>
      <section class="article-panel">
        <h2>ロジック記事の構成</h2>
        <p><a href="/logic/signal-score/">シグナルの見方</a>、<a href="/logic/entry-risk/">エントリーとリスク</a>、<a href="/logic/exit-review/">利確と撤退</a>の3本で、候補化から出口判断までを分けて記録しています。実際の数字は<a href="/performance/latest/">最新実績</a>と<a href="/performance/2026/05/">月次実績アーカイブ</a>にまとめています。</p>
      </section>
    </section>
  </main>

${footer}
</body>
</html>
`;
};

const tickerArchiveArticles = () => {
  const tickerMap = new Map();
  for (const article of articleIndex) {
    const text = [
      article.title,
      article.description,
      article.summary,
      ...(article.tags || []),
      article.tokens,
    ].filter(Boolean).join(' ');
    const tickers = [...new Set([...(article.tickers || []), ...extractTickers(text)])];
    for (const ticker of tickers) {
      if (!tickerMap.has(ticker)) tickerMap.set(ticker, []);
      tickerMap.get(ticker).push(article);
    }
  }
  return [...tickerMap.entries()]
    .filter(([, tickerArticles]) => tickerArticles.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));
};

const renderTickerArchivePage = (ticker, tickerArticles) => {
  const archivePath = `/research/tag/${ticker.toLowerCase()}/`;
  const title = `${ticker}の銘柄検討記事一覧`;
  const description = `${ticker}に関連する銘柄検討、売買トピック、日次実績をまとめたアーカイブです。保有状況、売買理由、関連テーマを時系列で確認できます。`;
  const sortedArticles = [...tickerArticles].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || a.path.localeCompare(b.path));
  const breadcrumbs = [
    { name: 'Home', item: `${siteUrl}/` },
    { name: '銘柄検討', item: absoluteUrl('/research/') },
    { name: ticker, item: absoluteUrl(archivePath) },
  ];
  const jsonLdScript = renderJsonLdScript({
    pageType: 'collection',
    title,
    description,
    url: absoluteUrl(archivePath),
    path: archivePath,
    section: '銘柄別アーカイブ',
    breadcrumbs,
    items: sortedArticles.map((article) => ({
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
  <link rel="canonical" href="${escapeHtml(absoluteUrl(archivePath))}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MUKIMUKI trade">
  <meta property="og:title" content="${escapeHtml(title)} | MUKIMUKI trade">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(archivePath))}">
  <meta property="og:image" content="${siteUrl}/assets/mukimuki-research.png">
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
        <p class="eyebrow">RESEARCH TAG / ${escapeHtml(ticker)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </div>
    </section>

    <section class="collection-body" aria-label="${escapeHtml(ticker)}の記事一覧">
${sortedArticles.map((article) => `      <article class="collection-card">
        <span class="post-kicker">${escapeHtml(displayArchiveDate(article.date))} / ${escapeHtml(article.category || '関連記事')}</span>
        <h2><a href="${escapeHtml(article.path)}">${escapeHtml(article.title)}</a></h2>
        <p>${escapeHtml(article.description || article.summary || '')}</p>
        <div class="tag-row">
${[ticker, ...(article.tags || []).filter((tag) => tag !== ticker).slice(0, 3)].map((tag) => `          <span>${escapeHtml(tag)}</span>`).join('\n')}
        </div>
      </article>`).join('\n')}
    </section>

    <section class="article-body">
      <section class="article-panel">
        <h2>${escapeHtml(ticker)}を読む時の見方</h2>
        <p>銘柄別アーカイブでは、候補整理、売買トピック、日次実績を同じ銘柄軸で並べています。単独の記事だけで判断せず、保有状況、売買件数、関連テーマの変化を時系列で確認できます。</p>
        <p>${escapeHtml(ticker)}のような米国株は、決算、材料、出来高、地合いによって短期間で評価が変わりやすくなります。このページでは、銘柄検討の記事だけでなく、実際の売買記録や日次実績に出てきた場面もまとめ、候補として見た理由と運用上の扱いをつなげて読めるようにしています。</p>
        <p>初めて読む場合は、まず一覧の新しい記事から確認し、次に同じ月の実績ページで評価額、前日比、保有株数の変化を見ます。候補として強いテーマに見えても、売買件数が増えすぎている日や、含み損を抱えたまま持ち越している日は、リスクの取り方まで確認することが大切です。</p>
        <p>掲載内容は自己運用ログと市場メモであり、特定銘柄の売買を推奨するものではありません。</p>
      </section>
      <section class="article-panel">
        <h2>あわせて確認するページ</h2>
        <p>直近の数字は<a href="/performance/latest/">最新実績</a>、日別の固定記録は<a href="/performance/2026/05/">月次実績アーカイブ</a>、候補化や撤退条件の考え方は<a href="/logic/">投資ロジック</a>にまとめています。銘柄別ページから実績とロジックへ戻ることで、テーマだけでなく資産推移との関係も追いやすくなります。</p>
      </section>
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

await rm(path.join(root, 'research', 'tag'), { recursive: true, force: true });
const tickerArchives = tickerArchiveArticles();
for (const [ticker, tickerArticles] of tickerArchives) {
  const outputDir = path.join(root, 'research', 'tag', ticker.toLowerCase());
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), renderTickerArchivePage(ticker, tickerArticles));
}

console.log(`Generated ${articles.length} article pages, logic index, and ${tickerArchives.length} ticker archive pages.`);
