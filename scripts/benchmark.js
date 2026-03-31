const { performance } = require('perf_hooks');
const { loadSeedRows } = require('../src/services');
const { getById: mysqlGetById } = require('../src/db/mysql');
const { getById: redisGetById } = require('../src/db/redis');

async function bench(label, getter, ids) {
  const start = performance.now();
  for (const id of ids) {
    await getter(id);
  }
  const total = performance.now() - start;
  return { label, totalMs: Number(total.toFixed(3)), avgMs: Number((total / ids.length).toFixed(6)) };
}

async function main() {
  const rows = await loadSeedRows();
  const ids = rows.map(r => r.id);

  const mysql = await bench('mysql', mysqlGetById, ids);
  const redis = await bench('redis', redisGetById, ids);

  console.log(JSON.stringify({ count: ids.length, mysql, redis, faster: mysql.totalMs < redis.totalMs ? 'mysql' : 'redis' }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
