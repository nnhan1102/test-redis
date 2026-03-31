const mysql = require("mysql2/promise");
const { mysql: mysqlConfig, mysqlTable } = require("../config");

let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\``);
  await conn.end();
}

async function ensureTable() {
  const db = await getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`${mysqlTable}\` (
      id INT PRIMARY KEY,
      email VARCHAR(255) NOT NULL
    )
  `);
}

async function seedMysql(rows) {
  const db = await getPool();
  await db.query(`TRUNCATE TABLE \`${mysqlTable}\``);
  const values = rows.map((r) => [r.id, r.email]);
  if (values.length > 0) {
    await db.query(`INSERT INTO \`${mysqlTable}\` (id, email) VALUES ?`, [
      values,
    ]);
  }
}

async function getById(id) {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT id, email FROM \`${mysqlTable}\` WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function closeMysql() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  ensureDatabase,
  ensureTable,
  seedMysql,
  getById,
  closeMysql,
};
