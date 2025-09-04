# Настройка MySQL для Tournament Grid

## Требования
- MySQL Server 5.7 или выше
- Node.js 14 или выше

## Установка и настройка

### 1. Установка MySQL
Если MySQL не установлен, скачайте и установите его с официального сайта:
https://dev.mysql.com/downloads/mysql/

### 2. Создание базы данных
Выполните один из следующих способов:

#### Способ 1: Через MySQL Command Line
```bash
mysql -u root -p
```
Затем выполните команды из файла `create_mysql_database.sql`:
```sql
source /path/to/create_mysql_database.sql
```

#### Способ 2: Через MySQL Workbench
1. Откройте MySQL Workbench
2. Подключитесь к серверу MySQL
3. Откройте файл `create_mysql_database.sql`
4. Выполните скрипт

### 3. Настройка переменных окружения
Отредактируйте файл `backend/.env` и укажите параметры подключения к вашей базе данных:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=tournament_db
DB_PORT=3306

# Server Configuration
PORT=3000
```

### 4. Установка зависимостей
```bash
cd backend
npm install
```

### 5. Запуск приложения
```bash
npm start
```

## Миграция с SQLite

Если у вас уже есть данные в SQLite, вы можете использовать созданный ранее дамп `tournament_dump.sql` как основу для переноса данных. Однако учтите различия в синтаксисе между SQLite и MySQL:

- SQLite использует `INTEGER PRIMARY KEY AUTOINCREMENT`, MySQL использует `AUTO_INCREMENT`
- Типы данных могут отличаться
- Синтаксис некоторых функций может отличаться

## Проверка подключения

После запуска сервера вы должны увидеть сообщения:
```
Подключение к MySQL базе данных: localhost:3306/tournament_db
Таблица tournaments создана или уже существует.
Таблица teams создана или уже существует.
Таблица matches создана или уже существует.
База данных инициализирована успешно.
Сервер запущен на порту 3000
```

## Устранение неполадок

### Ошибка подключения
- Убедитесь, что MySQL сервер запущен
- Проверьте правильность параметров в `.env` файле
- Убедитесь, что пользователь имеет права доступа к базе данных

### Ошибка "Access denied"
- Проверьте имя пользователя и пароль
- Убедитесь, что пользователь имеет права на создание баз данных и таблиц

### Ошибка "Database does not exist"
- Выполните скрипт `create_mysql_database.sql` для создания базы данных