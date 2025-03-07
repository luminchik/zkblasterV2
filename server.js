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
const crypto = require('crypto');
const questions = require('./src/questions.json');
const jwt = require('jsonwebtoken');

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

// Обновить конечную точку для сохранения результатов
app.post('/api/update-sigma-score', async (req, res) => {
  try {  
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { score, time, timeFormatted } = req.body;
    
    console.log('Обновление результата:', { 
      userId: req.user.discord_id, 
      score, 
      time, 
      timeFormatted 
    });

    // Сначала проверяем и создаем пользователя, если он не существует
    const userCheckResult = await client.query(
      'SELECT * FROM users WHERE discord_id = $1',
      [req.user.discord_id]
    );
    
    // Если пользователя нет, создаем его
    if (userCheckResult.rows.length === 0) {
      await client.query(
        'INSERT INTO users (discord_id, display_name, avatar) VALUES ($1, $2, $3)',
        [req.user.discord_id, req.user.display_name || 'Гость', req.user.avatar || null]
      );
      console.log('Создан новый пользователь:', req.user.discord_id);
    }

    // Теперь обновляем счет
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
        best_score = CASE WHEN sigma_scores.best_score < $4 OR sigma_scores.best_score IS NULL THEN $4 ELSE sigma_scores.best_score END,
        best_time = CASE 
          WHEN sigma_scores.best_time IS NULL OR sigma_scores.best_time = 0 THEN $5
          WHEN sigma_scores.best_time > $5 THEN $5
          ELSE sigma_scores.best_time 
        END,
        time_formatted = CASE 
          WHEN sigma_scores.best_time IS NULL OR sigma_scores.best_time = 0 THEN $6
          WHEN sigma_scores.best_time > $5 THEN $6
          ELSE sigma_scores.time_formatted 
        END
    `, [
      req.user.discord_id,
      req.user.display_name || 'Гость',
      req.user.avatar || null,
      score,
      time,
      timeFormatted
    ]);
    
    console.log('Результат успешно обновлен');
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления результата:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Обновляем API лидерборда для поддержки обоих форматов
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Получаем параметр формата из запроса
    const useNewFormat = req.query.format === 'new';
    
    // Получаем номер страницы и размер страницы из параметров запроса
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    // Получаем общее количество записей
    const countResult = await client.query('SELECT COUNT(*) FROM sigma_scores');
    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / pageSize);
    
    // Получаем данные для текущей страницы
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
      LIMIT $1 OFFSET $2
    `, [pageSize, skip]);
    
    // Возвращаем результат в нужном формате
    if (useNewFormat) {
      // Новый формат с пагинацией
      res.json({
        data: result.rows,
        pages: totalPages,
        current_page: page,
        total_records: totalRecords
      });
    } else {
      // Старый формат - просто массив результатов
      res.json(result.rows);
    }
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

// Генерация ключа шифрования (хранить в .env)
const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV_LENGTH = 16;

// Шифрование вопросов
function encryptQuestions(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data)), 
    cipher.final()
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Middleware проверки JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, ENCRYPTION_KEY, (err) => {
      if (err) return res.sendStatus(403);
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Эндпоинт для аутентификации
app.post('/api/auth', (req, res) => {
  // Проверка учетных данных...
  const user = { id: 1, name: "Player" };
  const token = jwt.sign(user, ENCRYPTION_KEY, { expiresIn: '1h' });
  
  res.json({ 
    token,
    decryptionKey: ENCRYPTION_KEY.toString('base64')
  });
});

// Эндпоинт для получения вопросов
app.get('/api/questions', authenticateJWT, (req, res) => {
  try {
    const encryptedData = encryptQuestions(questions);
    res.json({ data: encryptedData });
  } catch (error) {
    res.status(500).send('Error processing questions');
  }
});

// ПОСЛЕ всех маршрутов, НО ПЕРЕД app.listen
// Добавляем обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Server error:', err);
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

    // Проверяем существование таблицы sigma_scores
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sigma_scores'
      )
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('Таблица sigma_scores существует, проверяем структуру...');
      
      // Проверяем существование колонки best_score
      const bestScoreExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'sigma_scores' AND column_name = 'best_score'
        )
      `);
      
      if (!bestScoreExists.rows[0].exists) {
        console.log('Добавляем колонку best_score...');
        await client.query(`ALTER TABLE sigma_scores ADD COLUMN best_score INTEGER DEFAULT 0`);
      }

      // Проверяем другие необходимые колонки
      const columnsToCheck = ['best_time', 'time_formatted', 'display_name', 'avatar', 'is_verified'];
      for (const column of columnsToCheck) {
        const columnExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'sigma_scores' AND column_name = $1
          )
        `, [column]);
        
        if (!columnExists.rows[0].exists) {
          console.log(`Добавляем колонку ${column}...`);
          let dataType = 'TEXT';
          let defaultValue = "''";
          
          if (column === 'best_time') {
            dataType = 'FLOAT';
            defaultValue = '0';
          } else if (column === 'is_verified') {
            dataType = 'BOOLEAN';
            defaultValue = 'false';
          }
          
          await client.query(`ALTER TABLE sigma_scores ADD COLUMN ${column} ${dataType} DEFAULT ${defaultValue}`);
        }
      }
    } else {
      // Создаем таблицу с нуля с правильной структурой
      await client.query(`
        CREATE TABLE sigma_scores (
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
    }

    console.log('Database tables verified/created');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

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