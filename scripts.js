// Основные переменные состояния приложения
let tournaments = [];
let currentTournament = null;
let teams = [];
let bracketData = null;
let isEditMode = false;
let matchSchedule = [];

// DOM элементы
const tournamentsContainer = document.getElementById('tournaments-container');
const participantsCount = document.getElementById('participants-count');
const seededCount = document.getElementById('seeded-count');
const tournamentDate = document.getElementById('tournament-date');
const toggleEditBtn = document.getElementById('toggle-edit-btn');
const teamsInputSection = document.getElementById('teams-input-section');
const teamsList = document.getElementById('teams-list');
const addTeamInputBtn = document.getElementById('add-team-input-btn');
const saveTeamsBtn = document.getElementById('save-teams-btn');
const bracketContainer = document.getElementById('bracket-container');
const scheduleBody = document.getElementById('schedule-body');
const createTournamentBtn = document.getElementById('create-tournament-btn');
const generateBracketBtn = document.getElementById('generate-bracket-btn');
const tournamentModal = document.getElementById('tournament-modal');
const closeModalBtn = document.querySelector('.close');
const tournamentForm = document.getElementById('tournament-form');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных из localStorage
    loadData();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Отображение данных
    renderTournaments();
    updateTournamentInfo();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.getElementById('clear-bracket-btn').addEventListener('click', clearBracket);
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Обновление активной ссылки в навигации
            document.querySelectorAll('.main-nav a').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
function clearBracket() {
    if (confirm('Вы уверены, что хотите очистить турнирную сетку? Все данные будут удалены.')) {
        bracketData = null;
        matchSchedule = [];
        saveData();
        
        // Перерисовываем интерфейс
        renderBracket();
        renderSchedule();
        
        alert('Турнирная сетка очищена!');
    }
}
    // Переключение режима редактирования
    toggleEditBtn.addEventListener('click', toggleEditMode);
    
    // Добавление поля для ввода команды
    addTeamInputBtn.addEventListener('click', addTeamInputField);
    
    // Сохранение команд
    saveTeamsBtn.addEventListener('click', saveTeams);
    
    // Создание турнира
    createTournamentBtn.addEventListener('click', showTournamentModal);
    
    // Закрытие модального окна
    closeModalBtn.addEventListener('click', closeTournamentModal);
    
    // Обработка отправки формы турнира
    tournamentForm.addEventListener('submit', handleTournamentSubmit);
    
    // Генерация турнирной сетки
    generateBracketBtn.addEventListener('click', generateBracket);
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        if (e.target === tournamentModal) {
            closeTournamentModal();
        }
    });
}

// Загрузка данных из localStorage
function loadData() {
    const savedTournaments = localStorage.getItem('volleyballTournaments');
    const savedTeams = localStorage.getItem('volleyballTeams');
    const savedBracket = localStorage.getItem('volleyballBracket');
    const savedSchedule = localStorage.getItem('volleyballSchedule');
    
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    }
    
    if (savedBracket) {
        bracketData = JSON.parse(savedBracket);
    }
    
    if (savedSchedule) {
        matchSchedule = JSON.parse(savedSchedule);
    }
    
    // Если есть турниры, устанавливаем первый как текущий
    if (tournaments.length > 0) {
        currentTournament = tournaments[0];
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('volleyballTournaments', JSON.stringify(tournaments));
    localStorage.setItem('volleyballTeams', JSON.stringify(teams));
    localStorage.setItem('volleyballBracket', JSON.stringify(bracketData));
    localStorage.setItem('volleyballSchedule', JSON.stringify(matchSchedule));
}

// Отображение секции
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Переключение режима редактирования
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        toggleEditBtn.textContent = 'Режим просмотра';
        teamsInputSection.style.display = 'block';
        renderTeamInputs();
    } else {
        toggleEditBtn.textContent = 'Режим редактирования';
        teamsInputSection.style.display = 'none';
    }
    
    renderBracket();
}

