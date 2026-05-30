import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const isDirectory = async (targetPath) => {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch {
    return false;
  }
};

const isFile = async (targetPath) => {
  try {
    return (await stat(targetPath)).isFile();
  } catch {
    return false;
  }
};

export const findLatestPerformanceDate = async ({ rootDir = root } = {}) => {
  const performanceDir = path.join(rootDir, 'performance');
  const years = (await readdir(performanceDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const dates = [];
  for (const year of years) {
    const yearDir = path.join(performanceDir, year);
    const months = (await readdir(yearDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && /^\d{2}$/.test(entry.name))
      .map((entry) => entry.name)
      .sort();

    for (const month of months) {
      const monthDir = path.join(yearDir, month);
      const days = (await readdir(monthDir, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory() && /^\d{2}$/.test(entry.name))
        .map((entry) => entry.name)
        .sort();

      for (const day of days) {
        if (await isFile(path.join(monthDir, day, 'index.html'))) dates.push(`${year}-${month}-${day}`);
      }
    }
  }

  if (!dates.length) throw new Error('No /performance/YYYY/MM/DD/ pages found.');
  return dates.sort().at(-1);
};

export const performanceDateUrl = (date, { siteUrl = 'https://mukimuki-trade.com' } = {}) => {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) throw new Error(`Invalid performance date: ${date}`);
  return `${siteUrl.replace(/\/$/, '')}/performance/${year}/${month}/${day}/`;
};

export const findLatestPerformanceUrl = async (options = {}) => (
  performanceDateUrl(await findLatestPerformanceDate(options), options)
);

if (import.meta.url === `file://${process.argv[1]}`) {
  const latestUrl = await findLatestPerformanceUrl();
  console.log(latestUrl);
}
