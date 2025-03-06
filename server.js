require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client } = require('pg');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const app = express();

// Настройка CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5500',
    credentials: true
}));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'src')));

// Настройка express-session с SQLiteStore
app.use(session({
    secret: process.env.SESSION_SECRET || 'quiz-blaster-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
    },
    store: new pgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true
    })
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Добавляем парсер JSON для POST запросов
app.use(express.json());

// Создаем клиент PostgreSQL вместо SQLite подключения
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false,
    ca: process.env.NODE_ENV === 'production' ? fs.readFileSync('/etc/ssl/certs/ca-certificates.crt').toString() : null
  }
});

// Конфигурация DiscordStrategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify']
},
function(accessToken, refreshToken, profile, done) {
  // Правильно формируем URL аватара
  const discordId = profile.id;
  const displayName = profile.username;
  let avatar = null;
  
  // Если у пользователя есть аватар, формируем только ID аватара
  if (profile.avatar) {
    avatar = profile.avatar;
  }
  
  // Сохранение пользователя
  client.query("SELECT * FROM users WHERE discord_id = $1", [discordId], (err, res) => {
    if (err) return done(err);
    if (res.rows.length > 0) {
      client.query("UPDATE users SET display_name = $1, avatar = $2 WHERE discord_id = $3", 
        [displayName, avatar, discordId], (err) => {
          if (err) return done(err);
          return done(null, { discord_id: discordId, display_name: displayName, avatar: avatar });
        });
    } else {
      client.query("INSERT INTO users (discord_id, display_name, avatar) VALUES ($1, $2, $3)",
        [discordId, displayName, avatar], function(err) {
          if (err) return done(err);
          return done(null, { discord_id: discordId, display_name: displayName, avatar: avatar });
        });
    }
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.discord_id);
});

passport.deserializeUser((id, done) => {
  client.query("SELECT * FROM users WHERE discord_id = $1", [id], (err, res) => {
    if (err) return done(err);
    if (res.rows.length === 0) return done(null, false);
    done(err, res.rows[0]);
  });
});

// Маршруты для Discord авторизации
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/');
});

