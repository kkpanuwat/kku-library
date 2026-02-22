const pg = require("pg");
const { env } = require("../config/env");

function getDatabaseConfig() {
  if (env.DATABASE_URL) return { connectionString: env.DATABASE_URL };
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  };
}

const pool = new pg.Pool({
  ...getDatabaseConfig(),
  max: 10,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withClient };

