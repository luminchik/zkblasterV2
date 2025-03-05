require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db');  // подключаем нашу базу данных
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Настройка CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5500',
    credentials: true
}));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

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
  db.get("SELECT * FROM users WHERE discord_id = ?", [discordId], (err, row) => {
    if (err) return done(err);
    if (row) {
      db.run("UPDATE users SET display_name = ?, avatar = ? WHERE discord_id = ?", 
        [displayName, avatar, discordId], (err) => {
          if (err) return done(err);
          return done(null, { discord_id: discordId, display_name: displayName, avatar: avatar });
        });
    } else {
      db.run("INSERT INTO users (discord_id, display_name, avatar) VALUES (?, ?, ?)",
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
  db.get("SELECT * FROM users WHERE discord_id = ?", [id], (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false);
    done(err, user);
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
    res.sendFile(path.join(__dirname, 'public/game.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/game.html'));
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
  
  db.get(
    'SELECT best_score, best_time FROM sigma_scores WHERE user_id = ?',
    [req.user.discord_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(row || { best_score: 0, best_time: 0 });
    }
  );
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
  db.get(
    'SELECT * FROM sigma_scores WHERE user_id = ?',
    [req.user.discord_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const currentScore = row ? row.best_score : 0;
      const currentTime = row ? row.best_time : 0;
      
      // Обновляем только если счет больше или если счет равен, но время меньше
      if (!row || score > currentScore || (score === currentScore && (currentTime === 0 || time < currentTime))) {
        const query = row 
          ? 'UPDATE sigma_scores SET best_score = ?, best_time = ?, player_name = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
          : 'INSERT INTO sigma_scores (best_score, best_time, player_name, user_id, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)';
        
        const params = row 
          ? [score, time, req.user.display_name, req.user.discord_id]
          : [score, time, req.user.display_name, req.user.discord_id];
        
        db.run(query, params, function(err) {
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
    }
  );
});

// Обновляем API для получения данных лидерборда с пагинацией
app.get('/api/leaderboard', (req, res) => {
  // Получаем параметры пагинации
  const page = parseInt(req.query.page) || 0; // Страница (начиная с 0)
  const limit = parseInt(req.query.limit) || 10; // Записей на странице
  const offset = page * limit;
  
  // Сначала получаем общее количество записей для пагинации
  db.get('SELECT COUNT(*) as total FROM sigma_scores', [], (err, countRow) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при получении данных" });
    }
    
    const totalRecords = countRow.total;
    
    // Проверяем структуру таблицы sigma_scores
    db.all("PRAGMA table_info(sigma_scores)", [], (err, columns) => {
      if (err) {
        return res.status(500).json({ error: "Ошибка при получении данных" });
      }
      
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
      db.all(query, [limit, offset], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: "Ошибка при получении данных" });
        }
        
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
    res.sendFile(path.join(__dirname, 'public/leaderboard.html'));
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
  db.run(
    "UPDATE sigma_scores SET is_verified = 1 WHERE user_id = ?",
    [playerId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        message: 'Score verified successfully',
        verified: true
      });
    }
  );
});

// Добавляем обработчик ошибок
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' });
});

// Добавляем обработчик для несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Улучшенная функция для пересоздания таблицы с обработкой отсутствующих полей
function rebuildSigmaScoresTable() {
  // Сначала проверяем структуру таблицы, чтобы узнать, есть ли поле time_formatted
  db.all("PRAGMA table_info(sigma_scores)", [], (err, columns) => {
    if (err) {
      return;
    }
    
    // Проверяем, есть ли поле time_formatted
    const hasTimeFormatted = columns.some(column => column.name === 'time_formatted');
    
    // Шаг 1: Сохраняем данные во временную таблицу
    db.serialize(() => {
      // Создаем временную таблицу с добавленным столбцом time_formatted
      db.run(`CREATE TABLE IF NOT EXISTS temp_scores (
        user_id TEXT,
        best_score INTEGER,
        best_time REAL,
        time_formatted TEXT,
        player_name TEXT,
        is_verified INTEGER DEFAULT 0,
        updated_at TIMESTAMP
      )`);
      
      // Копируем данные с защитой от отсутствующих столбцов
      if (hasTimeFormatted) {
        db.run(`INSERT INTO temp_scores 
                SELECT user_id, MAX(best_score) as best_score, best_time, 
                       time_formatted, player_name, is_verified, updated_at 
                FROM sigma_scores 
                GROUP BY user_id`);
      } else {
        // Если поля time_formatted нет, используем NULL
        db.run(`INSERT INTO temp_scores 
                SELECT user_id, MAX(best_score) as best_score, best_time, 
                       NULL as time_formatted, player_name, is_verified, updated_at 
                FROM sigma_scores 
                GROUP BY user_id`);
      }
      
      // Удаляем оригинальную таблицу
      db.run(`DROP TABLE IF EXISTS sigma_scores`);
      
      // Создаем таблицу заново с правильной структурой, включая time_formatted
      db.run(`CREATE TABLE sigma_scores (
        user_id TEXT PRIMARY KEY,
        best_score INTEGER DEFAULT 0,
        best_time REAL DEFAULT 0,
        time_formatted TEXT,
        player_name TEXT,
        is_verified INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Восстанавливаем данные
      db.run(`INSERT INTO sigma_scores SELECT * FROM temp_scores`);
      
      // Удаляем временную таблицу
      db.run(`DROP TABLE IF EXISTS temp_scores`);
      
      // Заполняем поле time_formatted для существующих записей
      if (!hasTimeFormatted) {
        db.run(`
          UPDATE sigma_scores 
          SET time_formatted = 
            CASE 
              WHEN best_time > 0 THEN 
                (CAST(FLOOR(best_time / 60) AS TEXT) || ':' || 
                 CASE WHEN FLOOR(best_time % 60) < 10 THEN '0' ELSE '' END ||
                 CAST(FLOOR(best_time % 60) AS TEXT) || '.' ||
                 SUBSTR('000' || CAST(ROUND((best_time - FLOOR(best_time)) * 1000) AS TEXT), -3, 3))
              ELSE '00:00.000' 
            END
          WHERE time_formatted IS NULL
        `);
      }
    });
  });
}

// Вызовите эту функцию при запуске сервера
rebuildSigmaScoresTable();

// Функция для проверки структуры таблицы
function checkTableStructure() {
  db.get("PRAGMA table_info(sigma_scores)", [], (err, rows) => {
    if (err) {
      return;
    }
    
    console.log("Current sigma_scores table structure:", rows);
    
    // Проверяем наличие PRIMARY KEY
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='sigma_scores' AND sql LIKE '%PRIMARY KEY%'", [], (err, row) => {
      if (err) {
        return;
      }
      
      if (row.count === 0) {
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
  db.get('SELECT best_score, best_time FROM sigma_scores WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при сохранении" });
    }
    
    // Если у пользователя уже есть результат, сравниваем с текущим
    if (row) {
      // Сохраняем только если текущий счет лучше предыдущего
      if (score > row.best_score) {
        db.run(
          'UPDATE sigma_scores SET best_score = ?, best_time = ?, time_formatted = ?, player_name = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
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
      db.run(
        'INSERT INTO sigma_scores (user_id, best_score, best_time, time_formatted, player_name) VALUES (?, ?, ?, ?, ?)',
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
function fixTimeFormattedInDatabase() {
  // Запрос, который обновляет все time_formatted на основе поля best_time
  db.run(`
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
  `, function(err) {
    if (err) {
      // Обработка ошибки при обновлении форматов времени
    }
  });
}

// Вызовите функцию после запуска сервера
fixTimeFormattedInDatabase();

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 