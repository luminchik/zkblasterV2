const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем соединение с базой данных
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Создаем таблицы, если они не существуют
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE,
      display_name TEXT,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица результатов Sigma режима
  db.run(`
    CREATE TABLE IF NOT EXISTS sigma_scores (
      user_id TEXT PRIMARY KEY,
      best_score INTEGER DEFAULT 0,
      best_time REAL DEFAULT 0,
      time_formatted TEXT,
      player_name TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_verified INTEGER DEFAULT 0
    )
  `);
});

// Функция для инициализации базы данных
function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS sigma_scores (
        user_id TEXT PRIMARY KEY,
        best_score INTEGER DEFAULT 0,
        best_time REAL DEFAULT 0,
        time_formatted TEXT,
        player_name TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_verified INTEGER DEFAULT 0
      )
    `);
  });
}

// Call this function when the application starts
initializeDatabase();

// Добавим поле is_verified в таблицу sigma_scores, если его еще нет
db.get("SELECT is_verified FROM sigma_scores LIMIT 1", [], (err) => {
  if (err) {
    // Поле не существует, добавляем его
    db.run("ALTER TABLE sigma_scores ADD COLUMN is_verified INTEGER DEFAULT 0");
  }
});

module.exports = db; 