const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');

// Скрипт для переноса данных из SQLite в PostgreSQL
// Добавим позже если нужно 