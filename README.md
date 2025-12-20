# Fixgear Game Server

Бэкенд для моего пет-проекта на Pixi.js — [fixgear-game](https://github.com/StaburovAlexey/fixgear-game). Я фронтенд-разработчик, сервер собирался с помощью нейросети, а сам параллельно учу TypeScript и начинаю практиковаться в тестах.

Стек: Node.js + Fastify, SQLite (better-sqlite3), TypeScript, Telegram WebApp логин.

API повторяет логику фронта: Telegram-логин (`/auth/telegram`), получение пользователя со скором (`/users/:uuid`), апсерт очков (`/scores`), лидерборд (`/scores?chapter_id=&mode_id=`), health (`/health`). При проксировании через nginx используется префикс `/api`.

Данные: схема в `src/db/schema.sql`, дев-сид — `src/db/seeds/dev_seed.sql` (залить: `sqlite3 var/data.sqlite < src/db/seeds/dev_seed.sql`).

О проекте
- Ключевая логика — парсинг Telegram initData, хранение пользователей/очков, лидерборды.
- Сервер собран с помощью нейросети: я сфокусирован на геймплее в Pixi.js и учу TypeScript, параллельно осваиваю написание тестов.