// Добавление поля для ввода команды
function addTeamInputField() {
    const teamInput = document.createElement('div');
    teamInput.className = 'team-input';
    teamInput.innerHTML = `
        <input type="text" placeholder="Название команды" class="team-name-input">
        <button type="button" class="remove-team-btn"><i class="fas fa-times"></i></button>
    `;
    
    teamInput.querySelector('.remove-team-btn').addEventListener('click', function() {
        teamInput.remove();
    });
    
    teamsList.appendChild(teamInput);
}

// Отображение полей для ввода команд
function renderTeamInputs() {
    teamsList.innerHTML = '';
    
    teams.forEach((team, index) => {
        const teamInput = document.createElement('div');
        teamInput.className = 'team-input';
        teamInput.innerHTML = `
            <input type="text" placeholder="Название команды" 
                   class="team-name-input" value="${team.name}" data-index="${index}">
            <button type="button" class="remove-team-btn"><i class="fas fa-times"></i></button>
        `;
        
        teamInput.querySelector('.remove-team-btn').addEventListener('click', function() {
            teams.splice(index, 1);
            saveData();
            renderTeamInputs();
        });
        
        teamsList.appendChild(teamInput);
    });
    
    // Добавляем одно пустое поле для новой команды
    addTeamInputField();
}

// Сохранение команд
function saveTeams() {
    const teamInputs = document.querySelectorAll('.team-name-input');
    const newTeams = [];
    
    teamInputs.forEach(input => {
        const teamName = input.value.trim();
        if (teamName) {
            newTeams.push({
                name: teamName,
                id: Date.now() + Math.random().toString(16).slice(2)
            });
        }
    });
    
    teams = newTeams;
    saveData();
    alert('Команды сохранены!');
    
    // Обновляем счетчик участников
    updateTournamentInfo();
}

