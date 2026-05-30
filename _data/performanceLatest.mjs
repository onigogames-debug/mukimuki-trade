import { readFile } from 'node:fs/promises';

export default JSON.parse(await readFile(new URL('../datasets/performance-latest.json', import.meta.url), 'utf8'));
