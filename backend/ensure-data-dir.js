const fs = require('fs');
const path = require('path');

// Функция для создания директории данных, если она не существует
function ensureDataDirectory() {
    // Определяем путь к директории данных
    const dataPath = process.env.NODE_ENV === 'production'
        ? (process.env.RENDER_DATA_PATH || '/data')
        : path.join(__dirname, 'data');
    
    // Проверяем существование директории
    if (!fs.existsSync(dataPath)) {
        try {
            // Создаем директорию, если она не существует
            fs.mkdirSync(dataPath, { recursive: true });
            console.log(`Создана директория данных: ${dataPath}`);
        } catch (error) {
            console.error(`Ошибка при создании директории данных: ${error.message}`);
        }
    } else {
        console.log(`Директория данных уже существует: ${dataPath}`);
    }
    
    return dataPath;
}

module.exports = { ensureDataDirectory };