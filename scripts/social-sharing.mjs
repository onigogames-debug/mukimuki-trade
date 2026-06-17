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

export const generateTradesSummaryText = (report) => {
  const latest = report.latest;
  const trades = latest.trades || [];
  const positions = latest.positions || [];
  const jpyEnd = latest.jpy.end;
  const jpyDelta = latest.jpy.delta;

  let summary = '';

  if (trades.length === 0) {
    summary = `引け後は${positions.length ? positions.map(p => String(p.symbol || '').replace(/^US\./, '')).join('・') + 'を保有' : 'ノーポジション'}。`;
  } else {
    // Group trades by symbol
    const tradeGroups = {};
    for (const trade of trades) {
      const symbol = String(trade.symbol || '').replace(/^US\./, '');
      if (!tradeGroups[symbol]) {
        tradeGroups[symbol] = [];
      }
      tradeGroups[symbol].push(trade);
    }

    const symbols = Object.keys(tradeGroups);
    if (symbols.length <= 2) {
      const parts = [];
      for (const [symbol, symbolTrades] of Object.entries(tradeGroups)) {
        const buys = symbolTrades.filter(t => t.side === 'BUY');
        const sells = symbolTrades.filter(t => t.side === 'SELL');

        const totalBuyShares = buys.reduce((sum, t) => sum + (t.shares || 0), 0);
        const totalSellShares = sells.reduce((sum, t) => sum + (t.shares || 0), 0);

        if (totalBuyShares > 0 && totalSellShares > 0) {
          const avgBuyPrice = totalBuyShares > 0 ? buys.reduce((sum, t) => sum + (t.amountUsd || 0), 0) / totalBuyShares : 0;
          const avgSellPrice = totalSellShares > 0 ? sells.reduce((sum, t) => sum + (t.amountUsd || 0), 0) / totalSellShares : 0;
          const isProfit = avgSellPrice > avgBuyPrice;
          const tradeTypeWord = isProfit ? '利確' : '損切り';

          if (sells.length > 1) {
            const sellsStr = sells.map(t => `${t.shares}株`).join('+');
            parts.push(`${symbol}を${totalBuyShares}株買い、${sellsStr}で分割${tradeTypeWord}。`);
          } else {
            parts.push(`${symbol}を${totalBuyShares}株買い、${totalSellShares}株で${tradeTypeWord}。`);
          }
        } else if (totalBuyShares > 0) {
          parts.push(`${symbol}を${totalBuyShares}株買い。`);
        } else if (totalSellShares > 0) {
          if (sells.length > 1) {
            const sellsStr = sells.map(t => `${t.shares}株`).join('+');
            parts.push(`${symbol}を${sellsStr}で分割売却。`);
          } else {
            parts.push(`${symbol}を${totalSellShares}株売却。`);
          }
        }
      }
      summary = parts.join(' ');
    } else {
      const sampleSymbols = symbols.slice(0, 2).join('や');
      summary = `${sampleSymbols}など複数銘柄の売買を実施。`;
    }

    // EOD positions note
    if (positions.length === 0) {
      summary += '引け後はノーポジション。';
    } else {
      const holdingsStr = positions.slice(0, 3).map(p => `${String(p.symbol || '').replace(/^US\./, '')}`).join('・');
      const moreStr = positions.length > 3 ? 'など' : '';
      summary += `引け後は${holdingsStr}${moreStr}を保有。`;
    }
  }

  // Concluding sentence
  if (jpyEnd >= 990000 && jpyEnd < 1000000 && jpyDelta > 0) {
    summary += '100万円目前まで戻した一日を記録しました。';
  } else if (jpyEnd >= 1000000 && jpyDelta > 0) {
    summary += '100万円の大台を突破・維持した一日を記録しました。';
  } else if (jpyDelta > 0) {
    summary += '前日比プラスとなった一日を記録しました。';
  } else {
    summary += '調整の一日を記録しました。';
  }

  return summary;
};

export const performanceXPostText = ({ report, url } = {}) => {
  const latest = report.latest;
  const [, year, month, day] = latest.reportDate.match(/^(\d{4})-(\d{2})-(\d{2})$/) || [];
  const monthDay = month && day ? `${Number(month)}/${Number(day)}` : latest.reportDate;

  const formatJpyWithDecimalsSign = (val, showPlus = false) => {
    const isNegative = val < 0;
    const absValue = Math.abs(val);
    const formatted = absValue.toLocaleString('ja-JP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (isNegative) {
      return `-¥${formatted}`;
    }
    return `${showPlus ? '+' : ''}¥${formatted}`;
  };

  const asset = formatJpyWithDecimalsSign(latest.jpy.end, false);
  const dailyPnl = formatJpyWithDecimalsSign(latest.jpy.delta, true);
  const totalReturn = `${latest.summary.totalReturnPct >= 0 ? '+' : ''}${latest.summary.totalReturnPct.toFixed(2)}%`;
  const tradeCount = latest.summary.totalTrades;

  const tradesSummary = generateTradesSummaryText(report);

  return [
    `MUKIMUKI trade ${monthDay}実績`,
    '',
    '100万円スタート',
    `評価額 ${asset}`,
    `前日比 ${dailyPnl}`,
    `100万円比 ${totalReturn}`,
    `約定${tradeCount}件`,
    '',
    tradesSummary,
    '',
    url,
    '',
    '#米国株 #投資記録',
    '※投資助言ではありません',
  ].join('\n');
};