// Обновление информации о турнире
function updateTournamentInfo() {
    participantsCount.textContent = teams.length;
    seededCount.textContent = Math.min(4, teams.length); // Пример: 4 сеянных команды
    
    if (currentTournament) {
        tournamentDate.textContent = formatDate(currentTournament.date);
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Показ модального окна создания турнира
function showTournamentModal() {
    tournamentModal.style.display = 'block';
}

// Закрытие модального окна
function closeTournamentModal() {
    tournamentModal.style.display = 'none';
    tournamentForm.reset();
}

// Обработка отправки формы турнира
function handleTournamentSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('tournament-name').value;
    const date = document.getElementById('tournament-date-input').value;
    const location = document.getElementById('tournament-location').value;
    
    const newTournament = {
        id: Date.now().toString(),
        name,
        date,
        location,
        createdAt: new Date().toISOString()
    };
    
    tournaments.push(newTournament);
    currentTournament = newTournament;
    
    saveData();
    renderTournaments();
    updateTournamentInfo();
    closeTournamentModal();
    
    alert('Турнир создан успешно!');
}

// Отображение списка турниров
function renderTournaments() {
    tournamentsContainer.innerHTML = '';
    
    if (tournaments.length === 0) {
        tournamentsContainer.innerHTML = '<p>Нет созданных турниров</p>';
        return;
    }
    
    tournaments.forEach(tournament => {
        const tournamentEl = document.createElement('div');
        tournamentEl.className = 'tournament-item';
        if (currentTournament && tournament.id === currentTournament.id) {
            tournamentEl.classList.add('active');
        }
        
        tournamentEl.innerHTML = `
            <h3>${tournament.name}</h3>
            <p>Дата: ${formatDate(tournament.date)}</p>
            <p>Место: ${tournament.location}</p>
            <button class="select-tournament-btn">Выбрать</button>
        `;
        
        tournamentEl.querySelector('.select-tournament-btn').addEventListener('click', () => {
            currentTournament = tournament;
            renderTournaments();
            updateTournamentInfo();
            
            // Если есть данные сетки, отображаем их
            if (bracketData) {
                renderBracket();
                renderSchedule();
            }
        });
        
        tournamentsContainer.appendChild(tournamentEl);
    });
}

// Генерация турнирной сетки
function generateBracket() {
    if (teams.length < 2) {
        alert('Для генерации сетки нужно минимум 2 команды!');
        return;
    }
    
    // Очищаем предыдущие данные
    bracketData = null;
    matchSchedule = [];
    
    // Создаем начальную сетку
    const bracket = createInitialBracket(teams);
    bracketData = bracket;
    
    // Генерируем расписание матчей
    generateSchedule(bracket);
    
    saveData();
    
    // Переключаемся на раздел турнирной сетки
    showSection('tournament-bracket-section');
    document.querySelector('[data-section="tournament-bracket-section"]').classList.add('active');
    document.querySelector('[data-section="tournaments-list"]').classList.remove('active');
    
    // Отображаем сетку и расписание
    renderBracket();
    renderSchedule();
}

// Создание начальной турнирной сетки
function createInitialBracket(teams) {
    const teamCount = teams.length;
    
    // Определяем количество раундов
    const rounds = Math.ceil(Math.log2(teamCount));
    const bracketSize = Math.pow(2, rounds);
    
    // Создаем структуру сетки
    const bracket = {
        rounds: [],
        thirdPlaceMatch: null // Матч за 3-е место
    };
    
    // Заполняем сетку раундами
    for (let i = 0; i < rounds; i++) {
        const matchCount = Math.pow(2, rounds - i - 1);
        const round = {
            name: getRoundName(i, rounds),
            matches: []
        };
        
        for (let j = 0; j < matchCount; j++) {
            round.matches.push({
                id: `round-${i}-match-${j}`,
                team1: null,
                team2: null,
                winner: null,
                loser: null, // Для матча за 3-е место
                score: null,
                completed: false
            });
        }
        
        bracket.rounds.push(round);
    }
    
    // Добавляем матч за 3-е место
    bracket.thirdPlaceMatch = {
        id: 'third-place-match',
        team1: null,
        team2: null,
        winner: null,
        score: null,
        completed: false
    };
    
    // Заполняем первый раунд командами
    const firstRound = bracket.rounds[0];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5); // Перемешиваем команды
    
    for (let i = 0; i < firstRound.matches.length; i++) {
        const match = firstRound.matches[i];
        
        if (i * 2 < shuffledTeams.length) {
            match.team1 = shuffledTeams[i * 2];
        }
        
        if (i * 2 + 1 < shuffledTeams.length) {
            match.team2 = shuffledTeams[i * 2 + 1];
        }
        
        // Если команда только одна в матче (нечетное количество), она проходит автоматически
        if (match.team1 && !match.team2) {
            match.winner = match.team1;
            match.completed = true;
        } else if (!match.team1 && match.team2) {
            match.winner = match.team2;
            match.completed = true;
        }
    }
    
    // Немедленно обновляем следующие раунды для автоматически прошедших команд
    firstRound.matches.forEach(match => {
        if (match.completed && match.winner) {
            updateNextMatches(match, match.winner, null);
        }
    });
    
    return bracket;
}


// Получение названия раунда
function getRoundName(roundIndex, totalRounds) {
    const roundNames = [
        'Финал',
        'Полуфинал', 
        'Четвертьфинал',
        '1/8 финала',
        '1/16 финала'
    ];
    
    const difference = totalRounds - roundIndex - 1;
    
    if (difference < roundNames.length) {
        return roundNames[difference];
    }
    
    return `Раунд ${roundIndex + 1}`;
}


