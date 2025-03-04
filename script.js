// script.js - Основной скрипт для обработки функциональности чата.
// Этот файл должен содержать JavaScript код для обработки событий чата.

// Пример базового кода для отладки:
console.log("script.js loaded");

// Здесь можно добавить логику для обработки отправки сообщений,
// переключения темы, а также другие функции, необходимые вашему чату. 

document.addEventListener('DOMContentLoaded', function() {
  // Удаляем код, который ищет удаленные элементы
  // Оставляем только необходимый функционал
});

document.addEventListener('DOMContentLoaded', () => {
  // Получаем текущий путь
  const currentPath = window.location.pathname;
  
  // Находим все ссылки в навбаре
  const navLinks = document.querySelectorAll('.nav-item');
  
  // Проверяем каждую ссылку
  navLinks.forEach(link => {
    // Убираем слэш в конце пути для корректного сравнения
    const cleanPath = currentPath.replace(/\/$/, '');
    const linkPath = link.getAttribute('href').replace(/\/$/, '');
    if (cleanPath === linkPath) {
      link.classList.add('active');
    }
  });
});

// Добавляем функцию для очистки сессии при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем параметры URL для определения, была ли попытка выхода
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('logout') || urlParams.has('logged_out') || urlParams.has('force_logout')) {
        console.log('Обнаружен параметр выхода, очищаем куки');
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}); 