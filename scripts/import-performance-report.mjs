import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultReportsDir = path.resolve(root, '..', '..', 'moomoo', 'reports');
const startCapitalJpy = 1_000_000;
const minimumChallengeAssetJpy = startCapitalJpy * 0.7;
const affiliateUrl = 'https://j.jp.moomoo.com/0BdcjG';

const providedReportPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
const reportsDir = providedReportPath ? path.dirname(providedReportPath) : defaultReportsDir;

const numberFrom = (value) => {
  if (!value || String(value).includes('未取得')) return null;
  const normalized = String(value).replaceAll(',', '').replace(/[^\d.+-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const numbersFromLine = (line) => (
  line.match(/[+-]?(?:¥|\$)?[+-]?\d[\d,.]*/g) || []
).map(numberFrom).filter((value) => value !== null);

const integerFromLine = (line) => {
  const match = line.match(/([0-9,]+)\s*(?:件|回)/);
  return match ? Number(match[1].replaceAll(',', '')) : null;
};

const toIsoJst = (value) => {
  if (!value) return null;
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}+09:00`;
};

const displayDate = (date) => date.replaceAll('-', '.');

const displayTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return `${timestamp.slice(0, 10).replaceAll('-', '.')} ${timestamp.slice(11, 19)} JST`;
};

const shortDateLabel = (date) => {
  const [, month, day] = date.match(/^\d{4}-(\d{2})-(\d{2})$/) || [];
  return month && day ? `${Number(month)}/${Number(day)}` : date;
};

const round = (value, digits = 2) => (
  value === null || value === undefined ? null : Number(value.toFixed(digits))
);

const extractSection = (text, title) => {
  const pattern = new RegExp(`【${title}】\\n([\\s\\S]*?)(?=\\n【|\\n=|$)`);
  return text.match(pattern)?.[1]?.trim() || '';
};

const parseAssetLine = (text, label) => {
  const line = text.split('\n').find((item) => item.includes(`${label} 総資産`));
  if (!line) return { start: null, end: null, delta: null };
  const [start, end, delta] = numbersFromLine(line);
  return {
    start: start ?? null,
    end: end ?? null,
    delta: delta ?? (start !== null && end !== null ? round(end - start, 4) : null),
  };
};

const parseMoneyLine = (text, label) => {
  const line = text.split('\n').find((item) => item.includes(label));
  if (!line) return null;
  const values = numbersFromLine(line);
  return values.at(-1) ?? null;
};

const parseTrades = (text) => {
  const section = extractSection(text, '取引明細');
  if (!section) return [];

  return section.split('\n').map((line) => {
    const match = line.match(/\b(BUY|SELL)\s+(US\.[A-Z0-9.]+)\s+([0-9,]+)株\s+@\s+\$([0-9,.]+)\s+\(\$([0-9,.]+)\)\s+(\d{4}-\d{2}-\d{2}\s+[\d:.]+)/);
    if (!match) return null;
    return {
      side: match[1],
      symbol: match[2],
      shares: Number(match[3].replaceAll(',', '')),
      priceUsd: numberFrom(match[4]),
      amountUsd: numberFrom(match[5]),
      executedAtEst: match[6],
    };
  }).filter(Boolean);
};

const parseCsvRows = (text) => {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift()?.split(',') || [];
  return lines.map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
};

const loadJsonTrades = async (date) => {
  const jsonPath = path.join(path.dirname(reportsDir), 'trade_history.json');
  let raw;
  try {
    raw = await readFile(jsonPath, 'utf8');
  } catch {
    return [];
  }
  
  const data = JSON.parse(raw);
  const trades = [];
  
  // 1. Closed trades
  const closed = data.closed_trades || [];
  for (const t of closed) {
    if (String(t.sell_time || '').startsWith(date)) {
      const shares = Number(t.qty);
      const priceUsd = Number(t.sell_price);
      trades.push({
        side: 'SELL',
        symbol: t.code,
        shares,
        priceUsd,
        amountUsd: round(shares * priceUsd, 2),
        executedAtEst: t.sell_time,
        remark: 'CLOSED_TRADE_SELL',
      });
    }
    if (String(t.buy_time || '').startsWith(date)) {
      const shares = Number(t.qty);
      const priceUsd = Number(t.buy_price);
      trades.push({
        side: 'BUY',
        symbol: t.code,
        shares,
        priceUsd,
        amountUsd: round(shares * priceUsd, 2),
        executedAtEst: t.buy_time,
        remark: 'CLOSED_TRADE_BUY',
      });
    }
  }
  
  // 2. Open positions
  const openPositions = data.open_positions || {};
  for (const [code, records] of Object.entries(openPositions)) {
    for (const r of records) {
      if (String(r.timestamp || '').startsWith(date)) {
        const shares = Number(r.qty);
        const priceUsd = Number(r.price);
        trades.push({
          side: 'BUY',
          symbol: r.code || code,
          shares,
          priceUsd,
          amountUsd: round(shares * priceUsd, 2),
          executedAtEst: r.timestamp,
          remark: r.remark || 'OPEN_POSITION_BUY',
        });
      }
    }
  }
  
  return trades;
};

const loadCsvTrades = async (date) => {
  const csvPath = path.join(reportsDir, 'jp_account_mix_report.csv');
  let raw;
  try {
    raw = await readFile(csvPath, 'utf8');
  } catch {
    raw = '';
  }

  let trades = [];
  if (raw) {
    trades = parseCsvRows(raw)
      .filter((row) => row.label === '約定履歴')
      .filter((row) => String(row.create_time || '').startsWith(date))
      .filter((row) => numberFrom(row.dealt_qty) > 0)
      .map((row) => {
        const shares = numberFrom(row.dealt_qty);
        const priceUsd = numberFrom(row.dealt_avg_price) || numberFrom(row.price);
        return {
          side: row.trd_side,
          symbol: row.code,
          shares,
          priceUsd,
          amountUsd: round(shares * priceUsd, 2),
          executedAtEst: row.updated_time || row.create_time,
          remark: row.remark || null,
        };
      })
      .filter((trade) => trade.side && trade.symbol && trade.shares && trade.priceUsd);
  }

  if (trades.length === 0) {
    trades = await loadJsonTrades(date);
  }

  return trades;
};

const summarizeTrades = (trades) => {
  const totalBuyUsd = trades
    .filter((trade) => trade.side === 'BUY')
    .reduce((sum, trade) => sum + trade.amountUsd, 0);
  const totalSellUsd = trades
    .filter((trade) => trade.side === 'SELL')
    .reduce((sum, trade) => sum + trade.amountUsd, 0);

  return {
    totalTrades: trades.length,
    totalBuyUsd: round(totalBuyUsd, 2),
    totalSellUsd: round(totalSellUsd, 2),
    cashFlowUsd: round(totalSellUsd - totalBuyUsd, 2),
  };
};

const parsePositions = (text) => {
  const section = extractSection(text, '引け後ポジション');
  if (!section) return [];

  return section.split('\n').map((line) => {
    const match = line.match(/(US\.[A-Z0-9.]+)\s+([0-9,]+)株\s+取得単価=\$([+-]?[0-9,.]+)\s+評価損益=([+-]?[0-9,.]+)%\s+\(\$([+-]?[0-9,.]+)\)/);
    if (!match) return null;
    return {
      symbol: match[1],
      shares: Number(match[2].replaceAll(',', '')),
      averagePriceUsd: numberFrom(match[3]),
      unrealizedPnlPct: numberFrom(match[4]),
      unrealizedPnlUsd: numberFrom(match[5]),
    };
  }).filter(Boolean);
};

const parseSignals = (text) => {
  const lineFor = (label) => text.split('\n').find((line) => line.includes(label));
  return {
    loops: integerFromLine(lineFor('総ループ回数') || lineFor('集計サイクル') || ''),
    buySignals: integerFromLine(lineFor('買いシグナル') || ''),
    sellSignals: integerFromLine(lineFor('売りシグナル') || ''),
    holds: integerFromLine(lineFor('ホールド') || ''),
  };
};

const parseReport = async (filePath, { mergeCsv = false } = {}) => {
  const raw = await readFile(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const date = fileName.match(/^report_(\d{4}-\d{2}-\d{2})\.txt$/)?.[1]
    || raw.match(/実績レポート\s+(\d{4}-\d{2}-\d{2})/)?.[1]
    || raw.match(/詳細取引レポート\s+(\d{4}-\d{2}-\d{2})/)?.[1];
  const generatedAtRaw = raw.match(/生成日時:\s*([0-9:\-\s]+)\s*JST/)?.[1]?.trim() || null;
  const generatedAt = toIsoJst(generatedAtRaw);
  const jpy = parseAssetLine(raw, 'JPY');
  const usd = parseAssetLine(raw, 'USD');
  const totalTrades = integerFromLine(raw.split('\n').find((line) => line.includes('総取引件数')) || '');
  const totalBuyUsd = parseMoneyLine(raw, '買付総額') ?? parseMoneyLine(raw, '買付件数/総額');
  const totalSellUsd = parseMoneyLine(raw, '売却総額') ?? parseMoneyLine(raw, '売却件数/総額');
  const pnlLine = raw.split('\n').find((line) => line.includes('損益(USD資産差分'))
    || raw.split('\n').find((line) => line.includes('損益') && !line.includes('最大利益'));
  const pnlValues = pnlLine ? numbersFromLine(pnlLine) : [];
  const usdPnl = pnlLine?.includes('実現損益')
    ? pnlValues[0] ?? null
    : pnlValues.at(-1) ?? null;
  const cashFlowUsd = parseMoneyLine(raw, '売買キャッシュ差額');
  const totalReturnPct = jpy.end !== null ? ((jpy.end - startCapitalJpy) / startCapitalJpy) * 100 : null;
  const dailyReturnPct = jpy.start && jpy.delta !== null ? (jpy.delta / jpy.start) * 100 : null;
  const reportTrades = parseTrades(raw);
  const csvTrades = mergeCsv && date ? await loadCsvTrades(date) : [];
  const trades = csvTrades.length ? csvTrades : reportTrades;
  const csvSummary = csvTrades.length ? summarizeTrades(csvTrades) : null;

  return {
    date,
    filePath,
    fileName,
    generatedAt,
    generatedAtDisplay: displayTimestamp(generatedAt),
    reportDateDisplay: date ? `${displayDate(date)} EST` : null,
    label: date ? shortDateLabel(date) : null,
    jpy,
    usd,
    summary: {
      totalTrades: csvSummary?.totalTrades ?? totalTrades,
      totalBuyUsd: csvSummary?.totalBuyUsd ?? totalBuyUsd,
      totalSellUsd: csvSummary?.totalSellUsd ?? totalSellUsd,
      usdPnl,
      cashFlowUsd: csvSummary?.cashFlowUsd ?? cashFlowUsd,
      totalPnlJpy: jpy.end !== null ? round(jpy.end - startCapitalJpy, 2) : null,
      totalReturnPct: round(totalReturnPct, 2),
      dailyReturnPct: round(dailyReturnPct, 2),
    },
    trades,
    positions: parsePositions(raw),
    signals: parseSignals(raw),
    sourceReport: csvTrades.length ? `${fileName} + jp_account_mix_report.csv` : fileName,
  };
};

const files = (await readdir(reportsDir))
  .filter((file) => /^report_\d{4}-\d{2}-\d{2}\.txt$/.test(file))
  .map((file) => path.join(reportsDir, file));

const existingTradeCounts = new Map();
try {
  const existingDatasetFiles = (await readdir(path.join(root, 'datasets')))
    .filter((file) => /^performance-\d{4}-\d{2}-\d{2}\.json$/.test(file));
  for (const file of existingDatasetFiles) {
    const dataset = JSON.parse(await readFile(path.join(root, 'datasets', file), 'utf8'));
    if (dataset.latest?.reportDate && Number.isFinite(dataset.latest?.summary?.totalTrades)) {
      existingTradeCounts.set(dataset.latest.reportDate, dataset.latest.summary.totalTrades);
    }
  }
} catch {
  // Existing site datasets are optional when bootstrapping the importer.
}

const reports = (await Promise.all(files.map((file) => parseReport(file))))
  .filter((report) => report.date && report.date >= '2026-01-01')
  .sort((a, b) => a.date.localeCompare(b.date));

const latest = providedReportPath
  ? await parseReport(providedReportPath, { mergeCsv: true })
  : await parseReport(reports.filter((report) => report.jpy.end !== null).at(-1).filePath, { mergeCsv: true });

if (!latest || latest.jpy.end === null) {
  throw new Error('No report with JPY asset data was found.');
}

const history = reports
  .filter((report) => report.jpy.end !== null && report.jpy.end >= minimumChallengeAssetJpy)
  .map((report) => ({
    date: report.date,
    label: report.label,
    jpyStart: report.jpy.start,
    jpyEnd: report.jpy.end,
    jpyDelta: report.jpy.delta,
    totalPnlJpy: round(report.jpy.end - startCapitalJpy, 2),
    totalReturnPct: round(((report.jpy.end - startCapitalJpy) / startCapitalJpy) * 100, 2),
    totalTrades: report.date === latest.date
      ? latest.summary.totalTrades
      : existingTradeCounts.get(report.date) ?? report.summary.totalTrades,
  }));

const dataset = {
  schemaVersion: 1,
  siteName: 'MUKIMUKI trade',
  sourceName: 'Autotrade daily report',
  sourceReport: latest.sourceReport || latest.fileName,
  generatedAt: latest.generatedAt,
  generatedAtDisplay: latest.generatedAtDisplay,
  timezone: {
    reportDate: 'EST',
    generatedAt: 'Asia/Tokyo',
  },
  startCapitalJpy,
  minimumChallengeAssetJpy,
  challengeStartDate: history[0]?.date || null,
  affiliateUrl,
  latest: {
    reportDate: latest.date,
    reportDateDisplay: latest.reportDateDisplay,
    label: latest.label,
    jpy: latest.jpy,
    usd: latest.usd,
    summary: latest.summary,
    trades: latest.trades,
    positions: latest.positions,
    signals: latest.signals,
  },
  history,
  notes: [
    '公開実績は自己運用ログをもとにした記録です。',
    '掲載内容は情報提供を目的としたもので、特定銘柄の売買を推奨するものではありません。',
  ],
};

await mkdir(path.join(root, 'data'), { recursive: true });
await mkdir(path.join(root, 'datasets'), { recursive: true });

const json = `${JSON.stringify(dataset, null, 2)}\n`;
await writeFile(path.join(root, 'data', 'performance.json'), json);
await writeFile(path.join(root, 'datasets', 'performance-latest.json'), json);
await writeFile(path.join(root, 'datasets', `performance-${latest.date}.json`), json);

console.log(`Imported ${latest.sourceReport || latest.fileName} with ${history.length} history points.`);