// Генерация расписания матчей
function generateSchedule(bracket) {
    matchSchedule = [];
    
    // Генерируем даты и время для матчей
    const startDate = currentTournament ? new Date(currentTournament.date) : new Date();
    let matchDateTime = new Date(startDate);
    matchDateTime.setHours(10, 0, 0, 0);
    
    // Проходим по всем раундам и матчам
    bracket.rounds.forEach((round, roundIndex) => {
        round.matches.forEach(match => {
            // Для первого раунда пропускаем матчи с "пустышкой"
            if (roundIndex === 0 && match.isBye) {
                return;
            }
            
            // Для последующих раундов пропускаем матчи, где нет двух команд
            if (roundIndex > 0 && (!match.team1 || !match.team2)) {
                return;
            }
            
            // Пропускаем завершенные матчи
            if (match.completed) {
                return;
            }
            
            // Добавляем матч в расписание
            matchSchedule.push({
                round: round.name,
                team1: match.team1 ? match.team1.name : ' ',
                team2: match.team2 ? match.team2.name : ' ',
                date: matchDateTime.toLocaleDateString('ru-RU'),
                time: matchDateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                court: `Площадка ${Math.floor(Math.random() * 3) + 1}`,
                matchId: match.id
            });
            
            // Добавляем 30 минут между матчами
            matchDateTime.setMinutes(matchDateTime.getMinutes() + 30);
        });
        
        // Добавляем перерыв между раундами (2 часа)
        matchDateTime.setHours(matchDateTime.getHours() + 2);
    });
}

// Отображение турнирной сетки
function renderBracket() {
    if (!bracketData) {
        bracketContainer.innerHTML = '<p>Турнирная сетка не сгенерирована</p>';
        return;
    }
    
    bracketContainer.innerHTML = '';
    
    // Создаем контейнер для сетки
    const bracketEl = document.createElement('div');
    bracketEl.className = 'bracket';
    
    // Добавляем раунды
    bracketData.rounds.forEach(round => {
        const roundEl = document.createElement('div');
        roundEl.className = 'round';
        
        const roundTitle = document.createElement('h3');
        roundTitle.textContent = round.name;
        roundEl.appendChild(roundTitle);
        
        const matchesEl = document.createElement('div');
        matchesEl.className = 'matches';
        
        round.matches.forEach(match => {
            const matchEl = createMatchElement(match, round);
            matchesEl.appendChild(matchEl);
        });
        
        roundEl.appendChild(matchesEl);
        bracketEl.appendChild(roundEl);
    });
    
    bracketContainer.appendChild(bracketEl);
}
// Создание элемента матча
function createMatchElement(match, round) {
    const matchEl = document.createElement('div');
    matchEl.className = 'match';
    matchEl.dataset.matchId = match.id;
    
    let team1Name = match.team1 ? match.team1.name : 'TBD';
    let team2Name = match.team2 ? match.team2.name : 'TBD';
    let scoreDisplay = '';
    
    if (match.completed && match.score) {
        scoreDisplay = `<div class="match-score">${match.score}</div>`;
        if (match.winner && match.team1 && match.winner.id === match.team1.id) {
            team1Name = `${team1Name} ✓`;
        } else if (match.winner && match.team2 && match.winner.id === match.team2.id) {
            team2Name = `${team2Name} ✓`;
        }
    }
    
    matchEl.innerHTML = `
        <div class="match-team team1 ${match.winner && match.team1 && match.winner.id === match.team1.id ? 'winner' : ''}">
            ${team1Name}
        </div>
        <div class="match-team team2 ${match.winner && match.team2 && match.winner.id === match.team2.id ? 'winner' : ''}">
            ${team2Name}
        </div>
        ${scoreDisplay}
        ${isEditMode && !match.completed && match.team1 && match.team2 ? 
            `<div class="match-actions">
                <input type="text" placeholder="Счет (например: 2:1)" class="score-input">
                <button class="select-winner-btn" data-winner="team1">${match.team1.name}</button>
                <button class="select-winner-btn" data-winner="team2">${match.team2.name}</button>
            </div>` : ''
        }
    `;
    
    // Добавляем обработчики для кнопок выбора победителя
    if (isEditMode && !match.completed && match.team1 && match.team2) {
        matchEl.querySelectorAll('.select-winner-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const winnerTeam = this.dataset.winner === 'team1' ? match.team1 : match.team2;
                const scoreInput = matchEl.querySelector('.score-input');
                const score = scoreInput ? scoreInput.value : null;
                setMatchWinner(match, winnerTeam, score);
            });
        });
    }
    
    return matchEl;
}

