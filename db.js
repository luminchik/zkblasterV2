const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Создаем таблицы при запуске
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sigma_scores (
        user_id TEXT PRIMARY KEY,
        display_name TEXT,
        avatar TEXT,
        best_score INTEGER DEFAULT 0,
        best_time REAL DEFAULT 0,
        time_formatted TEXT DEFAULT '00:00.000',
        is_verified INTEGER DEFAULT 0
      )
    `);
  } finally {
    client.release();
  }
}

initDB().catch(console.error);

module.exports = {
  query: (text, params) => pool.query(text, params)
}; 