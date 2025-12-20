# Figear Game Server

Node.js (Fastify) сервер для Figear Game с хранением в SQLite и строгой валидацией Telegram WebApp initData.

## Запуск
```bash
npm install
cp .env.example .env
# задайте TELEGRAM_BOT_TOKEN и путь к БД при необходимости
npm run dev
```

### Переменные окружения
- `PORT` — порт HTTP (по умолчанию `3000`)
- `DATABASE_PATH` — путь до файла SQLite (по умолчанию `var/data.sqlite`)
- `TELEGRAM_BOT_TOKEN` — токен бота из BotFather (обязателен)
- `APP_ORIGIN` — разрешённый origin для CORS (по умолчанию любые)

## БД
Схема в `src/db/schema.sql`. Таблицы `users` и `scores`, уникальность (`uuid`,`chapter_id`,`mode_id`), индексы для лидербордов, триггеры обновления `updated_at`.

## Эндпоинты
- `GET /health` — { status: "ok" }
- `POST /auth/telegram` — `{ initData }` → пользователь с полем `scores`. Подпись Telegram проверяется строго, `username` обновляется при каждом входе.
- `GET /users/:uuid` — пользователь + его `scores`
- `PATCH /users/:uuid/alerts` — `{ alerts: boolean }` → пользователь + `scores`
- `PUT /scores` — `{ uuid, chapter_id, mode_id, score }` → все `scores` пользователя
- `GET /scores?chapter_id=1&mode_id=1` — лидерборд: массив объектов `{ uuid, chapter_id, mode_id, score, user: { name, alerts } }`

## Тесты
```bash
npm test
```

## Наблюдения по фронту
API формы и структуры ответов повторяют логику Supabase-вызовов из `src/api/api.js` фронта: получение/создание пользователя по Telegram, апсерт очков и лидерборды с вложенным `user`.