// Установка победителя матча
function setMatchWinner(match, winner, score) {
    const loser = match.team1 && match.team1.id === winner.id ? match.team2 : match.team1;
    
    match.winner = winner;
    match.loser = loser;
    match.score = score;
    match.completed = true;
    
    // Обновляем следующие матчи в сетке
    updateNextMatches(match, winner, loser);
    
    saveData();
    renderBracket();
    renderSchedule();
}

// Обновление следующих матчей в сетке
function updateNextMatches(currentMatch, winner, loser) {
    if (!bracketData) return;
    
    const matchId = currentMatch.id;
    const [_, roundIndex, __, matchIndex] = matchId.split('-');
    const currentRoundIndex = parseInt(roundIndex);
    const currentMatchIndex = parseInt(matchIndex);
    
    // Сохраняем проигравшего для матча за 3-е место
    if (loser && currentRoundIndex === bracketData.rounds.length - 2) { // Полуфинал
        if (!bracketData.thirdPlaceMatch.team1) {
            bracketData.thirdPlaceMatch.team1 = loser;
        } else if (!bracketData.thirdPlaceMatch.team2) {
            bracketData.thirdPlaceMatch.team2 = loser;
        }
    }
    
    // Если это не последний раунд
    if (currentRoundIndex < bracketData.rounds.length - 1) {
        const nextRound = bracketData.rounds[currentRoundIndex + 1];
        const nextMatchIndex = Math.floor(currentMatchIndex / 2);
        
        if (nextMatchIndex < nextRound.matches.length) {
            const nextMatch = nextRound.matches[nextMatchIndex];
            
            // Определяем, в какую позицию (team1 или team2) нужно поставить победителя
            if (currentMatchIndex % 2 === 0) {
                nextMatch.team1 = winner;
            } else {
                nextMatch.team2 = winner;
            }
        }
    }
}


// Отображение расписания матчей
function renderSchedule() {
    scheduleBody.innerHTML = '';
    
    if (matchSchedule.length === 0) {
        scheduleBody.innerHTML = '<tr><td colspan="6">Расписание матчей не сгенерировано</td></tr>';
        return;
    }
    
    matchSchedule.forEach(match => {
        const row = document.createElement('tr');
        
        // Находим соответствующий матч в сетке
        const bracketMatch = findMatchInBracket(match.matchId);
        
        // Если матч завершен, добавляем специальное оформление
        const isCompleted = bracketMatch && bracketMatch.completed;
        
        row.innerHTML = `
            <td>${match.round}</td>
            <td class="${isCompleted && bracketMatch.winner && bracketMatch.team1 && bracketMatch.winner.id === bracketMatch.team1.id ? 'winner' : ''}">${match.team1}</td>
            <td class="${isCompleted && bracketMatch.winner && bracketMatch.team2 && bracketMatch.winner.id === bracketMatch.team2.id ? 'winner' : ''}">${match.team2}</td>
            <td>${match.date}</td>
            <td>${match.time}</td>
            <td>${match.court}</td>
        `;
        
        scheduleBody.appendChild(row);
    });
}

// Поиск матча в сетке по ID
function findMatchInBracket(matchId) {
    if (!bracketData) return null;
    
    for (const round of bracketData.rounds) {
        for (const match of round.matches) {
            if (match.id === matchId) {
                return match;
            }
        }
    }
    
    return null;
}