const { createClient } = require('redis');
const { redis: redisConfig, redisKeyPrefix } = require('../config');

let client;

async function getRedis() {
  if (!client) {
    client = createClient({
      socket: { host: redisConfig.host, port: redisConfig.port },
      password: redisConfig.password || undefined,
    });
    client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
    await client.connect();
  }
  return client;
}

async function seedRedis(rows) {
  const redis = await getRedis();
  const pipeline = redis.multi();
  for (const row of rows) {
    pipeline.set(`${redisKeyPrefix}${row.id}`, JSON.stringify(row));
  }
  await pipeline.exec();
}

async function getById(id) {
  const redis = await getRedis();
  const value = await redis.get(`${redisKeyPrefix}${id}`);
  return value ? JSON.parse(value) : null;
}

async function flushRedis() {
  const redis = await getRedis();
  await redis.flushDb();
}

async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
}

module.exports = {
  getRedis,
  seedRedis,
  getById,
  flushRedis,
  closeRedis,
};
