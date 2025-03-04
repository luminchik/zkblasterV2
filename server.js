require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db');  // подключаем нашу базу данных
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

// Настройка CORS
app.use(cors({
    origin: ['https://zkblaster-production.up.railway.app', 'http://localhost:5501'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
}));

// Настройка статических файлов
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Настройка express-session с PostgresStore
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: false,
        sameSite: 'lax'
    }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Добавляем парсер JSON для POST запросов
app.use(express.json());

// Конфигурация DiscordStrategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify']
},
async function(accessToken, refreshToken, profile, done) {
  try {
    const discordId = profile.id;
    const displayName = profile.username;
    const avatar = profile.avatar || null;

    // Добавим логирование
    console.log('Discord profile:', profile);

    const userResult = await db.query(
      "SELECT * FROM users WHERE discord_id = $1",
      [discordId]
    );

    if (userResult.rows.length > 0) {
      await db.query(
        "UPDATE users SET display_name = $1, avatar = $2 WHERE discord_id = $3",
        [displayName, avatar, discordId]
      );
    } else {
      await db.query(
        "INSERT INTO users (discord_id, display_name, avatar) VALUES ($1, $2, $3)",
        [discordId, displayName, avatar]
      );
    }

    return done(null, { 
      discord_id: discordId, 
      display_name: displayName, 
      avatar: avatar 
    });
  } catch (err) {
    console.error('Discord auth error:', err);
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.discord_id);
});

passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE discord_id = $1", [id], (err, result) => {
    if (err) return done(err);
    if (result.rows.length === 0) return done(null, false);
    done(null, result.rows[0]);
  });
});

// Маршруты для Discord авторизации
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: '/',
    failureFlash: true
  }), 
  (req, res) => {
    // Добавим логирование
    console.log('Auth successful, user:', req.user);
    // Добавим явное указание на успешную аутентификацию
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/');
      }
      res.redirect('/');
    });
  }
);

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
// app.use('/process-image', createProxyMiddleware({ 
//     target: 'http://localhost:8000',
//     changeOrigin: true
// }));

