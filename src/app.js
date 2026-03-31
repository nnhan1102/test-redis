const express = require("express");
const { loadSeedRows } = require("./services");
const {
  ensureDatabase,
  ensureTable,
  seedMysql,
  getById: mysqlGetById,
} = require("./db/mysql");
const { seedRedis, getById: redisGetById, flushRedis } = require("./db/redis");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true });
});

router.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
router.post("/seed", async (req, res, next) => {
  try {
    const rows = await loadSeedRows();
    await ensureDatabase();
    await ensureTable();
    await flushRedis();
    await seedMysql(rows);
    await seedRedis(rows);
    res.json({ ok: true, count: rows.length });
  } catch (err) {
    next(err);
  }
});

router.get("/email/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const source = (req.query.source || "mysql").toLowerCase();
    const data =
      source === "redis" ? await redisGetById(id) : await mysqlGetById(id);
    res.json({ source, data });
  } catch (err) {
    next(err);
  }
});

router.get("/benchmark", async (req, res, next) => {
  try {
    const { performance } = require("perf_hooks");
    const { loadSeedRows } = require("./services");
    const rows = await loadSeedRows();
    const ids = rows.map((r) => r.id);

    const mysqlStart = performance.now();
    for (const id of ids) {
      await mysqlGetById(id);
    }
    const mysqlTime = performance.now() - mysqlStart;

    const redisStart = performance.now();
    for (const id of ids) {
      await redisGetById(id);
    }
    const redisTime = performance.now() - redisStart;

    res.json({
      count: ids.length,
      mysqlTimeMs: Number(mysqlTime.toFixed(3)),
      redisTimeMs: Number(redisTime.toFixed(3)),
      faster: mysqlTime < redisTime ? "mysql" : "redis",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/benchmark-write", async (req, res, next) => {
  try {
    const { performance } = require("perf_hooks");
    const { loadSeedRows } = require("./services");

    const { insertOne: mysqlInsert } = require("./db/mysql");
    const { insertOne: redisInsert, flushRedis } = require("./db/redis");

    const rows = await loadSeedRows();

    // Reset dữ liệu
    await flushRedis();

    // ⚡ MySQL WRITE
    const mysqlStart = performance.now();

    for (const row of rows) {
      await mysqlInsert(row);
    }

    const mysqlTime = performance.now() - mysqlStart;

    // ⚡ Redis WRITE
    const redisStart = performance.now();

    for (const row of rows) {
      await redisInsert(row);
    }

    const redisTime = performance.now() - redisStart;

    res.json({
      count: rows.length,
      mysqlWriteMs: Number(mysqlTime.toFixed(3)),
      redisWriteMs: Number(redisTime.toFixed(3)),
      faster: mysqlTime < redisTime ? "mysql" : "redis",
    });
  } catch (err) {
    next(err);
  }
});

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(router);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  });

  return app;
}

module.exports = { createApp };
