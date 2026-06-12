import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performanceXPostText } from './social-sharing.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://mukimuki-trade.com';
const latestPath = path.join(root, 'datasets', 'performance-latest.json');
const articlesPath = path.join(root, 'data', 'articles.json');
const docsDir = path.join(root, 'docs');
const outputPath = path.join(docsDir, 'x-post-drafts.md');

const latest = JSON.parse(await readFile(latestPath, 'utf8'));
const { articles } = JSON.parse(await readFile(articlesPath, 'utf8'));

const shortSymbol = (symbol) => String(symbol || '').replace(/^US\./, '');
const latestUrl = `${siteUrl}/performance/${latest.latest.reportDate.replaceAll('-', '/')}/`;
const monthlyUrl = `${siteUrl}/performance/${latest.latest.reportDate.slice(0, 7).replace('-', '/')}/`;
const holdings = (latest.latest.positions || []).map((position) => shortSymbol(position.symbol)).filter(Boolean);
const tickerArticle = articles
  .filter((article) => article.categoryKey === 'research')
  .find((article) => holdings.some((ticker) => (article.tickers || article.tags || []).includes(ticker)))
  || articles.find((article) => article.categoryKey === 'research');
const logicArticle = articles.find((article) => article.categoryKey === 'logic');

const drafts = [
  {
    title: '毎朝の日次実績',
    body: `${performanceXPostText({ report: latest, url: latestUrl })}

#MUKIMUKItrade #米国株 #投資記録`,
  },
  {
    title: '保有銘柄の観察',
    body: `${latest.latest.reportDate} の持ち越し確認
${holdings.length ? `保有: ${holdings.join(' / ')}` : '保有: なし'}
評価額と前日比だけでなく、なぜ持ち越したかを翌日以降に見返します。

${latestUrl}

#米国株 #投資記録 #MUKIMUKItrade`,
  },
  {
    title: '月次まとめへの誘導',
    body: `日次の勝ち負けだけでなく、月次で見ると資産推移の癖が見えます。
${latest.latest.reportDate.slice(0, 7)} の実績まとめはこちら。

${monthlyUrl}

#米国株 #100万円チャレンジ #MUKIMUKItrade`,
  },
  {
    title: '銘柄検討ページへの誘導',
    body: tickerArticle
      ? `${tickerArticle.title}
実績に出てきた銘柄は、候補理由と撤退条件も別ページで整理しています。

${siteUrl}${tickerArticle.path}

#米国株 #銘柄検討 #MUKIMUKItrade`
      : '',
  },
  {
    title: 'ロジックページへの誘導',
    body: logicArticle
      ? `${logicArticle.title}
日次実績の数字だけでなく、エントリー・損切り・利確の考え方も残しています。

${siteUrl}${logicArticle.path}

#米国株 #投資ロジック #MUKIMUKItrade`
      : '',
  },
  {
    title: 'moomoo導線',
    body: `PRを含みます。
米国株のニュース、決算、チャート確認に使う入口として、moomoo証券の見方を整理しています。

${siteUrl}/moomoo/

#米国株 #moomoo #MUKIMUKItrade`,
  },
].filter((draft) => draft.body.trim());

const body = `# X Post Drafts

Generated: ${new Date().toISOString()}

MUKIMUKI tradeのX投稿下書きです。自動投稿はせず、毎朝の実績確認後に内容を読んでから投稿します。

${drafts.map((draft, index) => `## ${index + 1}. ${draft.title}

\`\`\`text
${draft.body}
\`\`\``).join('\n\n')}
`;

await mkdir(docsDir, { recursive: true });
await writeFile(outputPath, body);

console.log(`Generated ${drafts.length} X post draft(s): ${path.relative(root, outputPath)}`);
