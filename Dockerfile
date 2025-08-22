# Используем официальный образ Node.js
FROM node:18-alpine

# Создаем директорию приложения
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY backend/package*.json ./backend/

# Устанавливаем зависимости
RUN npm install
RUN cd backend && npm install

# Копируем исходный код
COPY . .

# Создаем директорию для данных
RUN mkdir -p /data

# Указываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]