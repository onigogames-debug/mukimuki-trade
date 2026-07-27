import { stat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const latestJsonPath = path.join(root, 'datasets', 'performance-latest.json');

const getJstDateString = (date) => {
  // Convert date to JST timezone string (YYYY-MM-DD)
  const offset = 9 * 60; // JST offset in minutes
  const localTime = date.getTime();
  const localOffset = date.getTimezoneOffset() * 60000;
  const utc = localTime + localOffset;
  const jst = new Date(utc + (3600000 * 9));
  
  const yyyy = jst.getFullYear();
  const mm = String(jst.getMonth() + 1).padStart(2, '0');
  const dd = String(jst.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getLatestPerformanceDirDate = async () => {
  const performanceDir = path.join(root, 'performance');
  let latestDate = '';
  
  try {
    const years = (await readdir(performanceDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory() && /^\d{4}$/.test(d.name))
      .map((d) => d.name);
      
    for (const year of years) {
      const monthsDir = path.join(performanceDir, year);
      const months = (await readdir(monthsDir, { withFileTypes: true }))
        .filter((d) => d.isDirectory() && /^\d{2}$/.test(d.name))
        .map((d) => d.name);
        
      for (const month of months) {
        const daysDir = path.join(monthsDir, month);
        const days = (await readdir(daysDir, { withFileTypes: true }))
          .filter((d) => d.isDirectory() && /^\d{2}$/.test(d.name))
          .map((d) => d.name);
          
        for (const day of days) {
          const dateStr = `${year}-${month}-${day}`;
          if (dateStr > latestDate) {
            latestDate = dateStr;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to scan performance directory:', err.message);
  }
  
  return latestDate;
};

const diagnose = async () => {
  console.log('=== Starting MUKIMUKI trade Performance Diagnosis ===');
  let hasErrors = false;
  
  // 1. Check performance-latest.json lastModified
  let fileStat;
  try {
    fileStat = await stat(latestJsonPath);
    const mtimeDate = new Date(fileStat.mtime);
    const mtimeStr = getJstDateString(mtimeDate);
    const todayStr = getJstDateString(new Date());
    
    console.log(`[OK] found performance-latest.json (Last modified JST: ${mtimeStr})`);
    
    if (mtimeStr !== todayStr) {
      console.warn(`[WARNING] performance-latest.json was not updated today. (Today: ${todayStr}, File: ${mtimeStr})`);
      // Note: On non-trading days or early morning, this is expected, so it's a warning rather than fatal error.
    }
  } catch (err) {
    console.error('[ERROR] performance-latest.json does not exist at:', latestJsonPath);
    hasErrors = true;
  }
  
  // 2. Compare JSON reportDate and latest directory date
  let jsonDate = '';
  if (fileStat) {
    try {
      const jsonContent = JSON.parse(await readFile(latestJsonPath, 'utf8'));
      jsonDate = jsonContent.latest?.reportDate || '';
      console.log(`[OK] JSON latest report date: ${jsonDate}`);
    } catch (err) {
      console.error('[ERROR] Failed to parse performance-latest.json:', err.message);
      hasErrors = true;
    }
  }
  
  const latestDirDate = await getLatestPerformanceDirDate();
  console.log(`[OK] Latest performance directory date: ${latestDirDate}`);
  
  if (jsonDate && latestDirDate && jsonDate !== latestDirDate) {
    console.error(`[ERROR] Date mismatch detected! JSON latest report date is ${jsonDate}, but the latest generated directory is ${latestDirDate}.`);
    hasErrors = true;
  }
  
  // 3. Final summary & recovery procedures
  console.log('\n=== Diagnosis Summary ===');
  if (hasErrors) {
    console.error('STATUS: FAILED (Errors detected)');
    console.log('\n--- Recovery Procedures ---');
    console.log('1. Ensure that the auto_publish script or import task runs to fetch the latest report:');
    console.log('   Run: ./auto_publish.sh');
    console.log('   Or:  node scripts/import-performance-report.mjs && npm run build');
    console.log('2. Check if the moomoo desktop app / report generation is active and saving reports to the default reports directory:');
    console.log('   Expected path: ../../moomoo/reports/report_YYYY-MM-DD.txt');
    console.log('3. Check if the cron job or GitHub Actions daily-build.yml workflow scheduler is failing.');
    console.log('   Ensure the daily build trigger time matches JST mornings (e.g. 05:30 JST).');
    process.exit(1);
  } else {
    console.log('STATUS: SUCCESS (No errors detected)');
    console.log('performance-latest.json is synchronized with the generated directories.');
  }
};

diagnose();
