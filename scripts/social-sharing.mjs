const defaultHandle = 'OnigoGames';
const defaultHashtags = ['MUKIMUKItrade', '米国株', '投資記録'];

const normalizeAbsoluteUrl = (url, siteUrl = 'https://mukimuki-trade.com') => {
  if (/^https?:\/\//.test(String(url || ''))) return String(url);
  const path = String(url || '/').startsWith('/') ? String(url || '/') : `/${url}`;
  return `${siteUrl}${path}`;
};

const textLimit = (value, limit = 160) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}…`;
};

export const xIntentUrl = ({
  url,
  text,
  hashtags = defaultHashtags,
  via = defaultHandle,
} = {}) => {
  const params = new URLSearchParams();
  if (text) params.set('text', textLimit(text, 180));
  if (url) params.set('url', url);
  if (via) params.set('via', via.replace(/^@/, ''));
  if (hashtags.length) params.set('hashtags', hashtags.map((item) => String(item).replace(/^#/, '')).join(','));
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

export const renderTwitterCardTags = ({
  title,
  description,
  url,
  image,
  escapeHtml = (value) => String(value ?? ''),
} = {}) => {
  const cardTitle = textLimit(title, 70);
  const cardDescription = textLimit(description, 120);
  return `  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@${escapeHtml(defaultHandle)}">
  <meta name="twitter:creator" content="@${escapeHtml(defaultHandle)}">
  <meta name="twitter:title" content="${escapeHtml(cardTitle)}">
  <meta name="twitter:description" content="${escapeHtml(cardDescription)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:url" content="${escapeHtml(url)}">`;
};

export const renderXShareSection = ({
  url,
  title,
  text,
  hashtags = defaultHashtags,
  escapeHtml = (value) => String(value ?? ''),
} = {}) => {
  const shareText = text || title;
  const href = xIntentUrl({ url, text: shareText, hashtags });
  return `      <section class="article-panel social-share" aria-labelledby="x-share-title">
        <h2 id="x-share-title">Xで記録を共有</h2>
        <p>このページは日々の公開記録として残しています。気になる銘柄や実績の変化があれば、Xで共有してあとから見返せます。</p>
        <p><a class="btn btn-primary" href="${escapeHtml(href)}" target="_blank" rel="noopener">Xで共有</a> <a class="btn btn-secondary" href="https://x.com/${escapeHtml(defaultHandle)}" target="_blank" rel="me noopener">公式Xを見る</a></p>
      </section>`;
};

export const performanceXPostText = ({ report, url } = {}) => {
  const latest = report.latest;
  const holdings = (latest.positions || [])
    .slice(0, 4)
    .map((position) => String(position.symbol || '').replace(/^US\./, ''))
    .filter(Boolean);
  const date = latest.reportDate;
  const totalReturn = `${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(2)}%`;
  const dailyPnl = `${latest.jpy.delta >= 0 ? '+' : ''}${Math.round(latest.jpy.delta).toLocaleString('ja-JP')}円`;
  const asset = Math.round(latest.jpy.end).toLocaleString('ja-JP');
  return [
    `${date} 米国株トレード実績`,
    `評価額: ${asset}円`,
    `100万円比: ${totalReturn}`,
    `前日比: ${dailyPnl}`,
    holdings.length ? `保有: ${holdings.join(' / ')}` : '保有: なし',
    '',
    url,
  ].join('\n');
};
