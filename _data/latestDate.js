const fs = require('node:fs');
const path = require('node:path');

const siteUrl = 'https://mukimuki-trade.com';

const isDir = (value) => {
  try {
    return fs.statSync(value).isDirectory();
  } catch {
    return false;
  }
};

const findLatestPerformanceDate = (performanceRoot = path.join(__dirname, '..', 'performance')) => {
  const candidates = [];

  for (const year of fs.readdirSync(performanceRoot)) {
    if (!/^\d{4}$/.test(year)) continue;
    const yearDir = path.join(performanceRoot, year);
    if (!isDir(yearDir)) continue;

    for (const month of fs.readdirSync(yearDir)) {
      if (!/^\d{2}$/.test(month)) continue;
      const monthDir = path.join(yearDir, month);
      if (!isDir(monthDir)) continue;

      for (const day of fs.readdirSync(monthDir)) {
        if (!/^\d{2}$/.test(day)) continue;
        const dayDir = path.join(monthDir, day);
        if (!isDir(dayDir) || !fs.existsSync(path.join(dayDir, 'index.html'))) continue;
        candidates.push({ year, month, day, date: `${year}-${month}-${day}` });
      }
    }
  }

  candidates.sort((a, b) => b.date.localeCompare(a.date));
  const latest = candidates[0];
  if (!latest) {
    throw new Error(`No /performance/YYYY/MM/DD/index.html page found under ${performanceRoot}`);
  }

  const pathname = `/performance/${latest.year}/${latest.month}/${latest.day}/`;
  return {
    ...latest,
    path: pathname,
    url: `${siteUrl}${pathname}`,
  };
};

module.exports = () => findLatestPerformanceDate();
module.exports.findLatestPerformanceDate = findLatestPerformanceDate;
