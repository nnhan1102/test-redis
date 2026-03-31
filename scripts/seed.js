const { loadSeedRows } = require('../src/services');
const { ensureDatabase, ensureTable, seedMysql } = require('../src/db/mysql');
const { seedRedis, flushRedis } = require('../src/db/redis');

async function main() {
  const rows = await loadSeedRows();
  await ensureDatabase();
  await ensureTable();
  await flushRedis();
  await seedMysql(rows);
  await seedRedis(rows);
  console.log(`Seeded ${rows.length} rows into MySQL and Redis.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
