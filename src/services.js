const fs = require('fs/promises');
const path = require('path');
const { seedFile } = require('./config');

async function loadSeedRows() {
  const filePath = path.isAbsolute(seedFile) ? seedFile : path.join(process.cwd(), seedFile);
  const raw = await fs.readFile(filePath, 'utf8');
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) {
    throw new Error('Seed file must contain a JSON array');
  }
  return rows;
}

module.exports = { loadSeedRows };
