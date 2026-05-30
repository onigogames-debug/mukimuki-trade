const tickerPattern = /\b(?:US\.)?[A-Z]{2,5}\b/g;
const stopTickers = new Set([
  'AI', 'EV', 'EST', 'JPY', 'USD', 'FAQ', 'PR',
  'BUY', 'SELL', 'RISK', 'MA', 'VWAP', 'RSI', 'TP', 'SL', 'CSV',
  'TRADE', 'TOPIC', 'STOCK', 'LOGIC', 'DAILY', 'URL', 'FOMC',
]);

const normalizeTicker = (value) => String(value || '').replace(/^US\./, '').toUpperCase();

export const extractTickers = (text = '') => {
  const matches = String(text).match(tickerPattern) || [];
  return [...new Set(matches.map(normalizeTicker).filter((ticker) => !stopTickers.has(ticker)))];
};

const tokenize = (article) => {
  const text = [
    article.title,
    article.description,
    article.summary,
    article.category,
    ...(article.tags || []),
    ...(article.sections || []).flatMap((section) => [
      section.heading,
      ...(section.paragraphs || []),
      ...(section.bullets || []),
    ]),
  ].filter(Boolean).join(' ');

  return {
    ...article,
    tickers: [...new Set([...(article.tickers || []), ...extractTickers(text)])],
    tokens: text,
  };
};

export const buildArticleIndex = ({ articles = [], posts = [], performanceReports = [] } = {}) => {
  const generatedArticles = articles.map((article) => tokenize({
    title: article.title,
    description: article.description,
    summary: article.summary,
    path: article.path,
    url: article.url || article.path,
    date: article.modified || article.published || article.date,
    category: article.category,
    categoryKey: article.categoryKey,
    tags: article.tags || [],
    sections: article.sections || [],
  }));

  const postArticles = posts.map((post) => tokenize({
    title: post.title,
    description: post.description,
    summary: post.description,
    path: post.path,
    url: post.url || post.path,
    date: post.modified || post.pubDate || post.date,
    category: post.category,
    categoryKey: categoryKeyFromLabel(post.category),
    tags: [post.category],
  }));

  const performanceArticles = performanceReports.map((report) => {
    const latest = report.latest;
    return tokenize({
      title: `${latest.reportDateDisplay} 実績レポート`,
      description: `評価額 ${Math.round(latest.jpy.end).toLocaleString('ja-JP')}円、前日比 ${Math.round(latest.jpy.delta).toLocaleString('ja-JP')}円、取引${latest.summary.totalTrades}件。`,
      summary: `保有銘柄: ${(latest.positions || []).map((position) => position.symbol).join(', ')}`,
      path: performanceDatePath(latest.reportDate),
      url: performanceDatePath(latest.reportDate),
      date: latest.reportDate,
      category: '実績公開',
      categoryKey: 'performance',
      tags: ['実績公開', '100万円チャレンジ', ...(latest.positions || []).map((position) => position.symbol)],
    });
  });

  const merged = new Map();
  for (const article of [...generatedArticles, ...postArticles, ...performanceArticles]) {
    if (!article.path) continue;
    if (merged.has(article.path)) {
      const existing = merged.get(article.path);
      merged.set(article.path, tokenize({
        ...existing,
        ...Object.fromEntries(Object.entries(article).filter(([, value]) => value !== undefined && value !== null && value !== '')),
        tags: [...new Set([...(existing.tags || []), ...(article.tags || [])])],
        tickers: [...new Set([...(existing.tickers || []), ...(article.tickers || [])])],
        tokens: [existing.tokens, article.tokens].filter(Boolean).join(' '),
      }));
      continue;
    }
    merged.set(article.path, article);
  }

  return [...merged.values()];
};

const categoryKeyFromLabel = (label) => {
  if (label === '実績公開') return 'performance';
  if (label === '銘柄検討') return 'research';
  if (label === '投資ロジック') return 'logic';
  if (label === 'moomoo') return 'moomoo';
  return 'article';
};

export const performanceDatePath = (date) => {
  const [year, month, day] = String(date).split('-');
  return `/performance/${year}/${month}/${day}/`;
};

const intersectionSize = (a, b) => {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item)).length;
};

const displayDate = (value = '') => String(value || '').slice(0, 10);

export const suggestRelatedArticles = (current, index, { max = 3 } = {}) => {
  const source = tokenize(current);
  const sourceTags = source.tags || [];
  const sourceTickers = source.tickers || [];
  const sourceText = source.tokens || '';

  return index
    .filter((candidate) => candidate.path && candidate.path !== source.path)
    .map((candidate) => {
      const tickerScore = intersectionSize(sourceTickers, candidate.tickers || []) * 8;
      const tagScore = intersectionSize(sourceTags, candidate.tags || []) * 3;
      const categoryScore = source.categoryKey && source.categoryKey === candidate.categoryKey ? 2 : 0;
      const themeScore = (candidate.tags || []).filter((tag) => sourceText.includes(tag)).length;
      const crossScore = source.categoryKey !== candidate.categoryKey ? 1 : 0;
      return {
        ...candidate,
        url: candidate.url || candidate.path,
        date: displayDate(candidate.date || candidate.published || candidate.pubDate || ''),
        score: tickerScore + tagScore + categoryScore + themeScore + crossScore,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, max);
};

export const getRelatedArticleSummaries = (current, allArticles, { max = 3 } = {}) => (
  suggestRelatedArticles(current, allArticles, { max }).map((article) => ({
    title: article.title,
    url: article.url || article.path,
    date: displayDate(article.date || ''),
  }))
);

export const renderRelatedArticlesSection = (current, index, { escapeHtml, max = 3 } = {}) => {
  const escape = escapeHtml || ((value) => String(value ?? ''));
  const related = suggestRelatedArticles(current, index, { max });
  if (!related.length) return '';

  return `      <section class="article-panel related-articles" aria-labelledby="related-articles-title">
        <h2 id="related-articles-title">関連する記事</h2>
        <div class="link-grid">
${related.map((article) => `          <a class="link-card" href="${escape(article.path)}"><span>${escape(article.date || article.category || '関連記事')}</span><strong>${escape(article.title)}</strong><p>${escape(article.description || article.summary || '')}</p></a>`).join('\n')}
        </div>
      </section>`;
};