// API для получения данных текущего пользователя
app.get('/api/me', (req, res) => {
  if (req.user) {
    // Формируем полный URL аватара для frontend
    let avatarUrl = null;
    if (req.user.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${req.user.discord_id}/${req.user.avatar}.png?size=128`;
    }
    
    res.json({
      discord_id: req.user.discord_id,
      display_name: req.user.display_name,
      avatar: avatarUrl
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Обновляем обработчик выхода
app.get('/logout', (req, res) => {
    // Уничтожаем сессию
    req.session.destroy((err) => {
        // Очищаем куки
        res.clearCookie('connect.sid', { path: '/' });
        
        // Перенаправляем на главную
        res.redirect('/?logged_out=true');
    });
});

// Добавляем пути для компонентов
// app.use('/components', express.static(path.join(__dirname, 'components')));
// app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Прокси для R-сервера
app.use('/process-image', createProxyMiddleware({ 
    target: 'http://localhost:8000',
    changeOrigin: true
}));

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/game.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/game.html'));
});

app.get('/terminal', (req, res) => {
    res.status(404).send('Not found');
});

app.get('/split', (req, res) => {
    res.status(404).send('Not found');
});

// Получить лучший результат пользователя
app.get('/api/sigma-best-score', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = await client.query(
      'SELECT best_score, best_time, time_formatted FROM sigma_scores WHERE user_id = $1',
      [req.user.discord_id]
    );
    const row = result.rows[0];
    res.json(row || { best_score: 0, best_time: 0, time_formatted: '00:00.000' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Обновить лучший результат
app.post('/api/update-sigma-score', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { score, time, timeFormatted } = req.body;

  try {
    await client.query(`
      INSERT INTO sigma_scores (
        user_id, 
        display_name, 
        avatar, 
        best_score, 
        best_time, 
        time_formatted
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = $2,
        avatar = $3,
        best_score = CASE WHEN sigma_scores.best_score < $4 THEN $4 ELSE sigma_scores.best_score END,
        best_time = CASE 
          WHEN sigma_scores.best_time = 0 THEN $5
          WHEN sigma_scores.best_time > $5 THEN $5
          ELSE sigma_scores.best_time 
        END,
        time_formatted = CASE 
          WHEN sigma_scores.best_time = 0 THEN $6
          WHEN sigma_scores.best_time > $5 THEN $6
          ELSE sigma_scores.time_formatted 
        END
    `, [
      req.user.discord_id,
      req.user.display_name,
      req.user.avatar,
      score,
      time,
      timeFormatted
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Получить лидерборд
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        user_id,
        display_name,
        avatar,
        best_score,
        best_time,
        time_formatted,
        is_verified
      FROM sigma_scores 
      ORDER BY best_score DESC 
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Маршрут для страницы лидерборда
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/leaderboard.html'));
});

// Обработчик для обмена кода на токен
app.post('/auth/discord/token', async (req, res) => {
    try {
        const { code } = req.body;
        
        const params = new URLSearchParams();
        params.append('client_id', process.env.DISCORD_CLIENT_ID);
        params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', `${req.protocol}://${req.get('host')}/auth/discord/callback`);
        
        const response = await axios.post('https://discord.com/api/oauth2/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to exchange code for token' });
    }
});

// Проверка статуса авторизации
app.get('/api/auth/status', (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        discord_id: req.user.discord_id,
        username: req.user.display_name,
        display_name: req.user.display_name,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// API для получения конфигурации Discord OAuth
app.get('/api/discord-config', (req, res) => {
  res.json({
    clientId: process.env.DISCORD_CLIENT_ID,
    redirectUri: `${req.protocol}://${req.get('host')}/auth/discord/callback`,
    scope: 'identify'
  });
});

// Обновим верификацию счета
app.post('/api/verify-score', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { score, playerId } = req.body;
  
  if (!score || !playerId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    await client.query(
      'UPDATE sigma_scores SET is_verified = 1 WHERE user_id = $1',
      [playerId]
    );
    
    res.json({ 
      success: true, 
      message: 'Score verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Добавляем обработчик ошибок
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
});

// Добавляем обработчик для несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Убрать старую функцию rebuildSigmaScoresTable и заменить на:

async function initDatabase() {
  try {
    // Создаем таблицу users если не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        discord_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Полная инициализация таблицы sigma_scores
    await client.query(`
      CREATE TABLE IF NOT EXISTS sigma_scores (
        user_id TEXT PRIMARY KEY REFERENCES users(discord_id),
        sigma_score INTEGER DEFAULT 0,
        best_score INTEGER DEFAULT 0,
        best_time FLOAT DEFAULT 0,
        time_formatted TEXT DEFAULT '00:00.000',
        is_verified BOOLEAN DEFAULT false,
        last_updated TIMESTAMP DEFAULT NOW(),
        display_name TEXT,
        avatar TEXT
      )
    `);

    console.log('Database tables verified/created');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

// Переместить определение маршрута перед startServer()
app.get('/api/questions', (req, res) => {
  try {
    // Хардкодим вопросы прямо в коде сервера
    const questions = [
      {
        "question": "What is the Succinct Prover Network?",
        "answers": [
            "ZK proof system",
            "Blockchain",
            "Smart contract", 
            "Oracle"
        ],
        "correct": 0
      },
      // Скопируйте сюда все вопросы из questions.json
      // ...
    ];
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    res.json(shuffled);
  } catch (error) {
    console.error('Error handling questions:', error);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

// Обновленная функция startServer
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    await initDatabase();

    const PORT = process.env.PORT || 8080;
    const HOST = '0.0.0.0';
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const newPort = PORT + 1;
        console.log(`Port ${PORT} is busy, trying ${newPort}...`);
        app.listen(newPort, HOST, () => {
          console.log(`Server running on port ${newPort}`);
        });
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Убрать все вызовы функций кроме:
startServer();

// Добавьте эту функцию в server.js и вызовите ее после запуска сервера
async function fixTimeFormattedInDatabase() {
  try {
    await client.query(`
      UPDATE sigma_scores 
      SET time_formatted = 
        CASE 
          WHEN best_time > 0 THEN 
            CONCAT(
              FLOOR(best_time / 60)::text, 
              ':',
              LPAD(FLOOR(best_time % 60)::text, 2, '0'),
              '.',
              LPAD(FLOOR((best_time - FLOOR(best_time)) * 1000)::text, 3, '0')
            )
          ELSE '00:00.000' 
        END
      WHERE time_formatted IS NULL OR time_formatted = ''
    `);
  } catch (error) {
    console.error('Error updating time_formatted:', error);
  }
}

// Вызовите функцию после запуска сервера
// fixTimeFormattedInDatabase(); 