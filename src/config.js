require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  seedFile: process.env.SEED_FILE || './emails_seed_1000.json',
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'benchmark_db'
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined
  },
  mysqlTable: process.env.MYSQL_TABLE || 'emails',
  redisKeyPrefix: process.env.REDIS_KEY_PREFIX || 'email:'
};
