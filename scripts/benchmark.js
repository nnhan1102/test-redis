const { performance } = require("perf_hooks");
const { loadSeedRows } = require("../src/services");
const { getById: mysqlGetById } = require("../src/db/mysql");
const { getById: redisGetById } = require("../src/db/redis");
const { insertOne: mysqlInsert } = require("../src/db/mysql");
const { insertOne: redisInsert } = require("../src/db/redis");
const { flushRedis } = require("../src/db/redis");
const { ensureTable } = require("../src/db/mysql");
const { clearTable } = require("../src/db/mysql");

async function bench(label, getter, ids) {
  const start = performance.now();
  for (const id of ids) {
    await getter(id);
  }
  const total = performance.now() - start;
  return {
    label,
    totalMs: Number(total.toFixed(3)),
    avgMs: Number((total / ids.length).toFixed(6)),
  };
}
async function benchWrite(label, writer, rows) {
  const start = performance.now();

  for (const row of rows) {
    await writer(row);
  }

  const total = performance.now() - start;

  return {
    label,
    totalMs: Number(total.toFixed(3)),
    avgMs: Number((total / rows.length).toFixed(6)),
  };
}

// async function main() {
//   const rows = await loadSeedRows();
//   const ids = rows.map((r) => r.id);

//   const mysql = await bench("mysql", mysqlGetById, ids);
//   const redis = await bench("redis", redisGetById, ids);

//   console.log(
//     JSON.stringify(
//       {
//         count: ids.length,
//         mysql,
//         redis,
//         faster: mysql.totalMs < redis.totalMs ? "mysql" : "redis",
//       },
//       null,
//       2,
//     ),
//   );
// }

async function main() {
  const rows = await loadSeedRows();
  const ids = rows.map((r) => r.id);

  // =====================
  // READ benchmark
  // =====================
  const mysqlRead = await bench("mysql", mysqlGetById, ids);
  const redisRead = await bench("redis", redisGetById, ids);

  // =====================
  // WRITE benchmark
  // =====================
  await clearTable();
  await flushRedis(); // reset Redis
  await ensureTable(); // đảm bảo table tồn tại

  const mysqlWrite = await benchWrite("mysql", mysqlInsert, rows);
  const redisWrite = await benchWrite("redis", redisInsert, rows);

  // =====================
  // RESULT
  // =====================
  console.log(
    JSON.stringify(
      {
        count: rows.length,

        read: {
          mysql: mysqlRead,
          redis: redisRead,
          faster: mysqlRead.totalMs < redisRead.totalMs ? "mysql" : "redis",
        },

        write: {
          mysql: mysqlWrite,
          redis: redisWrite,
          faster: mysqlWrite.totalMs < redisWrite.totalMs ? "mysql" : "redis",
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
