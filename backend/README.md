# Backend - Турнирная сетка API

Бекенд часть приложения для управления турнирами по пляжному волейболу.

## Технологии

- **Node.js** - Серверная платформа
- **Express.js** - Веб-фреймворк
- **CORS** - Поддержка кросс-доменных запросов
- **UUID** - Генерация уникальных идентификаторов
- **Body-parser** - Парсинг JSON запросов

## Установка

```bash
npm install
```

## Запуск

### Режим разработки (с автоперезагрузкой)
```bash
npm run dev
```

### Продакшн режим
```bash
npm start
```

Сервер запустится на порту 3000: http://localhost:3000

## API Endpoints

### Турниры
- `GET /api/tournaments` - Получить все турниры
- `POST /api/tournaments` - Создать новый турнир
- `GET /api/tournaments/:id` - Получить турнир по ID
- `PUT /api/tournaments/:id` - Обновить турнир
- `DELETE /api/tournaments/:id` - Удалить турнир

### Команды
- `GET /api/tournaments/:id/teams` - Получить команды турнира
- `POST /api/tournaments/:id/teams` - Добавить команду в турнир
- `PUT /api/teams/:id` - Обновить команду
- `DELETE /api/teams/:id` - Удалить команду

### Турнирная сетка
- `GET /api/tournaments/:id/matches` - Получить матчи турнира
- `POST /api/tournaments/:id/bracket` - Сгенерировать турнирную сетку
- `PUT /api/matches/:id` - Обновить результат матча

### Утилиты
- `DELETE /api/reset` - Сбросить все данные

## Структура данных

### Турнир
```json
{
  "id": "uuid",
  "name": "string",
  "date": "string",
  "participantsCount": "number",
  "seededCount": "number",
  "status": "string",
  "createdAt": "string"
}
```

### Команда
```json
{
  "id": "uuid",
  "name": "string",
  "tournamentId": "uuid",
  "createdAt": "string"
}
```

### Матч
```json
{
  "id": "uuid",
  "tournamentId": "uuid",
  "round": "number",
  "team1": "object",
  "team2": "object",
  "winner": "object",
  "score": "string",
  "status": "string",
  "nextMatchId": "uuid"
}
```

## Особенности

- Данные хранятся в памяти (для продакшена рекомендуется база данных)
- Автоматическая генерация турнирной сетки
- Автоматическое продвижение победителей
- Поддержка турниров с любым количеством команд
- CORS настроен для работы с фронтендом

## Статические файлы

Сервер также обслуживает статические файлы фронтенда из папки `../frontend`.

## Разработка

Для разработки используйте `npm run dev` - это запустит сервер с автоматической перезагрузкой при изменении файлов.