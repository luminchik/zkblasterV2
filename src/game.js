class Quiz {
    constructor() {
      this.questions = [];
      this.currentQuestion = 0;
      this.score = 0;
      this.loaded = false;
      this.questionsHistory = [];
      this.lives = 10;
      
      // Настройки кэша
      this.cacheKey = 'quiz_questions_cache';
      this.cacheExpiryTime = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
      
      this.loadQuestions();
    }
  
    loadQuestions() {
      // Проверяем кэш перед загрузкой с сервера
      const cachedData = this.getQuestionsFromCache();
      
      if (cachedData) {
        this.questions = this.shuffleQuestions(cachedData);
        this.loaded = true;
        
        // Предзагрузка изображений для первых нескольких вопросов
        this.preloadImagesForNextQuestions(5);
        
        if (typeof this.onQuestionsLoaded === 'function') {
          this.onQuestionsLoaded();
        }
        
        // Обновляем кэш в фоновом режиме
        this.refreshQuestionsCache();
      } else {
        // Если кэша нет, загружаем с сервера
        this.loadQuestionsFromServer();
      }
    }
  
    loadQuestionsFromServer() {
      $.ajax({
        url: 'questions.json',
        dataType: 'json',
        success: (data) => {
          this.questions = this.shuffleQuestions(data);
          this.loaded = true;
          
          // Сохраняем вопросы в кэш
          this.saveQuestionsToCache(data);
          
          // Предзагрузка изображений для первых нескольких вопросов
          this.preloadImagesForNextQuestions(5);
          
          if (typeof this.onQuestionsLoaded === 'function') {
            this.onQuestionsLoaded();
          }
        },
        error: (xhr, status, error) => {
          console.error('Ошибка загрузки вопросов:', error);
          this.questions = this.shuffleQuestions(this.getDefaultQuestions());
          this.loaded = true;
          
          if (typeof this.onQuestionsLoaded === 'function') {
            this.onQuestionsLoaded();
          }
        }
      });
    }
    
    // Метод для перемешивания вопросов
    shuffleQuestions(questions) {
      const shuffled = [...questions];
      // Алгоритм Фишера-Йейтса для перемешивания массива
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Ограничиваем количество вопросов до 10 для одной игры
      return shuffled.slice(0, 10);
    }
  
    refreshQuestionsCache() {
      // Фоновое обновление кэша без блокировки интерфейса
      $.ajax({
        url: 'questions.json',
        dataType: 'json',
        success: (data) => {
          // Обновляем кэш новыми данными
          this.saveQuestionsToCache(data);
        },
        error: (xhr, status, error) => {
          console.error('Ошибка обновления кэша вопросов:', error);
        }
      });
    }
  
    saveQuestionsToCache(questions) {
      try {
        const cacheData = {
          timestamp: Date.now(),
          questions: questions
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Ошибка при сохранении кэша вопросов:', e);
      }
    }
  
    getQuestionsFromCache() {
      try {
        const cachedData = localStorage.getItem(this.cacheKey);
        
        if (!cachedData) {
          return null;
        }
        
        const cache = JSON.parse(cachedData);
        const now = Date.now();
        
        // Проверяем актуальность кэша
        if (now - cache.timestamp > this.cacheExpiryTime) {
          return null;
        }
        
        return cache.questions;
      } catch (e) {
        console.error('Ошибка при получении кэша вопросов:', e);
        return null;
      }
    }
  
    preloadImagesForNextQuestions(count) {
      // Предзагружаем изображения для следующих нескольких вопросов
      const startIndex = this.currentQuestion;
      const endIndex = Math.min(startIndex + count, this.questions.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const question = this.questions[i];
        
        if (!question || !question.answers) continue;
        
        // Проверяем, являются ли ответы объектами с URL
        const hasImageAnswers = typeof question.answers[0] === 'object' && 
                               question.answers[0].url !== undefined;
        
        if (hasImageAnswers) {
          // Предзагружаем изображения для вопросов с картинками
          question.answers.forEach(answer => {
            if (answer.url) {
              const img = new Image();
              img.src = answer.url;
            }
          });
        }
      }
    }
  
    getDefaultQuestions() {
      // Резервные вопросы на случай ошибки загрузки
      return [
        {
          question: "Name the planet known as the 'Red Planet':",
          answers: ["Mars", "Venus", "Jupiter", "Saturn"],
          correct: 0
        },
        {
          question: "How many planets are in our solar system?",
          answers: ["8", "9", "7", "10"],
          correct: 0
        }
      ];
    }
  
    isLoaded() {
      return this.loaded;
    }
  
    getCurrentQuestion() {
      const question = this.questions[this.currentQuestion];
      
      // Если ответы - просто массив строк, конвертируем их в старый формат
      if (question && !question.type && Array.isArray(question.answers) && typeof question.answers[0] === 'string') {
        question.type = 'text';
      }
      
      return question;
    }
  
    checkAnswer(answerIndex) {
      const correct =
        this.questions[this.currentQuestion].correct === answerIndex;
      this.score += correct ? 10 : -5;
      this.currentQuestion++;
      return correct;
    }
  
    isGameOver() {
      return this.currentQuestion >= Math.min(10, this.questions.length) || this.lives <= 0;
    }
  
    decreaseLives() {
      this.lives--;
      return this.lives;
    }
}
  
  class Trail {
    constructor(options) {
      this.x = options.x;
      this.y = options.y;
      this.width = 12;
      this.height = 10;
      this.moveSpeed = getRandom(5, 10);
      this.shrinkSpeed = getRandom(0.1, 0.2);
      this.fadeSpeed = 0.05;
      this.opacity = 1;
      this.el = this.createElement(options.parentContainer);
    }
  
    createElement(parentContainer) {
      const el = $("<div class='trail-point'></div>");
      parentContainer.append(el);
      return el;
    }
  
    update() {
      this.el.css({
        left: this.x,
        top: this.y,
        opacity: this.opacity,
        width: this.width,
        height: this.height
      });
      this.x -= this.moveSpeed;
      this.opacity -= this.fadeSpeed;
      this.width -= this.shrinkSpeed;
      this.height -= this.shrinkSpeed;
  
      if (this.width <= 0 || this.opacity <= 0) {
        this.el.remove();
        this.delete = true;
      }
    }
  }
  
  class Bullet {
    constructor(options) {
      this.x = options.x;
      this.y = options.y;
      this.speed = 20;
      this.width = 25;
      this.height = 15;
      this.dir = options.dir;
      this.game = options.game;
      this.el = this.createElement(options.parentContainer);
      options.startUpdating(this.update.bind(this));
      this.lifetime = 0;
      this.maxLifetime = 300;
    }
  
    createElement(parentContainer) {
      const el = $("<div class='bullet'></div>");
      parentContainer.append(el);
      el.css({
        left: this.x,
        top: this.y,
        width: this.width,
        height: this.height,
        transform: `translateX(-50%) translateY(-50%) rotate(${this.dir}rad)`
      });
      this.createFlash(parentContainer);
      return el;
    }
  
    createFlash(parentContainer) {
      const el = $("<div class='flash'></div>");
      el.css({
        position: "absolute",
        top: this.y,
        left: this.x,
        borderRadius: "50%",
        width: 35,
        height: 35,
        background: "#FFFED1",
        transform: "translate(-50%, -50%)"
      });
      parentContainer.append(el);
      setTimeout(() => el.remove(), 5);
    }
  
    update() {
      this.x += Math.cos(this.dir) * this.speed;
      this.y += Math.sin(this.dir) * this.speed;
      this.el.css({
        left: this.x,
        top: this.y,
        transform: `translateY(-50%) rotate(${this.dir}rad)`
      });
  
      this.lifetime++;
      
      if (this.lifetime > this.maxLifetime || 
          this.x < -100 || this.x > window.innerWidth + 100 || 
          this.y < -100 || this.y > window.innerHeight + 100) {
        this.el.remove();
        return;
      }
  
      this.checkCollision();
    }
  
    checkCollision() {
      $(".answer").each((index, answer) => {
        const answerIndex = parseInt($(answer).attr('data-index'));
        const rect = answer.getBoundingClientRect();
        if (
          this.x >= rect.left &&
          this.x <= rect.right &&
          this.y >= rect.top &&
          this.y <= rect.bottom
        ) {
          this.game.checkAnswer(answerIndex, { x: this.x, y: this.y });
          this.el.remove();
          return false;
        }
      });
    }
  }
  
  class Player {
    constructor(options) {
      this.controls = options.controls;
      this.startUpdating = options.startUpdating;
      this.parentContainer = options.parentContainer;
      this.game = options.game;
      this.x = 150;
      this.y = window.innerHeight / 2;
      this.width = 100;
      this.height = 100;
      this.mouthHeight = 2;
      this.mouthShrinkSpeed = 2;
      this.xvel = 0;
      this.yvel = 0;
      this.friction = 0.81;
      this.speed = 5.0;
      this.rotation = 0;
      this.trail = [];
      this.trailTimer = 0;
      this.trailSpawnRate = 4;
      this.shootDown = false;
      this.el = this.createElement(options.parentContainer);
      this.startUpdating(this.update.bind(this));
    }
  
    createElement(parentContainer) {
      const el = $(`
              <div class='player'>
                  <img src="src/assets/rocket4.gif" alt="Rocket Ship">
              </div>
          `);
      parentContainer.append(el);
      el.css({
        left: this.x,
        top: this.y,
        width: this.width,
        height: this.height
      });
      return el;
    }
  
    update() {
      // Получаем состояние клавиш от game.controls, а не от this.controls
      const up = this.game.controls.isUp;
      const down = this.game.controls.isDown;
      const left = this.game.controls.isLeft;
      const right = this.game.controls.isRight;
      const shooting = this.game.controls.isShooting;
  
      // Уменьшаем ускорение для более плавного движения
      const accel = 2.0;
  
      if (up) this.yvel -= accel;
      if (down) this.yvel += accel;
      if (left) this.xvel -= accel;
      if (right) this.xvel += accel;
  
      // Ограничиваем максимальную скорость для предотвращения слишком быстрого движения
      const maxSpeed = 10;
      this.xvel = Math.max(Math.min(this.xvel, maxSpeed), -maxSpeed);
      this.yvel = Math.max(Math.min(this.yvel, maxSpeed), -maxSpeed);
  
      this.xvel *= this.friction;
      this.yvel *= this.friction;
  
      this.x += this.xvel;
      this.y += this.yvel;
  
      // Ограничения границ экрана
      if (this.y < 0) this.y = 0;
      if (this.x < 0) this.x = 0;
      if (this.y > window.innerHeight) this.y = window.innerHeight;
      if (this.x > window.innerWidth) this.x = window.innerWidth;
  
      this.el.css({
        left: this.x,
        top: this.y
      });
  
      if (shooting && !this.shootDown) {
        this.shoot();
        this.shootDown = true;
      }
      if (!this.game.controls.isShooting) this.shootDown = false;
  
      if (this.mouthHeight > 2) this.mouthHeight -= this.mouthShrinkSpeed;
      else this.mouthHeight = 2;
  
      this.handleTrail();
      this.setValues();
    }
  
    handleTrail() {
      this.trailTimer++;
      if (this.trailTimer >= this.trailSpawnRate) {
        this.trailTimer = 0;
        if (this.trail.length < 20) {
        this.trail.push(
          new Trail({
              x: this.x - 50,
              y: this.y,
              parentContainer: this.parentContainer
            })
          );
        }
      }
      this.trail = this.trail.filter((trail) => !trail.delete);
      this.trail.forEach((trail) => trail.update());
    }
  
    shoot() {
      const position = {
        x: this.x + Math.cos(this.rotation) * (this.width / 2),
        y: this.y + Math.sin(this.rotation) * (this.height / 2)
      };
      new Bullet({
        parentContainer: this.parentContainer,
        dir: this.rotation,
        x: position.x,
        y: position.y,
        startUpdating: this.startUpdating.bind(this),
        game: this.game
      });
      
      // Play shooting sound
      if (this.game.shootSound) {
        this.game.shootSound.currentTime = 0;
        this.game.shootSound.play().catch(e => ("Error playing shoot sound:", e));
      }
      
      this.xvel -= Math.cos(this.rotation) * 3;
      this.yvel -= Math.sin(this.rotation) * 3;
      this.mouthHeight = 12;
      const bullets = $(".bullet");
      if (bullets.length > 15) {
        bullets.slice(0, bullets.length - 15).remove();
      }
    }
  
    setValues() {
      this.el.css({
        left: this.x,
        top: this.y,
        transform: `translateX(-50%) translateY(-50%) rotate(${this.rotation}rad)`
      });
    }
  }
  
  class Controls {
    constructor() {
      this.right = { isDown: false, keyCode: 39 };
      this.down = { isDown: false, keyCode: 40 };
      this.left = { isDown: false, keyCode: 37 };
      this.up = { isDown: false, keyCode: 38 };
      this.space = { isDown: false, keyCode: 32 };
  
      $(window).on("keydown", (e) => this.toggle(e.which, true));
      $(window).on("keyup", (e) => this.toggle(e.which, false));
    }
  
    toggle(keyCode, isDown) {
      const keys = ["left", "down", "right", "up", "space"];
      const key = keys.find((k) => this[k].keyCode === keyCode);
      if (key) this[key].isDown = isDown;
    }
  }
  
  class Game {
    constructor(options = {}) {
      this.updateFuncs = [];
      this.container = $("#game-container");
      this.controls = new Controls();
      this.quiz = new Quiz();
      this.timeLeft = 20;
      this.canAnswer = true;
      this.activeEffects = [];
      this.maxBullets = 20;
      this.maxTrailPoints = 50;
      this.lastPerformanceCheck = Date.now();
      this.performanceCheckInterval = 5000;
  
      // Добавим инициализацию controls при создании игры
      this.controls = {
        isUp: false,
        isDown: false,
        isLeft: false,
        isRight: false,
        isShooting: false
      };
  
      // Load background and planets during intro screen
      this.createSpaceBackground();
      
      // Если вопросы уже загружены, показываем вступительный экран
      if (this.quiz.isLoaded()) {
        this.showIntroScreen();
      } else {
        // Иначе, ждем загрузки
        this.quiz.onQuestionsLoaded = () => {
          this.showIntroScreen();
        };
      }
  
      // Добавляем обработчик клавиш для более отзывчивого управления
      this.setupKeyboardControls();
  
      // Запускаем игровой цикл сразу
      this.update = this.update.bind(this);
      window.requestAnimationFrame(this.update);
  
      this.playerAddress = null;
      this.web3Connected = false;
      
      // Инициализировать интерфейс Web3
      this.initWeb3();
  
      // Инициализация аудио элементов
      this.backgroundMusic = document.getElementById("backgroundMusic");
      this.shootSound = document.getElementById("shootSound");
      this.correctSound = document.getElementById("correctSound"); 
      this.wrongSound = document.getElementById("wrongSound");
      this.timeupSound = document.getElementById("timeupSound");
  
      this.gameStartTime = 0; // Время начала игры
      this.gameEndTime = 0;   // Время завершения игры
      this.gameTime = 0;      // Общее время игры в секундах
  
      // Добавляем проверку авторизации при создании игры
      $.ajax({
        url: '/api/auth/status',
        method: 'GET',
        async: false, // Синхронный запрос для блокировки инициализации
        success: (data) => {
          if (!data.authenticated) {
            throw new Error("Authentication required to play");
          }
        },
        error: () => {
          throw new Error("Authentication check failed");
        }
      });
    }
  
    async initWeb3() {
      // Проверяем доступность провайдера Web3 (например, MetaMask)
      if (typeof window.ethereum !== 'undefined') {
        $("#connect-wallet").on("click", async () => {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.playerAddress = accounts[0];
            this.web3Connected = true;
            
            // Обновляем UI
            $("#wallet-status").text(`Connected: ${this.playerAddress.substring(0, 6)}...${this.playerAddress.substring(38)}`);
            $("#connect-wallet").text("Connected");
          } catch (error) {
            console.error("Failed to connect wallet:", error);
          }
        });
      } else {
        $("#connect-wallet").text("Install MetaMask");
        $("#connect-wallet").prop("disabled", true);
      }
    }
  
    showIntroScreen() {
      const introContainer = $("#intro-container");
      const introImage = $("#intro-image");
  
      // Добавим стиль для кнопки, которая должна быть всегда видимой
      $('<style>')
        .prop('type', 'text/css')
        .html(`
          /* Кнопка логина всегда должна быть видимой для неавторизованных пользователей */
          #discord-login.must-show {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            z-index: 100000 !important;
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            box-shadow: 0 0 20px rgba(88, 101, 242, 0.8) !important;
          }
        `)
        .appendTo('head');
  
      // Add a click event to check auth and start the game
      introImage.on("click", () => {
        // Проверяем, авторизован ли пользователь
        $.ajax({
          url: '/api/auth/status',
          method: 'GET',
          success: (data) => {
            if (data.authenticated) {
              // Пользователь авторизован - начинаем игру
        introContainer.fadeOut(500, () => {
          this.startGame();
              });
            } else {
              // Пользователь не авторизован - показываем сообщение
              this.showMessage('Login with Discord to play the game', 'warning');
              
              // Всегда обновляем фиксированную кнопку логина
              createFixedLoginButton();
            }
          },
          error: () => {
            this.showMessage('Server error. Please try again later.', 'error');
          }
        });
      });
    }
  
    startGame() {
      // Проверяем авторизацию перед запуском игры
      if (!isAuthenticated) {
        console.error("Attempted to start game without authentication");
        
        // Показываем сообщение об авторизации
        if (typeof showAuthRequiredMessage === 'function') {
          showAuthRequiredMessage();
        }
        
        // Возвращаемся, не запуская игру
        return;
      }
      
      this.gameStartTime = Date.now();
      this.gameActive = true;
      
      // Создаем специальный интервал для отслеживания времени игры
      this.gameTimerInterval = setInterval(() => {
        if (this.gameActive) {
          // Обновляем текущее время игры только если игра активна
          const currentTime = Date.now();
          this.gameTime = (currentTime - this.gameStartTime) / 1000;
        }
      }, 100); // Обновляем каждые 100мс для более точного отсчета времени
      
      this.player = new Player({
        parentContainer: this.container,
        controls: this.controls,
        game: this,
        startUpdating: this.startUpdating.bind(this)
      });
  
      // Show the game interface after the intro
      this.displayScore();
      this.displayQuestionCount();
      this.displayLives();
      
      // Добавим явный вызов таймера уже при старте игры
      this.displayTimer();
      this.startTimer();
      
      this.displayQuestion();
      this.update();
      
      // Добавляем класс, указывающий на активную игру
      $('#game-container').addClass('game-active');
      
      // Скрываем информацию о пользователе
      this.hideUserInfo();
    }
  
    createSpaceBackground() {
      this.spaceBackground = $('<div id="space-background"></div>');
      this.container.append(this.spaceBackground);
  
      for (let layer = 0; layer < 3; layer++) {
        const starLayer = $(
          `<div class="star-layer" id="star-layer-${layer}"></div>`
        );
        this.spaceBackground.append(starLayer);
  
        for (let i = 0; i < 200; i++) {
          const star = $('<div class="star"></div>');
          star.css({
            left: Math.random() * 200 + "%",
            top: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.5
          });
          starLayer.append(star);
        }
      }
    }
  
    update() {
      this.updateFuncs.forEach((func) => func());
      const now = Date.now();
      if (now - this.lastPerformanceCheck > this.performanceCheckInterval) {
        this.lastPerformanceCheck = now;
        this.cleanupResources();
      }
      window.requestAnimationFrame(this.update);
    }
  
    startUpdating(func) {
      this.updateFuncs.push(func);
    }
  
    displayQuestion() {
      if (!this.quiz.isLoaded()) return;
      
      this.canAnswer = true;
      this.clearQuestion();
  
      const question = this.quiz.getCurrentQuestion();
      const questionEl = $("<div class='question'>" + question.question + "</div>");
      this.container.append(questionEl);
  
      // Возвращаем разные изображения астероидов для текстовых вопросов
      const answerImages = [
        "https://mattcannon.games/codepen/quiz/astroid-a.png",
        "https://mattcannon.games/codepen/quiz/astroid-b.png",
        "https://mattcannon.games/codepen/quiz/astroid-c.png",
        "https://mattcannon.games/codepen/quiz/astroid-d.png"
      ];
  
      // Создаем и размещаем ответы
      let answers = [];
      
      // Проверяем тип вопроса - если ответы являются объектами с url, значит это вопрос с картинками
      const isImageQuestion = question.answers && 
                              question.answers.length > 0 && 
                              typeof question.answers[0] === 'object' && 
                              question.answers[0].url !== undefined;
  
      // Предзагружаем изображения для следующего вопроса
      if (this.quiz.currentQuestion + 1 < this.quiz.questions.length) {
        this.quiz.preloadImagesForNextQuestions(1);
      }
  
      question.answers.forEach((answer, index) => {
        let answerContent;
        if (isImageQuestion) {
          // Для вопросов с картинками - добавляем ленивую загрузку
          answerContent = `
            <div class="image-placeholder" data-src="${answer.url}">
              <div class="loading-spinner"></div>
            </div>
            <span class="answer-text">${answer.text}</span>
          `;
        } else {
          // Для текстовых вопросов
          answerContent = `<span class="answer-title">${answer}</span>`;
        }
        
        const answerEl = $(`<div class='answer ${isImageQuestion ? 'image-answer' : ''}' data-index='${index}'>${answerContent}</div>`);
        
        // Установка позиции ответа
        const angle = (Math.PI * 2 * index) / question.answers.length;
        const distance = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        const x = window.innerWidth / 2 + Math.cos(angle) * distance;
        const y = window.innerHeight / 2 + Math.sin(angle) * distance;
        
        // Выбираем изображение астероида для фона
        const asteroidImage = isImageQuestion 
          ? "https://mattcannon.games/codepen/quiz/asteroid.png" 
          : answerImages[index % answerImages.length];
        
        answerEl.css({
          left: x,
          top: y,
          backgroundImage: `url(${asteroidImage})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        });
  
        this.container.append(answerEl);
        this.floatAnswer(answerEl);
        answers.push(answerEl);
        
        // Если это вопрос с изображениями, запускаем ленивую загрузку
        if (isImageQuestion) {
          const placeholder = answerEl.find('.image-placeholder');
          const imageUrl = placeholder.data('src');
          
          // Создаем новый объект изображения
          const img = new Image();
          
          // Настраиваем обработчики событий для изображения
          img.onload = function() {
            // После загрузки изображения заменяем плейсхолдер
            placeholder.replaceWith(`<img src="${imageUrl}" alt="${answer.text}" class="answer-image">`);
          };
          
          img.onerror = function() {
            // В случае ошибки, показываем запасное изображение
            placeholder.replaceWith(`<div class="error-image">Ошибка загрузки</div>`);
          };
          
          // Начинаем загрузку изображения
          img.src = imageUrl;
        }
      });
  
      // Добавим CSS стили для placeholder и spinner
      if (!$('#lazy-loading-styles').length) {
        $('<style id="lazy-loading-styles">')
          .prop('type', 'text/css')
          .html(`
            .image-placeholder {
              width: 100px;
              height: 100px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: rgba(0, 0, 0, 0.2);
              border-radius: 50%;
            }
            
            .loading-spinner {
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top: 4px solid #ffffff;
              width: 30px;
              height: 30px;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .error-image {
              color: red;
              font-size: 12px;
              text-align: center;
            }
          `)
          .appendTo('head');
      }
      
      this.setupListeners(answers);
      
      // Уберем эти строки отсюда, так как теперь мы вызываем resetTimer() 
      // перед вызовом displayQuestion()
      // this.displayTimer();  // Создаем элемент таймера
      // this.startTimer();    // Запускаем таймер с обратным отсчетом
    }
  
    floatAnswer(answerEl) {
      // Останавливаем существующие анимации перед созданием новых
      answerEl.stop(true);
      
      const floatAnimation = () => {
        // Увеличиваем область движения астероидов для более разнообразного геймплея
        const newX = Math.random() * (window.innerWidth - 100);
        const newY = Math.random() * (window.innerHeight - 100);
          
          answerEl.animate(
            { left: newX, top: newY },
          4000,
            "linear",
            floatAnimation
          );
        };
      
        floatAnimation();
    }
  
    checkAnswer(answerIndex, bulletPosition) {
      if (!this.canAnswer) return; // Prevent multiple answers on the same question
      this.canAnswer = false; // Lock answering until current one is processed
  
      const question = this.quiz.getCurrentQuestion();
      const $answer = $(`.answer[data-index="${answerIndex}"]`);
      const correctAnswerIndex = question.correct;
  
      console.log("Selected:", answerIndex, "Correct:", correctAnswerIndex);
  
      // Останавливаем таймер
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // Stop the timeup sound if it's playing
      if (this.timeupSound) {
        this.timeupSound.pause();
        this.timeupSound.currentTime = 0;
      }
  
      if (answerIndex === correctAnswerIndex) {
        // Correct answer
        this.quiz.score += 10;
        this.displayFeedback("Correct! +10", true, bulletPosition);
        $answer.css("animation", "correct 0.5s");
        
        // Play correct sound
        if (this.correctSound) {
          this.correctSound.currentTime = 0;
          this.correctSound.play().catch(e => ("Error playing correct sound:", e));
        }
      } else {
        // Incorrect answer
        const remainingLives = this.quiz.decreaseLives();
        this.quiz.score -= 5;
        this.displayLives();
        
        this.displayFeedback(`Wrong! -5 points, -1🩷`, false, bulletPosition);
        $answer.css("animation", "incorrect 0.5s");
        
        // Выделяем правильный ответ
        $(`.answer[data-index="${correctAnswerIndex}"]`).css({
          "background-color": "rgba(46, 204, 113, 0.7)",
          "border": "2px solid #2ecc71"
        });
        
        // Play incorrect sound
        if (this.wrongSound) {
          this.wrongSound.currentTime = 0;
          this.wrongSound.play().catch(e => ("Error playing wrong sound:", e));
        }
        
        // Проверяем, не закончились ли жизни
        if (remainingLives <= 0) {
          setTimeout(() => {
            this.endGame();
          }, 1500);
          return;
        }
      }
      
      // Обновляем отображение счета
      this.displayScore();
      
      // ВАЖНОЕ ИЗМЕНЕНИЕ: Используем общий метод для перехода к следующему вопросу
      setTimeout(() => {
        // Не увеличиваем счетчик вопросов здесь, это делается в moveToNextQuestion
        this.moveToNextQuestion();
      }, 1000);
    }
  
    displayFeedback(text, correct, position) {
      const feedbackEl = $("<div class='feedback'>" + text + "</div>");
      feedbackEl.css({
        left: position.x,
        top: position.y,
        color: correct ? "#00ff00" : "#ff0000"
      });
      this.container.append(feedbackEl);
      setTimeout(() => feedbackEl.remove(), 1000);
    }
  
    clearQuestion() {
      $(".question, .answer").remove(); // Clear out both the question and answers
    }
  
    // Полностью переработанный метод обработки времени
    startTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      this.timeLeft = 20;
      
      // Проверяем и создаем таймер если нужно
      if ($(".timer").length === 0) {
        this.forceCreateTimer();
      }
      
      // Обновляем отображение
      $(".timer").text(this.timeLeft).removeClass('timer-warning');
      
      // Создаем интервал
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        
        if ($(".timer").length === 0) {
          this.forceCreateTimer();
        }
        
        $(".timer").text(this.timeLeft);
        
        // Предупреждение при малом времени
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
          $(".timer").addClass('timer-warning');
          
          if (this.timeLeft === 5 && this.timeupSound && this.timeupSound.paused) {
            this.timeupSound.currentTime = 0;
            this.timeupSound.play().catch(() => {});
          }
        }
        
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          this.handleExpiredTimer();
        }
      }, 1000);
    }
  
    // Новый метод для принудительного создания таймера
    forceCreateTimer() {
      // Гарантировано удаляем старый таймер
      $(".timer").remove();
      
      // Создаем новый элемент таймера с гарантированной видимостью и стилями
      const timerEl = $("<div class='timer'>20</div>");
      
      // Добавляем явные стили для гарантии видимости 
      timerEl.css({
        'position': 'absolute',
        'font-size': '48px', 
        'bottom': '10px',
        'left': '50%',
        'transform': 'translateX(-50%)',
        'color': 'yellow',
        'z-index': '1000',
        'display': 'block',
        'visibility': 'visible',
        'opacity': '1'
      });
      
      // Добавляем элемент в контейнер
      this.container.append(timerEl);
      
      console.log("Таймер принудительно создан:", $(".timer").length, "элементов видны");
      return timerEl;
    }
  
    // Новый метод для обработки истекшего времени
    handleExpiredTimer() {
      // Проверяем, что ответ еще не дан
      if (!this.canAnswer) {
        console.log("Ответ уже дан, пропускаем обработку таймера");
        return;
      }
      
      // Блокируем ответы
      this.canAnswer = false;
      
      // Показываем правильный ответ
      const question = this.quiz.getCurrentQuestion();
      if (question) {
        $(`.answer[data-index="${question.correct}"]`).css({
          "background-color": "rgba(46, 204, 113, 0.7)",
          "border": "2px solid #2ecc71"
        });
      }
      
      // Уменьшаем жизни
      this.quiz.decreaseLives();
      
      // ДОБАВЛЯЕМ СНЯТИЕ 5 ОЧКОВ
      this.quiz.score -= 5;
      
      // Обновляем отображение жизней и счета
      this.displayLives();
      this.displayScore(); // ДОБАВЛЯЕМ ОБНОВЛЕНИЕ СЧЕТА
      
      // Показываем сообщение с уточнением о потере очков
      this.displayFeedback("Time's up! -5 points, -1🩷", false, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      
      // Планируем переход к следующему вопросу
      console.log("Планируем переход к следующему вопросу через 1.5 секунды");
      setTimeout(() => {
        this.moveToNextQuestion();
      }, 1500);
    }
  
    // Обновленный метод перехода к следующему вопросу с улучшенным отображением таймера
    moveToNextQuestion() {
      // Очищаем предыдущие вопросы и таймеры
      this.clearQuestion();
      this.clearAnswers();
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // Увеличиваем счетчик вопросов
      this.quiz.currentQuestion++;
      
      // Проверяем окончание игры
      if (this.quiz.isGameOver() || this.quiz.lives <= 0) {
        this.endGame();
        return;
      }
      
      // Обновляем отображение
      this.displayQuestionCount();
      
      // Удаляем старый таймер и создаем новый
      $(".timer").remove();
      
      // Отображаем вопрос
      this.displayQuestion();
      
      // Создаем таймер
      this.forceCreateTimer();
      
      // Разрешаем ответы
      this.canAnswer = true;
      
      // Запускаем таймер
      this.timeLeft = 20;
      this.startTimer();
    }
  
    // Добавляем метод для очистки ответов
    clearAnswers() {
      $(".answer").remove();
      console.log("Ответы очищены");
    }
  
    handleTimeUp() {
      console.log("Метод handleTimeUp вызван");
      
      // Очищаем таймер полностью
      this.clearTimer();
      
      // Убедимся, что это действительно уменьшает жизни
      console.log("Жизни до уменьшения:", this.quiz.lives);
      const remainingLives = this.quiz.decreaseLives();
      console.log("Жизни после уменьшения:", remainingLives);
      
      // Убедимся, что очки корректно уменьшаются
      console.log("Очки до уменьшения:", this.quiz.score);
      this.quiz.score -= 5; // Снимаем 5 очков за просроченное время
      console.log("Очки после уменьшения:", this.quiz.score);
      
      // Обновляем отображение жизней и счёта
      this.displayLives();
      this.displayScore();
      
      // Показываем сообщение
      this.displayFeedback("Time's up! -5 points, -1 ❤️", false, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      
      // Продолжаем как обычно...
    }
  
    resetTimer() {
      // Останавливаем интервал
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // Сбрасываем значение времени
      this.timeLeft = 20;
      
      // Обновляем отображение
      $(".timer").text(this.timeLeft).removeClass('timer-warning');
      
      // Останавливаем звук, если он играет
      if (this.timeupSound) {
        this.timeupSound.pause();
        this.timeupSound.currentTime = 0;
      }
    }
  
    displayScore() {
      $(".score").remove();
      
      // Используем тот же flexbox-подход для счета
      const scoreEl = $(`
        <div class="score">
          <span class="text-part">Score: ${this.quiz.score}</span>
          <span class="emoji-part">⭐</span>
        </div>
      `).css({
        'display': 'flex',
        'align-items': 'center',
        'gap': '3px'
      });
      
      this.container.append(scoreEl);
    }
  
    displayQuestionCount() {
      $(".question-count").remove();
      const maxQuestions = Math.min(10, this.quiz.questions.length);
      const countEl = $(`<div class='question-count'>Question: ${this.quiz.currentQuestion + 1}/${maxQuestions}</div>`);
      this.container.append(countEl);
    }
  
    async endGame() {
      try {
        // ВАЖНОЕ ИСПРАВЛЕНИЕ: Сначала сохраняем время окончания и вычисляем общее время игры
        // чтобы оно больше не изменялось
        this.gameEndTime = Date.now();
        this.gameTime = (this.gameEndTime - this.gameStartTime) / 1000; // Время в секундах
        const finalGameTime = this.gameTime; // Сохраняем финальное время в константу, чтобы оно не изменялось
        
        // Останавливаем все таймеры и интервалы
        this.clearTimer();
        clearInterval(this.timerInterval);
        clearInterval(this.gameTimerInterval); // Очищаем интервал игрового таймера, если он есть
        
        // Останавливаем все вычисления и анимации
        this.canAnswer = false;
        this.gameActive = false;
        this.timer = 0;
        
        // Отправляем запрос на серверное сохранение, только если у нас есть счет
        if (this.quiz.score > 0) {
          try {
            const response = await $.ajax({
              url: '/api/update-sigma-score',
              method: 'POST',
              data: JSON.stringify({
                score: this.quiz.score,
                time: finalGameTime, // Используем сохраненное финальное время
                gameEndTime: Math.floor(Date.now()/1000)
              }),
              contentType: 'application/json'
            });
            
            console.log('Score saved:', response);
            if (response.newRecord) {
              console.log('New personal best!');
        }
      } catch (error) {
            console.error('Error saving score:', error);
          }
        }
        
        // Показываем экран завершения игры
        const gameOverEl = $("<div class='game-over'></div>");
        this.container.append(gameOverEl);
        
        gameOverEl.append("<h2>Game Over!</h2>");
        
        // Добавляем причину окончания игры
        if (this.quiz.lives <= 0) {
          gameOverEl.append(`<p>You ran out of lives!</p>`);
        } else {
          gameOverEl.append(`<p>You completed all questions with ${this.quiz.lives} lives remaining!</p>`);
        }
        
        // Добавляем отображение времени игры, используя сохраненное финальное время
        const formattedTime = this.formatGameTime(finalGameTime);
        gameOverEl.append(`<p>Time: <span class='final-time'>${formattedTime}</span></p>`);
        
        // Использование finalScore вместо score для большей надежности
        const finalScore = typeof this.finalScore !== 'undefined' ? this.finalScore : 
                         (typeof this.score !== 'undefined' ? this.score : 0);
        
        gameOverEl.append(`<p>Your final score: <span class='final-score'>${finalScore}<span class="star-icon">⭐</span></span></p>`);
        
        // Добавим div для кнопок с flex-контейнером
        const buttonsContainer = $("<div class='game-over-buttons'></div>");
        
        // Кнопка для перезапуска игры
        const restartBtn = $("<button class='restart-btn'>Play Again</button>");
        buttonsContainer.append(restartBtn);
        
        // Кнопка для перехода на страницу лидерборда
        const leaderboardBtn = $("<button class='leaderboard-btn'>Leaderboard</button>");
        buttonsContainer.append(leaderboardBtn);
        
        // Добавляем контейнер с кнопками
        gameOverEl.append(buttonsContainer);
        
        restartBtn.on("click", () => {
          // Просто перезагружаем страницу для полного рестарта
          window.location.reload();
        });
        
        leaderboardBtn.on("click", () => {
          window.location.href = '/leaderboard';
        });
        
        // Добавляем кнопки в контейнер
        const btnContainer = $('<div>').addClass('btn-container');
        btnContainer.append(restartBtn).append(leaderboardBtn);
        
        // Добавляем контейнер с кнопками в game-over
        gameOverEl.append(btnContainer);
        
        // Добавляем весь контейнер в игровое поле
        this.container.append(gameOverEl);
        
        // Показываем информацию о пользователе снова
        this.showUserInfo();
        
        // Убеждаемся, что элементы управления остаются скрытыми
        $('#controls-title, #controls-guide').hide();
      } catch (error) {
        console.error("Error in endGame:", error);
      }
    }
  
    setupKeyboardControls() {
      // Сначала удаляем существующие обработчики, чтобы избежать дублирования
      $(document).off('keydown.quizGame keyup.quizGame');
      
      // Обработчик нажатия клавиш с пространством имен для легкого удаления
      $(document).on('keydown.quizGame', (event) => {
        switch(event.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.controls.isUp = true;
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.controls.isDown = true;
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.controls.isLeft = true;
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.controls.isRight = true;
            break;
          case ' ':
            this.controls.isShooting = true;
            break;
        }
      });
  
      $(document).ready(function() {
        // Проверка загрузки ethers.js
        setTimeout(() => {
            console.log("ethers.js loaded:", typeof ethers !== 'undefined');
            console.log("Web3 available:", typeof window.ethereum !== 'undefined');
        }, 1000);
      });
      
      // Обработчик отпускания клавиш с пространством имен
      $(document).on('keyup.quizGame', (event) => {
        switch(event.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.controls.isUp = false;
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.controls.isDown = false;
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.controls.isLeft = false;
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.controls.isRight = false;
            break;
          case ' ':
            this.controls.isShooting = false;
            break;
        }
      });
    }
  
    cleanupResources() {
      $(".bullet").each((i, el) => {
        const $el = $(el);
        const pos = $el.position();
        if (pos.left < -100 || pos.left > window.innerWidth + 100 || 
            pos.top < -100 || pos.top > window.innerHeight + 100) {
          $el.remove();
        }
      });
      const trailPoints = $(".trail-point");
      if (trailPoints.length > this.maxTrailPoints) {
        const toRemove = trailPoints.length - this.maxTrailPoints;
        trailPoints.slice(0, toRemove).remove();
      }
      if (this.updateFuncs.length > 10) {
        this.updateFuncs = [...new Set(this.updateFuncs)];
      }
    }
  
    // Добавляем метод для создания и отображения таймера
    displayTimer() {
      // Сначала удаляем существующий таймер, если есть
      $(".timer").remove();
      
      // Создаем и добавляем новый элемент таймера с явной видимостью
      const timerEl = $("<div class='timer'>20</div>").css({
        'display': 'block',
        'z-index': '1000',
        'visibility': 'visible'
      });
      this.container.append(timerEl);
      
      // Для отладки
      console.log("Таймер создан:", $(".timer").length, "элементов");
    }
    
    // Метод для полной очистки таймера
    clearTimer() {
      // Останавливаем интервал
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // Обнуляем текст таймера, но НЕ скрываем его
      $(".timer").text("20");  // Просто меняем текст на начальное значение
      console.log("Таймер очищен, но остался видимым");
    }
  
    // Добавить метод для получения таблицы лидеров
    async fetchLeaderboard() {
      if (!this.web3Connected) return;
      
      try {
        // Код для вызова смарт-контракта и получения лучших результатов
        // ...
        
        // Отображение результатов
        this.displayLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    }
    
    displayLeaderboard(data) {
      const leaderboardEl = $("<div class='leaderboard'><h2>Verified Top Scores</h2></div>");
      
      data.forEach((entry, index) => {
        leaderboardEl.append(`
          <div class="leaderboard-item">
            <div class="rank">${index + 1}</div>
            <div class="player">
              <img class="player-avatar" src="${entry.avatar || 'assets/default-avatar.png'}" alt="Player Avatar">
              <div class="player-name">${entry.display_name || 'Anonymous Player'}</div>
            </div>
            <div class="score">
              <span>${entry.best_score || 0}</span>
              <span class="star-icon">⭐</span>
            </div>
          </div>
        `);
      });
      
      $(".game-over").append(leaderboardEl);
    }
  
    // Вспомогательные функции для работы с доказательствами SP1
    fromHexString(hexString) {
      if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
      }
      const bytes = new Uint8Array(hexString.length / 2);
      for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
      }
      return bytes;
    }
  
    toHexString(bytes) {
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  
    // Метод для отображения сообщений пользователю
    showMessage(message, type = 'info') {
      // Удаляем все существующие сообщения перед показом нового
      $('.message-overlay').remove();
      
      const msgEl = $(`<div class="message-overlay ${type}">${message}</div>`);
      
      // Добавьте стили в зависимости от типа сообщения
      const colors = {
        'info': '#3498db',
        'success': '#2ecc71',
        'error': '#e74c3c',
        'warning': '#f39c12'
      };
      
      msgEl.css({
        position: 'fixed',
        top: '20px',
        left: '50%',                // Центрируем по горизонтали
        transform: 'translateX(-50%)', // Смещаем на 50% своей ширины обратно для точного центрирования
        padding: '15px 25px',       // Увеличим немного отступы для лучшей видимости
        backgroundColor: colors[type] || colors.info,
        color: 'white',
        borderRadius: '5px',
        zIndex: 9999,
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '14px',          // Немного увеличим шрифт
        boxShadow: '0 0 15px rgba(0,0,0,0.5)',
        textAlign: 'center',        // Центрируем сам текст
        whiteSpace: 'nowrap',       // Предотвращаем перенос строк
        maxWidth: '90%'             // Ограничиваем ширину для мобильных устройств
      });
      
      // Добавьте сообщение в DOM
      $('body').append(msgEl);
      
      // Установите таймер для автоматического скрытия сообщения
      setTimeout(() => {
        msgEl.fadeOut(500, function() {
        $(this).remove();
      });
      }, 3000);
    }
  
    // Добавьте этот новый метод для создания байтов
    createProofBytes(proof) {
      // Создаем массив байтов для доказательства, минимум 32 байта для timestamp
      const proofBytes = new Uint8Array(64);
      
      // Записываем счет (8 байт)
      const score = proof.total_score || 0;
      for (let i = 0; i < 8; i++) {
        proofBytes[i] = (score >> (i * 8)) & 0xFF;
      }
      
      // Записываем номер вопроса (8 байт)
      const questionNumber = proof.question_number || 0;
      for (let i = 0; i < 8; i++) {
        proofBytes[8 + i] = (questionNumber >> (i * 8)) & 0xFF;
      }
      
      // Записываем timestamp (8 байт)
      const timestamp = proof.timestamp || Math.floor(Date.now()/1000);
      for (let i = 0; i < 8; i++) {
        proofBytes[16 + i] = (timestamp >> (i * 8)) & 0xFF;
      }
      
      // Заполняем оставшиеся байты нулями или каким-то шаблоном
      for (let i = 24; i < proofBytes.length; i++) {
        proofBytes[i] = i % 256; // Просто некоторый паттерн для заполнения
      }
      
      return proofBytes;
    }
  
    // Метод для получения истории ответов
    getQuestionsHistory() {
      // Возвращаем массив boolean, где true означает правильный ответ
      return this.quiz.questionsHistory || [];
    }
  
    // Обновим метод для полного скрытия панели пользователя
    hideUserInfo() {
      // Проверяем, авторизован ли пользователь, прежде чем скрывать
      $.ajax({
        url: '/api/auth/status',
        method: 'GET',
        success: (data) => {
          if (data.authenticated) {
            // Пользователь авторизован - можно скрыть
            $('.auth-container').attr('style', 'display: none !important; visibility: hidden !important; opacity: 0 !important;');
          } else {
            // Неавторизованным пользователям ВСЕГДА показываем кнопку входа
            $('#discord-login')
              .attr('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; z-index: 100000 !important; position: absolute !important; top: 10px !important; right: 10px !important;')
              .addClass('must-show');
          }
        },
        error: () => {
          // В случае ошибки - показываем кнопку логина
          $('#discord-login')
            .attr('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; z-index: 100000 !important; position: absolute !important; top: 10px !important; right: 10px !important;')
            .addClass('must-show');
        }
      });
    }
  
    // Обновим метод для отображения панели пользователя
    showUserInfo() {
      $('.auth-container').removeAttr('style');
    }
  
    // Добавим метод для отображения жизней
    displayLives() {
      // Удаляем все существующие элементы
      $(".lives").remove();
      $("#game-lives").remove();
      
      // Создаем элемент с использованием flexbox для выравнивания
      const livesEl = $(`
        <div id="game-lives">
          <span class="text-part">Lives:${this.quiz.lives}</span>
          <span class="emoji-part">🩷</span>
        </div>
      `);
      
      // Применяем базовые стили
      livesEl.css({
        'position': 'fixed',
        'bottom': '20px',
        'right': '320px',
        'font-size': '22.3px',
        'color': '#FE11C5',
        'text-shadow': '0 0 10px rgba(254, 17, 197, 0.8)',
        'z-index': '9999999',
        'font-family': "'Press Start 2P', cursive",
        'pointer-events': 'none',
        'display': 'flex',
        'align-items': 'center', // Выравниваем по центру по вертикали
        'gap': '3px' // Небольшой отступ между текстом и эмодзи
      });
      
      // Добавляем стили для эмодзи
      livesEl.find('.emoji-part').css({
        'display': 'inline-flex',
        'align-items': 'center',
        'font-size': '0.9em',
        'line-height': '1'
      });
      
      $('body').append(livesEl);
    }
  
    // Метод для форматирования времени в удобочитаемый формат
    formatGameTime(timeInSeconds) {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Удаляем неправильные глобальные определения функций и добавляем их как методы класса Game

    // Полностью обновленный метод перехода к следующему вопросу
    moveToNextQuestion() {
      console.log("Переходим к следующему вопросу");
      
      // 1. Остановим все интервалы
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // 2. Очищаем всё от предыдущего вопроса
      this.clearQuestion();
      this.clearAnswers();
      
      // 3. Увеличиваем счетчик вопросов
      this.quiz.currentQuestion++;
      
      // 4. Проверяем, закончилась ли игра
      if (this.quiz.isGameOver() || this.quiz.lives <= 0) {
        console.log("Игра завершается");
        this.endGame();
        return;
      }
      
      // 5. Обновляем счетчик вопросов
      this.displayQuestionCount();
      console.log("Отображаем новый вопрос");
      
      // 6. СНАЧАЛА создаем таймер, ЗАТЕМ отображаем вопрос
      // Принудительно удаляем старый таймер
      $(".timer").remove();
      console.log("Старый таймер удален");
      
      // ВАЖНОЕ ИЗМЕНЕНИЕ: Используем jQuery для принудительного создания и добавления таймера
      const newTimer = $("<div>", {
        class: "timer",
        text: "20",
        css: {
          'position': 'absolute',
          'font-size': '48px',
          'bottom': '10px',
          'left': '50%',
          'transform': 'translateX(-50%)',
          'color': 'yellow',
          'z-index': '1000',
          'display': 'block',
          'visibility': 'visible',
          'opacity': '1'
        }
      });
      
      // Явно добавляем в контейнер
      this.container.append(newTimer);
      console.log("Новый таймер создан:", $(".timer").length, "элементов");
      
      // 7. Отображаем новый вопрос
      this.displayQuestion();
      
      // 8. Разрешаем ответы и запускаем таймер
      this.canAnswer = true;
      this.timeLeft = 20;
      
      // 9. Запускаем новый таймер с явной проверкой
      console.log("Запускаем таймер для нового вопроса");
      this.startSimpleTimer();
    };

    // Простой метод таймера, который гарантированно работает
    startSimpleTimer() {
      // Останавливаем предыдущий интервал
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      
      // Устанавливаем начальное значение и визуально обновляем
      this.timeLeft = 20;
      
      // Проверяем, что элемент таймера существует
      if ($(".timer").length === 0) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА: Таймер не найден!");
        // Создаем новый таймер, если его нет
        this.container.append(
          $("<div>", {
            class: "timer",
            text: this.timeLeft,
            css: {
              'position': 'absolute',
              'font-size': '48px',
              'bottom': '10px',
              'left': '50%',
              'transform': 'translateX(-50%)',
              'color': 'yellow',
              'z-index': '1000',
              'display': 'block',
              'visibility': 'visible',
              'opacity': '1'
            }
          })
        );
      } else {
        // Обновляем текст существующего таймера
        $(".timer").text(this.timeLeft).removeClass("timer-warning");
      }
      
      // Создаем новый интервал для таймера
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        
        // Проверяем наличие элемента таймера при каждом тике
        if ($(".timer").length === 0) {
          console.error("КРИТИЧЕСКАЯ ОШИБКА: Элемент таймера исчез в интервале!");
          return;
        }
        
        // Обновляем отображение таймера
        $(".timer").text(this.timeLeft);
        
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
          $(".timer").addClass("timer-warning");
          if (this.timeLeft === 5 && this.timeupSound && this.timeupSound.paused) {
            this.timeupSound.currentTime = 0;
            // Вот здесь ДОБАВИЛ вызов метода play()
            this.timeupSound.play().catch(e => console.log("Ошибка воспроизведения звука:", e));
          }
        }
        
        // Проверяем окончание времени
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          this.handleExpiredTimer();
        }
      }, 1000);
    };

    // Добавляем метод setupListeners для обработки взаимодействия с ответами
    setupListeners(answers) {
      
      
      // Останавливаем все предыдущие события (для избежания дублирования)
      $(document).off('click', '.answer');
      
      // Устанавливаем обработчики клика на ответы
      $(document).on('click', '.answer', (e) => {
        const answerEl = $(e.currentTarget);
        const index = parseInt(answerEl.attr('data-index'));
        
        // Проверяем, можно ли отвечать на вопрос
        if (this.canAnswer) {
          // Получаем позицию клика для отображения эффектов
          const position = {
            x: e.pageX,
            y: e.pageY
          };
          
          console.log(`Выбран ответ с индексом ${index}`);
          this.checkAnswer(index, position);
        }
      });
      
      // Запускаем "плавание" ответов по экрану
      answers.forEach(answerEl => {
        this.floatAnswer(answerEl);
      });
    }

    // Исправленный метод showGameOver
    showGameOver() {
      // Создаем контейнер для экрана окончания игры
      const gameOverContainer = $('<div>').addClass('game-over');
      
      // Добавляем заголовок
      gameOverContainer.append($('<h1>').text('Game Over'));
      
      // Получаем финальный счет из наиболее надежного источника
      let finalScore = this.finalScore;
      
      // Защита от undefined
      if (typeof finalScore === 'undefined' || finalScore === null) {
        const scoreElement = $(".score");
        if (scoreElement.length > 0) {
          finalScore = parseInt(scoreElement.text().replace("Score: ", "")) || 0;
        } else if (typeof this.score !== 'undefined') {
          finalScore = this.score;
        } else if (this.quiz && typeof this.quiz.score !== 'undefined') {
          finalScore = this.quiz.score;
        } else {
          finalScore = 0;
        }
      }
      
      // Добавляем только значение счета (без "Score:")
      gameOverContainer.append($('<div>').addClass('score-info').text(finalScore));
      
      // Если есть информация о времени, добавляем ее с более точным форматированием
      if (this.gameTime > 0) {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const milliseconds = Math.floor((this.gameTime * 1000) % 1000);
        // Добавляем только значение времени (без "Time:")
        const timeText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${String(milliseconds).padStart(3, '0')}`;
        gameOverContainer.append($('<div>').addClass('time-info').text(timeText));
      }
      
      // Создаем кнопки с правильными классами
      const playAgainBtn = $('<button>').text('Play Again').addClass('play-again-btn');
      const leaderboardBtn = $('<button>').text('Leaderboard').addClass('play-again-btn');
      
      // Добавляем обработчики событий для кнопок
      playAgainBtn.on('click', () => {
        // Просто перезагружаем страницу для полного рестарта
        window.location.reload();
      });
      
      leaderboardBtn.on('click', () => {
        window.location.href = '/leaderboard';
      });
      
      // Добавляем кнопки в контейнер
      const btnContainer = $('<div>').addClass('btn-container');
      btnContainer.append(playAgainBtn).append(leaderboardBtn);
      
      // Добавляем контейнер с кнопками в game-over
      gameOverContainer.append(btnContainer);
      
      // Добавляем весь контейнер в игровое поле
      this.container.append(gameOverContainer);
      
      // Показываем информацию о пользователе снова
      this.showUserInfo();
      
      // Убеждаемся, что элементы управления остаются скрытыми
      $('#controls-title, #controls-guide').hide();
    }

    // Находим метод handleAnswer в классе Game
    handleAnswer(answer) {
      // ... существующий код ...
      
      // Проверяем правильность ответа
      if (answer === correctAnswer) {
        // ... код для правильного ответа ...
      } else {
        // Неправильный ответ - обновляем счет
        this.score -= 5;
        
        // Сразу обновляем отображение счета на экране
        $(".score").text(`Score: ${this.score}`);
        
        // Воспроизводим звук неправильного ответа
        $("#wrongSound")[0].play();
        
        this.wrongAnswers++;
        this.lives--;
        
        // Обновляем отображение жизней
        this.updateLives();
        
        // Проверяем условие завершения игры после обновления интерфейса
        if (this.lives <= 0 || this.currentQuestionIndex >= this.questions.length - 1) {
          // Добавляем небольшую задержку перед показом Game Over
          setTimeout(() => {
            this.endGame();
          }, 300); // 300мс задержки для визуального восприятия обновленного счета
        } else {
          // Показываем следующий вопрос
          this.showNextQuestion();
        }
      }
      
      // ... остальной код ...
    }

    // Проверяем метод endGame в классе Game
    endGame() {
      // Останавливаем игровой цикл
      clearInterval(this.gameLoop);
      
      // Останавливаем таймер
      clearInterval(this.timerInterval);
      
      // Получаем актуальный счет из DOM, так как это гарантированно отображаемое значение
      const displayScore = parseInt($(".score").text().replace("Score: ", "")) || 0;
      
      // Сохраняем счет во всех переменных
      this.score = displayScore;
      this.finalScore = displayScore;
      
      // Сохраняем результаты в базу данных
      saveGameScore(displayScore, this.gameTime);
      
      // Показываем окно Game Over
      this.showGameOver();
    }

    // Добавляем метод resetGame в класс Game
    resetGame() {
      // Удаляем старые игровые элементы
      this.container.find('.bullet, .enemy, .game-over, .question-container, .score, .time, .lives').remove();
      
      // Сбрасываем игровые переменные
      this.score = 0;
      this.finalScore = 0;
      this.gameTime = 0;
      this.lives = 3;
      this.isPaused = false;
      this.isGameOver = false;
      this.bullets = [];
      this.enemies = [];
      this.currentQuestionIndex = 0;
      this.wrongAnswers = 0;
      this.correctAnswers = 0;
      
      // Очищаем интервалы, если они активны
      if (this.gameLoop) clearInterval(this.gameLoop);
      if (this.timerInterval) clearInterval(this.timerInterval);
      
      // Удаляем классы, связанные с игрой
      $('#game-container').removeClass('game-active');
      
      console.log("Game has been reset");
    }
  }
  
  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  $(document).ready(function () {
    const game = new Game();
    
    // Добавляем анимацию пульсации
    $('<style>')
      .prop('type', 'text/css')
      .html(`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        #discord-login-fixed {
          animation: pulse 1.5s infinite;
        }
      `)
      .appendTo('head');
    
    // Проверяем статус авторизации при загрузке
    $.ajax({
      url: '/api/auth/status',
      method: 'GET',
      success: (data) => {
        if (data.authenticated) {
          // Пользователь авторизован - показываем информацию
          $('#username').text(data.user.username);
          $('#user-avatar').attr('src', data.user.avatar);
          $('#user-info').show();
          $('#discord-login').hide();
          // Удаляем фиксированную кнопку, если она есть
          $('#discord-login-fixed').remove();
        } else {
          // Пользователь не авторизован - скрываем старую кнопку и создаем новую
          $('#user-info').hide();
          $('#discord-login').hide(); // Скрываем стандартную кнопку
          
          // Создаем новую кнопку, если её еще нет
          if ($('#discord-login-fixed').length === 0) {
            createFixedLoginButton();
          }
        }
      },
      error: () => {
        console.error('Error checking auth status');
        $('#user-info').hide();
        $('#discord-login').hide();
        
        // В случае ошибки тоже создаем фиксированную кнопку
        if ($('#discord-login-fixed').length === 0) {
          createFixedLoginButton();
        }
      }
    });
    
    // Скрываем информацию о пользователе при загрузке игры
    game.hideUserInfo();
    
    // Очистка ресурсов при закрытии страницы
    $(window).on('beforeunload', function() {
      // Удаляем все обработчики событий
      $(document).off('.quizGame');
      
      // Останавливаем все анимации
      $('.answer').stop(true, true);
      
      // Очищаем интервалы
      clearInterval(game.timerInterval);
    });

    // Находим или добавляем стиль для звездочки в CSS
    $('<style>')
      .prop('type', 'text/css')
      .html(`
        .star-icon {
          font-size: 1.5em !important;  /* Увеличиваем размер со всех звездочек */
          display: inline-block;
          vertical-align: middle;
          margin-left: 8px;
        }
        
        .final-score .star-icon {
          font-size: 1.8em !important;  /* Еще больше для финального счета */
        }
        
        .score .star-icon {
          font-size: 1.6em !important;  /* Для обычного счета */
        }
      `)
      .appendTo('head');

    // Обновляем CSS-правило для auth-container
    $('<style>')
      .prop('type', 'text/css')
      .html(`
        /* Скрываем auth-container, только если пользователь авторизован */
        .game-active .auth-container:not(.force-show) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Специальный класс для принудительного отображения */
        .auth-container.force-show {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
      `)
      .appendTo('head');

    // Добавляем стили для отображения жизней
    $('<style>')
      .prop('type', 'text/css')
      .html(`
        .lives {
          position: absolute;
          top: 20px;
          left: 20px;
          color: white;
          font-family: 'Press Start 2P', cursive;
          font-size: 16px;
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
          z-index: 100;
        }
        
        /* Анимация при потере жизни */
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); color: #e74c3c; }
          100% { transform: scale(1); }
        }
        
        .lives.lost-life {
          animation: heartbeat 0.5s;
        }
      `)
      .appendTo('head');

    // Добавляем стили для отображения времени игры
    $('<style>')
      .prop('type', 'text/css')
      .html(`
        .final-time {
          color: #3498db;
          font-weight: bold;
          font-size: 1.2em;
          font-family: 'Press Start 2P', cursive;
          text-shadow: 0 0 5px rgba(52, 152, 219, 0.7);
        }
        
        /* Стиль для времени в лидерборде */
        .leaderboard-time {
          font-size: 0.8em;
          color: #3498db;
          margin-left: 10px;
        }
      `)
      .appendTo('head');

    // Оставьте только этот вызов:
    $(document).ready(function() {
      
      
      // Удостоверимся, что элемент существует
      if ($("#user-info").length === 0) {
        console.error("Элемент #user-info не найден в DOM!");
        
        // Создаем элемент, если он отсутствует
        $('body').append(`
          <div id="user-info" style="position: absolute; top: 20px; right: 20px; z-index: 1000; display: none; background-color: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px;">
            <img id="user-avatar" src="" alt="User Avatar" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;">
            <span id="username" style="color: white; font-family: 'Press Start 2P', cursive;">User</span>
            <button id="logout-btn" style="margin-left: 10px; background-color: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Logout</button>
          </div>
        `);
        
        console.log("Элемент #user-info создан:", $("#user-info").length);
      }
      
      // Запускаем проверку авторизации
      checkAuthStatus();
    });
  });

// Добавим функцию для создания всегда видимой кнопки логина
function createFixedLoginButton() {
  // Удаляем существующую фиксированную кнопку, если она уже есть
  $('#discord-login-fixed').remove();
  
  // Скрываем стандартную кнопку логина
  $('#discord-login').hide();
  
  // Создаем новую фиксированную кнопку логина
  const newLoginBtn = $('<button id="discord-login-fixed" class="must-show">Login with Discord</button>')
    .css({
      'position': 'fixed',
      'top': '20px',
      'right': '20px',
      'z-index': '100000',
      'background-color': '#5865F2',
      'color': 'white',
      'border': 'none',
      'padding': '10px 20px',
      'border-radius': '4px',
      'font-family': "'Press Start 2P', cursive",
      'font-size': '14px',
      'cursor': 'pointer',
      'animation': 'pulse 1.5s infinite',
      'box-shadow': '0 0 20px rgba(88, 101, 242, 0.8)'
    })
    .on('click', function() {
      window.location.href = '/auth/discord';
    });
  
  // Добавляем кнопку в body
  $('body').append(newLoginBtn);
  
  return newLoginBtn;
}

// Добавляем функцию для форматирования URL аватара
function formatAvatarUrl(userId, avatarId) {
  if (!avatarId) {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAES0lEQVR4nO2dW4hOURTHf2PGbeQ2buNSRrlFJMVQJBrKZTyMmhcvlHjwMCnxYB7IA1FePHiQBw+UJg8uL7wgSmQyt1Lkkmmccss1rq3V6Bubme86Z5+z1/7+tZ9m9tpzzvdb51trr7XXsQqFQqFQKBQKhUKhUMSSFmA/0Ak8A34Av4E+4DVwF9gFNHrIXhgZDl4B+oeQX8AZYJyH/EJnPXA3gBF/JcD/A4tN1VEYLAK+hjDij3JfmaqnMKTAoiuOMoSRi6YqKgRTMJ+I9yoqikZgB/AYyJgqkATmAp8jMKOsVoP1jBF2AL9juYZsMlFZCTQDX2JqRlk9BRqirrQEWAv0J8CMs/G1QiqxMMFmlNXNqCoxbIjVRCqxJYH3jLKa7bLCTVWaUVafgTFuKl9bpRll1e7CkEVVbka5fR91YcgYd1hVa0ZZHQc0pMYdlgLpBJkxYNSQlQk0otfOQNAKMB10UhTv3MH2/4YwbAQuOTDgHDA+7OArgeakGrIc2A1cAz4AX+xBzRm7DTPHYhOw1Z6HNwA7gVvA55hPPT8KO2QdYQ2i8vqy+Qb0AGeBnVZGnG8X9+1rwDpgLfAEyEVswDvCzElXAmeBDykZgUcpbU09BG7YV2oLrLG2OkYt1QjbjCbrHpuNcX9qhrPxepdd04wHHtgjWrk0Y5MdZBftiDWo7ZoxGvhkD87KzRhrD7DKsw33hTVjupWUKi+eRWbGLvspSV1m1FoBQ7kowM2aUS4I3TRDlpqRsQOFouOZESf4NkNl5XJmxGLK6dtJELppxjVgJP7wbYYSm5orx4cRroxoQeGEuM5AKU7kywwjF3WfZqyHBODLDANYU9T9mjEXEoIvM1xjzYzztSzJkxlGsGaGuQ2TDQ7M2AYlXJuhfN0zjBFfMy7YkxsFC6+xA0NmDEICcWlGK5KIKzOmIpG4MGMKkkmUZkyARkgwUZnRAAkn7N2aBtKBCzNGQDpwYUYdpIOwZjRAenBhhvJ5DwPG7rPNkC7CmqF8DAPG1hJbIH2ENaMe0ocLMxSQPsKaoXwOA8bWEkdB+ghjhgrEDGDkYtYI6SSsGcrXCKxLdiBm/iJ3QjoJY4byY126EJiKCgxVTVgzlJ8hrJ/zduBMGcVEGCqbsGYoHxWlJoCFVirqgJXFo0Pxj4k8tYA0EsWXNQqHKDPUVyh3rlBR4MyMN/ZsWs1zHRHFByh6rMn6OhcXPuX4sOmfxEV5LvzMRvE/1Pjnui5Hn4OLdtov5Clc8MF+qOyCoH5u2Av3qd0GK38t1jfgAuvoO0TgL9n3r6QF8Hc7k5wO5P8UKvQXYcYgKi25IsaMz+BvlVsoL0LktReHAvy/ijJEcSmCO7NOpJWgprQBeyLIK7nAgNEj7QL7mOMX+0WMR/YDygOzqwqFQqFQKBQKhUKhUMQC+AOf9S7X9vqvhwAAAABJRU5ErkJggg==";
  }
  
  // Если уже полный URL, возвращаем его
  if (avatarId.startsWith('http')) {
    return avatarId;
  }
  
  // Иначе конструируем URL из ID пользователя и аватара
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
}

// Находим функцию checkAuthStatus или аналогичный код и исправляем его
function checkAuthStatus() {
    $.ajax({
        url: '/api/auth/status',
        method: 'GET',
        success: function(data) {
            if (data.authenticated) {
                // Показываем имя пользователя
                $('#username').text(data.user.username);
                
                // Проверяем формат аватара и формируем полный URL
                let avatarUrl;
                if (data.user.avatar) {
                    // Если аватар уже полный URL - используем как есть
                    if (data.user.avatar.startsWith('http')) {
                        avatarUrl = data.user.avatar;
                    } else {
                        // Формируем полный URL из ID пользователя и хеша аватара
                        avatarUrl = `https://cdn.discordapp.com/avatars/${data.user.discord_id}/${data.user.avatar}.png`;
                    }
                } else {
                    // Используем заглушку, если аватар отсутствует
                    avatarUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAES0lEQVR4nO2dW4hOURTHf2PGbeQ2buNSRrlFJMVQJBrKZTyMmhcvlHjwMCnxYB7IA1FePHiQBw+UJg8uL7wgSmQyt1Lkkmmccss1rq3V6Bubme86Z5+z1/7+tZ9m9tpzzvdb51trr7XXsQqFQqFQKBQKhUKhUMSSFmA/0Ak8A34Av4E+4DVwF9gFNHrIXhgZDl4B+oeQX8AZYJyH/EJnPXA3gBF/JcD/A4tN1VEYLAK+hjDij3JfmaqnMKTAoiuOMoSRi6YqKgRTMJ+I9yoqikZgB/AYyJgqkATmAp8jMKOsVoP1jBF2AL9juYZsMlFZCTQDX2JqRlk9BRqirrQEWAv0J8CMs/G1QiqxMMFmlNXNqCoxbIjVRCqxJYH3jLKa7bLCTVWaUVafgTFuKl9bpRll1e7CkEVVbka5fR91YcgYd1hVa0ZZHQc0pMYdlgLpBJkxYNSQlQk0otfOQNAKMB10UhTv3MH2/4YwbAQuOTDgHDA+7OArgeakGrIc2A1cAz4AX+xBzRm7DTPHYhOw1Z6HNwA7gVvA55hPPT8KO2QdYQ2i8vqy+Qb0AGeBnVZGnG8X9+1rwDpgLfAEyEVswDvCzElXAmeBDykZgUcpbU09BG7YV2oLrLG2OkYt1QjbjCbrHpuNcX9qhrPxepdd04wHHtgjWrk0Y5MdZBftiDWo7ZoxGvhkD87KzRhrD7DKsw33hTVjupWUKi+eRWbGLvspSV1m1FoBQ7kowM2aUS4I3TRDlpqRsQOFouOZESf4NkNl5XJmxGLK6dtJELppxjVgJP7wbYYSm5orx4cRroxoQeGEuM5AKU7kywwjF3WfZqyHBODLDANYU9T9mjEXEoIvM1xjzYzztSzJkxlGsGaGuQ2TDQ7M2AYlXJuhfN0zjBFfMy7YkxsFC6+xA0NmDEICcWlGK5KIKzOmIpG4MGMKkkmUZkyARkgwUZnRAAkn7N2aBtKBCzNGQDpwYUYdpIOwZjRAenBhhvJ5DwPG7rPNkC7CmqF8DAPG1hJbIH2ENaMe0ocLMxSQPsKaoXwOA8bWEkdB+ghjhgrEDGDkYtYI6SSsGcrXCKxLdiBm/iJ3QjoJY4byY126EJiKCgxVTVgzlJ8hrJ/zduBMGcVEGCqbsGYoHxWlJoCFVirqgJXFo0Pxj4k8tYA0EsWXNQqHKDPUVyh3rlBR4MyMN/ZsWs1zHRHFByh6rMn6OhcXPuX4sOmfxEV5LvzMRvE/1Pjnui5Hn4OLdtov5Clc8MF+qOyCoH5u2Av3qd0GK38t1jfgAuvoO0TgL9n3r6QF8Hc7k5wO5P8UKvQXYcYgKi25IsaMz+BvlVsoL0LktReHAvy/ijJEcSmCO7NOpJWgprQBeyLIK7nAgNEj7QL7mOMX+0WMR/YDygOzqwqFQqFQKBQKhUKhUMQC+AOf9S7X9vqvhwAAAABJRU5ErkJggg==";
                }
                
                // Устанавливаем URL аватара
                $('#user-avatar').attr('src', avatarUrl);
                
                $('#user-info').show();
                $('#discord-login').hide();
            } else {
                // Пользователь не авторизован - показываем кнопку входа
                $('#user-info').hide();
                $('#discord-login').show();
            }
        },
        error: function() {
            // Если ошибка, показываем кнопку входа
            $('#user-info').hide();
            $('#discord-login').show();
        }
    });
}

// Добавим эти стили для гарантированной видимости таймера
$('<style>')
  .prop('type', 'text/css')
  .html(`
    .timer {
      position: absolute !important;
      font-size: 48px !important;
      bottom: 10px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      color: yellow !important;
      z-index: 1000 !important;
      display: block !important;
      visibility: visible !important;
    }
    
    /* Анимация для мигающего таймера в последние 5 секунд */
    @keyframes timerFlash {
      0%, 49% {
        color: #ff0000 !important;
        transform: scale(1.2) translateX(-40%) !important;
        text-shadow: 0 0 10px #ff0000 !important;
      }
      50%, 100% {
        color: #ff6b6b !important;
        transform: scale(1) translateX(-50%) !important;
        text-shadow: 0 0 5px #ff0000 !important;
      }
    }
    
    .timer-warning {
      color: #ff0000 !important;
      animation: timerFlash 0.5s infinite !important;
    }
  `)
  .appendTo('head');

// Удалим конфликтующие стили и создадим единое определение для всех иконок
if (!$('#icon-unified-styles').length) {
  // Удаляем предыдущие стили, которые могут конфликтовать
  $('#icon-styles').remove();
  
  $('<style id="icon-unified-styles">')
    .prop('type', 'text/css')
    .html(`
      /* Унифицированный стиль для звезды и сердца */
      .star-icon, .heart-icon {
        font-size: 0.9em !important;  /* Уменьшаем размер чтобы соответствовал тексту */
        display: inline-block !important;
        vertical-align: middle !important;
        line-height: 1 !important;
        position: relative !important;
        top: -0.05em !important; /* Небольшое смещение вверх */
        margin-left: 3px !important;
      }
      
      /* Отменяем все старые стили для звезды */
      .final-score .star-icon, .score .star-icon {
        font-size: 0.9em !important; /* Одинаковый размер везде */
      }
    `)
    .appendTo('head');
}

// Добавляем специальные стили для выравнивания
$('<style id="flex-alignment-styles">')
  .prop('type', 'text/css')
  .html(`
    /* Стили для выравнивания текста и эмодзи */
    .score, #game-lives {
      display: flex !important;
      align-items: center !important;
      gap: 3px !important;
    }
    
    .emoji-part {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 0.9em !important;
      line-height: 1 !important;
    }
    
    /* Отключаем предыдущие стили, которые могут конфликтовать */
    .heart-icon, .star-icon {
      font-size: initial !important;
      display: initial !important;
      vertical-align: initial !important;
      position: initial !important;
      top: initial !important;
      margin-left: initial !important;
    }
  `)
  .appendTo('head');

// Обновляем обработчик для новой кнопки Play
$(document).ready(function() {
    // Заменяем обработчик с #intro-image на #play-button
    $('#play-button').on('click', function() {
        // Добавляем эффект исчезновения для кнопки
        $(this).fadeOut(300);
        
        // Плавно скрываем интро-контейнер
        $('#intro-container').fadeOut(500, function() {
            // Инициализируем игру после исчезновения интро
            const game = new Game($("#game-container"));
            game.startGame();
        });
        
        // Добавляем класс активной игры
        setTimeout(function() {
            $('#game-container').addClass('game-active');
        }, 500);
    });
});

// Модифицируем функцию для сохранения результатов игры через работающий API
function saveGameScore(finalScore, gameTime) {
  // Форматируем время для отображения
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const milliseconds = Math.floor((gameTime * 1000) % 1000);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${String(milliseconds).padStart(3, '0')}`;
  
  
  
  // Используем существующий эндпоинт и правильный формат данных
  $.ajax({
    url: '/api/update-sigma-score',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      score: finalScore,
      time: gameTime,
      timeFormatted: timeFormatted
    }),
    success: function(response) {
    },
    error: function(err) {
    }
  });
}