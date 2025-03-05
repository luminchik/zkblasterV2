require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Client } = require('pg');
const cors = require('cors');
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
    store: new SQLiteStore({ db: 'sessions.db' })
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Добавляем парсер JSON для POST запросов
app.use(express.json());

// Создаем клиент PostgreSQL вместо SQLite подключения
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Подключаемся к БД
client.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
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

// Переписываем функцию rebuildSigmaScoresTable
async function rebuildSigmaScoresTable() {
  try {
    // Получаем информацию о столбцах через information_schema (PostgreSQL аналог PRAGMA)
    const columnsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sigma_scores'
    `);
    
    // Проверяем существование таблицы и столбцов
    if (columnsRes.rows.length === 0) {
      await client.query(`
        CREATE TABLE sigma_scores (
          user_id TEXT PRIMARY KEY,
          sigma_score INTEGER DEFAULT 0,
          last_updated TIMESTAMP DEFAULT NOW()
        )
      `);
    } else {
      // Дополнительные проверки столбцов при необходимости
      const hasSigmaScore = columnsRes.rows.some(row => row.column_name === 'sigma_score');
      if (!hasSigmaScore) {
        await client.query('ALTER TABLE sigma_scores ADD COLUMN sigma_score INTEGER DEFAULT 0');
      }
    }
    
    console.log('Sigma scores table verified/created');
  } catch (err) {
    console.error('Error handling sigma scores table:', err);
  }
}

// Вызовите эту функцию при запуске сервера
rebuildSigmaScoresTable();

// Функция для проверки структуры таблицы
function checkTableStructure() {
  client.query("SELECT * FROM information_schema.columns WHERE table_name = 'sigma_scores'", [], (err, res) => {
    if (err) {
      return;
    }
    
    console.log("Current sigma_scores table structure:", res.rows);
    
    // Проверяем наличие PRIMARY KEY
    client.query("SELECT COUNT(*) as count FROM information_schema.table_constraints WHERE constraint_name = 'sigma_scores_pkey' AND table_name = 'sigma_scores'", [], (err, row) => {
      if (err) {
        return;
      }
      
      if (row.rows[0].count === 0) {
        console.warn("WARNING: sigma_scores table does not have a PRIMARY KEY constraint!");
      } else {
        console.log("sigma_scores table has a PRIMARY KEY constraint.");
      }
    });
  });
}

// Вызовите эту функцию при запуске сервера
checkTableStructure();

// Обновляем API-метод выхода
app.post('/api/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: 'Ошибка при выходе' });
            } else {
                res.clearCookie('connect.sid', { path: '/' });
                res.json({ success: true });
            }
        });
    } else {
        res.clearCookie('connect.sid', { path: '/' });
        res.json({ success: true });
    }
});

// Обработчик API для сохранения результатов
app.post('/api/save-score', (req, res) => {
  // Проверка авторизации
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Необходима авторизация" });
  }
  
  const { score, time, timeFormatted } = req.body;
  const userId = req.user.discord_id;
  const playerName = req.user.username;
  
  // Сначала получаем текущий лучший результат пользователя
  client.query('SELECT best_score, best_time FROM sigma_scores WHERE user_id = $1', [userId], (err, res) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при сохранении" });
    }
    
    // Если у пользователя уже есть результат, сравниваем с текущим
    if (res.rows.length > 0) {
      // Сохраняем только если текущий счет лучше предыдущего
      if (score > res.rows[0].best_score) {
        client.query(
          'UPDATE sigma_scores SET best_score = $1, best_time = $2, time_formatted = $3, player_name = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5',
          [score, time, timeFormatted, playerName, userId],
          function(updateErr) {
            if (updateErr) {
              return res.status(500).json({ error: "Ошибка при сохранении" });
            }
            
            res.json({ success: true, message: "Результат успешно обновлен" });
          }
        );
      } else {
        res.json({ success: true, message: "Текущий результат не превышает лучший" });
      }
    } else {
      // Если это первый результат пользователя
      client.query(
        'INSERT INTO sigma_scores (user_id, best_score, best_time, time_formatted, player_name) VALUES ($1, $2, $3, $4, $5)',
        [userId, score, time, timeFormatted, playerName],
        function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: "Ошибка при сохранении" });
          }
          
          res.json({ success: true, message: "Результат успешно сохранен" });
        }
      );
    }
  });
});

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
fixTimeFormattedInDatabase();

// Добавьте маршрут для получения вопросов через API
app.get('/api/questions', (req, res) => {
    const questions = require('./questions.json');
    // Перемешиваем вопросы на сервере
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    res.json(shuffled);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 