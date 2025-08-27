// Скрипт для работы турнирной сетки
// Использует функции из main.js без их изменения

// Глобальные переменные для совместимости с main.js
if (typeof comandy === 'undefined') {
    window.comandy = [];
}
if (typeof s === 'undefined') {
    window.s = 0;
}

// Функция загрузки команд из текстового поля
function loadTeams() {
    const textarea = document.getElementById('teams-textarea');
    const teamsText = textarea.value.trim();
    
    if (!teamsText) {
        alert('Введите команды!');
        return;
    }
    
    // Очищаем массив команд
    comandy.length = 0;
    
    // Разбиваем текст на строки и добавляем команды
    const teams = teamsText.split('\n').filter(team => team.trim() !== '');
    
    teams.forEach(team => {
        comandy.push(team.trim());
    });
    
    // Обновляем отображение команд
    displayTeams();
    
    console.log('Загружено команд:', comandy.length);
}

// Функция отображения списка команд
function displayTeams() {
    const teamsDisplay = document.getElementById('teams-display');
    
    if (comandy.length === 0) {
        teamsDisplay.innerHTML = '<p class="no-teams">Команды не загружены</p>';
        return;
    }
    
    let html = '<div class="teams-grid">';
    
    comandy.forEach((team, index) => {
        html += `
            <div class="team-item">
                <span class="team-number">${index + 1}</span>
                <span class="team-name">${team}</span>
            </div>
        `;
    });
    
    html += '</div>';
    html += `<p class="teams-count">Всего команд: ${comandy.length}</p>`;
    
    teamsDisplay.innerHTML = html;
}

// Функция генерации турнирной сетки
function generateBracket() {
    if (comandy.length < 2) {
        alert('Для создания турнира нужно минимум 2 команды!');
        return;
    }
    
    // Вычисляем размер сетки (степень двойки)
    s = Math.ceil(Math.log(comandy.length) / Math.log(2));
    
    console.log('Размер сетки:', s, 'для', comandy.length, 'команд');
    
    // Проверяем, что у нас есть нужная сетка
    if (!setka || !setka[s]) {
        alert('Сетка для ' + Math.pow(2, s) + ' команд не поддерживается!');
        return;
    }
    
    // Инициализируем сетку, используя существующую структуру
    initializeBracket();
    
    // Заполняем первый раунд командами
    fillFirstRound();
    
    // Используем существующую функцию write_table для отображения
    if (typeof write_table === 'function') {
        write_table(s);
    } else {
        console.error('Функция write_table не найдена в main.js');
    }
    
    console.log('Турнирная сетка создана');
}

// Инициализация структуры турнира
function initializeBracket() {
    // Очищаем предыдущие результаты в сетке
    for (let i = 1; i < setka[s].length; i++) {
        const match = setka[s][i];
        // Сохраняем только структуру связей, убираем результаты
        if (match.length > 4) {
            match.splice(4); // Удаляем результат матча
        }
        if (match.length > 2) {
            // Очищаем участников (будут заполнены заново)
            if (i <= Math.pow(2, s-1)) {
                // Для первого раунда оставляем места для команд
                match[2] = undefined;
                match[3] = undefined;
            }
        }
    }
}

// Заполнение первого раунда командами
function fillFirstRound() {
    const firstRoundMatches = Math.pow(2, s-1);
    const totalSlots = Math.pow(2, s);
    
    // Создаем массив слотов для команд
    const slots = new Array(totalSlots);
    
    // Заполняем слоты командами
    for (let i = 0; i < comandy.length; i++) {
        slots[i] = i;
    }
    
    // Заполняем матчи первого раунда
    for (let matchIndex = 1; matchIndex <= firstRoundMatches; matchIndex++) {
        const team1Index = slots[(matchIndex - 1) * 2];
        const team2Index = slots[(matchIndex - 1) * 2 + 1];
        
        // Устанавливаем команды в матч
        if (team1Index !== undefined) {
            setka[s][matchIndex][2] = team1Index;
        }
        if (team2Index !== undefined) {
            setka[s][matchIndex][3] = team2Index;
        }
        
        // Если одна из команд отсутствует (нечетное количество), создаем "bye"
        if (team1Index !== undefined && team2Index === undefined) {
            // Автоматически проходит первая команда
            if (typeof rezult === 'function') {
                setTimeout(() => rezult(matchIndex, 0, 1), 100);
            }
        } else if (team1Index === undefined && team2Index !== undefined) {
            // Автоматически проходит вторая команда
            if (typeof rezult === 'function') {
                setTimeout(() => rezult(matchIndex, 1, 1), 100);
            }
        }
    }
}

// Функция сброса турнира
function resetTournament() {
    if (confirm('Вы уверены, что хотите сбросить турнир?')) {
        // Очищаем команды
        comandy.length = 0;
        
        // Очищаем отображение
        displayTeams();
        
        // Очищаем турнирную сетку
        const tablElement = document.getElementById('tabl');
        if (tablElement) {
            tablElement.innerHTML = '';
        }
        
        // Очищаем текстовое поле
        const textarea = document.getElementById('teams-textarea');
        if (textarea) {
            textarea.value = '';
        }
        
        console.log('Турнир сброшен');
    }
}

// Функция перемешивания команд
function shuffleTeams() {
    if (comandy.length < 2) {
        alert('Недостаточно команд для перемешивания!');
        return;
    }
    
    // Перемешиваем массив команд
    for (let i = comandy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [comandy[i], comandy[j]] = [comandy[j], comandy[i]];
    }
    
    // Обновляем отображение
    displayTeams();
    
    console.log('Команды перемешаны');
}



// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tournament.js загружен');
    
    // Добавляем обработчик для кнопки генерации расписания
    const generateScheduleBtn = document.querySelector('.generate-schedule-btn');
    if (generateScheduleBtn) {
        generateScheduleBtn.addEventListener('click', generateSchedule);
    }
    
    // Инициализируем отображение команд
    displayTeams();
});

// Экспортируем функции для глобального использования
window.loadTeams = loadTeams;
window.displayTeams = displayTeams;
window.generateBracket = generateBracket;
window.resetTournament = resetTournament;
window.shuffleTeams = shuffleTeams;
