const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Создание таблиц
const initDb = async () => {
  const client = await pool.connect();
  try {
    // Таблица пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        discord_id TEXT UNIQUE,
        display_name TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Таблица результатов
    await client.query(`
      CREATE TABLE IF NOT EXISTS sigma_scores (
        user_id TEXT PRIMARY KEY,
        best_score INTEGER DEFAULT 0,
        best_time REAL DEFAULT 0,
        time_formatted TEXT,
        player_name TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_verified INTEGER DEFAULT 0
      );
    `);
  } finally {
    client.release();
  }
};

initDb().catch(console.error);

module.exports = {
  query: (text, params) => pool.query(text, params)
}; 