// Маршруты
app.get('/', (req, res) => {
    // Добавим логирование
    console.log('User session:', req.session);
    console.log('User:', req.user);
    res.sendFile(path.join(__dirname, 'game.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
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
    const result = await db.query(
      'SELECT best_score, best_time FROM sigma_scores WHERE user_id = $1',
      [req.user.discord_id]
    );
    res.json(result.rows[0] || { best_score: 0, best_time: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Обновить лучший результат
app.post('/api/update-sigma-score', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  let { score, time, timeFormatted } = req.body;
  
  // Проверим и исправим формат времени, если он некорректный
  if (!timeFormatted || timeFormatted.includes('0.0:')) {
    // Правильное форматирование времени
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time * 1000) % 1000);
    timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${String(milliseconds).padStart(3, '0')}`;
  }
  
  // Проверяем валидность данных
  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Invalid score' });
  }
  
  if (typeof time !== 'number' || time < 0) {
    return res.status(400).json({ error: 'Invalid time' });
  }
  
  // Проверяем, существует ли запись для этого пользователя
  db.query('SELECT * FROM sigma_scores WHERE user_id = $1', [req.user.discord_id], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const currentScore = result.rows.length > 0 ? result.rows[0].best_score : 0;
    const currentTime = result.rows.length > 0 ? result.rows[0].best_time : 0;
    
    // Обновляем только если счет больше или если счет равен, но время меньше
    if (!result.rows.length || score > currentScore || (score === currentScore && (currentTime === 0 || time < currentTime))) {
      const query = result.rows.length > 0 
        ? 'UPDATE sigma_scores SET best_score = $1, best_time = $2, player_name = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4'
        : 'INSERT INTO sigma_scores (best_score, best_time, player_name, user_id, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)';
      
      const params = result.rows.length > 0 
        ? [score, time, req.user.display_name, req.user.discord_id]
        : [score, time, req.user.display_name, req.user.discord_id];
      
      await db.query(query, params, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.json({ 
          success: true, 
          newRecord: true,
          oldScore: currentScore,
          oldTime: currentTime,
          newScore: score,
          newTime: time
        });
      });
    } else {
      res.json({ 
        success: true, 
        newRecord: false,
        currentScore: currentScore,
        currentTime: currentTime
      });
    }
  });
});

// Обновляем API для получения данных лидерборда с пагинацией
app.get('/api/leaderboard', (req, res) => {
  // Получаем параметры пагинации
  const page = parseInt(req.query.page) || 0; // Страница (начиная с 0)
  const limit = parseInt(req.query.limit) || 10; // Записей на странице
  const offset = page * limit;
  
  // Сначала получаем общее количество записей для пагинации
  db.query('SELECT COUNT(*) as total FROM sigma_scores', [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при получении данных" });
    }
    
    const totalRecords = result.rows[0].total;
    
    // Проверяем структуру таблицы sigma_scores
    db.query("PRAGMA table_info(sigma_scores)", [], (err, columnsResult) => {
      if (err) {
        return res.status(500).json({ error: "Ошибка при получении данных" });
      }
      
      const columns = columnsResult.rows;
      
      // Проверяем наличие столбца time_formatted
      const hasTimeFormatted = columns.some(column => column.name === 'time_formatted');
      
      // Формируем SQL-запрос в зависимости от наличия time_formatted
      let query;
      if (hasTimeFormatted) {
        query = `
          SELECT s.user_id, s.best_score, s.best_time, s.time_formatted, s.player_name, s.is_verified,
                 u.avatar, u.display_name
          FROM sigma_scores s
          LEFT JOIN users u ON s.user_id = u.discord_id
          ORDER BY s.best_score DESC
          LIMIT ? OFFSET ?
        `;
      } else {
        query = `
          SELECT s.user_id, s.best_score, s.best_time, NULL as time_formatted, s.player_name, s.is_verified,
                 u.avatar, u.display_name
          FROM sigma_scores s
          LEFT JOIN users u ON s.user_id = u.discord_id
          ORDER BY s.best_score DESC
          LIMIT ? OFFSET ?
        `;
      }
      
      // Выполняем запрос с учетом пагинации
      db.query(query, [limit, offset], (err, rowsResult) => {
        if (err) {
          return res.status(500).json({ error: "Ошибка при получении данных" });
        }
        
        const rows = rowsResult.rows;
        
        // Форматируем данные для отправки клиенту
        const formattedData = rows.map(row => {
          // Формируем URL аватарки Discord
          let avatarUrl = null;
          if (row.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${row.user_id}/${row.avatar}.png?size=128`;
          }
          
          return {
            user_id: row.user_id,
            best_score: row.best_score,
            best_time: row.best_time,
            time_formatted: row.time_formatted || formatTime(row.best_time),
            player_name: row.display_name || row.player_name,
            is_verified: row.is_verified === 1,
            avatar_url: avatarUrl,
            rank: offset + rows.indexOf(row) + 1 // Добавляем ранг игрока
          };
        });
        
        // Возвращаем данные с информацией о пагинации
        res.json({
          leaderboard: formattedData,
          pagination: {
            total: totalRecords, 
            page: page,
            limit: limit,
            pages: Math.ceil(totalRecords / limit)
          }
        });
      });
    });
  });
  
  // Функция для форматирования времени
  function formatTime(timeInSeconds) {
    if (!timeInSeconds) return "00:00.000";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${String(milliseconds).padStart(3, '0')}`;
  }
});

// Маршрут для страницы лидерборда
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
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

// API для верификации счета (упрощенная версия без SP1)
app.post('/api/verify-score', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { score, playerId } = req.body;
  
  if (!score || !playerId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // Логика верификации - в данной реализации просто отмечаем счет как верифицированный
  db.query("UPDATE sigma_scores SET is_verified = 1 WHERE user_id = $1", [playerId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ 
      success: true, 
      message: 'Score verified successfully',
      verified: true
    });
  });
});

// Добавляем обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Добавляем обработчик для несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

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
  db.query('SELECT best_score, best_time FROM sigma_scores WHERE user_id = $1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при сохранении" });
    }
    
    // Если у пользователя уже есть результат, сравниваем с текущим
    if (result.rows.length > 0) {
      // Сохраняем только если текущий счет лучше предыдущего
      if (score > result.rows[0].best_score) {
        db.query('UPDATE sigma_scores SET best_score = $1, best_time = $2, time_formatted = $3, player_name = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5', [score, time, timeFormatted, playerName, userId], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: "Ошибка при сохранении" });
          }
          
          res.json({ success: true, message: "Результат успешно обновлен" });
        });
      } else {
        res.json({ success: true, message: "Текущий результат не превышает лучший" });
      }
    } else {
      // Если это первый результат пользователя
      db.query('INSERT INTO sigma_scores (user_id, best_score, best_time, time_formatted, player_name) VALUES ($1, $2, $3, $4, $5)', [userId, score, time, timeFormatted, playerName], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ error: "Ошибка при сохранении" });
        }
        
        res.json({ success: true, message: "Результат успешно сохранен" });
      });
    }
  });
});

// Добавьте эту функцию в server.js и вызовите ее после запуска сервера
function fixTimeFormattedInDatabase() {
  // Запрос, который обновляет все time_formatted на основе поля best_time
  db.query(`
    UPDATE sigma_scores 
    SET time_formatted = 
      CASE 
        WHEN best_time > 0 THEN 
          (CAST(FLOOR(best_time / 60) AS TEXT) || ':' || 
           CASE WHEN FLOOR(best_time % 60) < 10 THEN '0' ELSE '' END ||
           CAST(FLOOR(best_time % 60) AS TEXT) || '.' ||
           SUBSTR('000' || CAST(FLOOR((best_time - FLOOR(best_time)) * 1000) AS TEXT), -3, 3))
        ELSE '00:00.000' 
      END
  `, (err) => {
    if (err) {
      // Обработка ошибки при обновлении форматов времени
    }
  });
}

// Вызовите функцию после запуска сервера
fixTimeFormattedInDatabase();

// Запуск сервера
const PORT = process.env.PORT || 5501;
app.listen(PORT, () => {
    // console.log(`Server running at http://localhost:${PORT}`);
}); 