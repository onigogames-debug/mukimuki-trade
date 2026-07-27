const fs = require('node:fs');
const path = require('node:path');

try {
  module.exports = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../datasets/performance-latest.json'), 'utf8')
  );
} catch (err) {
  console.error('Failed to read performance-latest.json:', err.message);
  module.exports = null;
}
