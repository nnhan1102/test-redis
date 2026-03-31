const { createApp } = require('./app');
const { port } = require('./config');
const { ensureDatabase, ensureTable } = require('./db/mysql');
const { getRedis } = require('./db/redis');

async function main() {
  await ensureDatabase();
  await ensureTable();
  await getRedis();

  const app = createApp();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
