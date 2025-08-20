document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Загружаем SQL.js
        const initSqlJs = window.initSqlJs;
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Создаем базу данных в памяти
        const db = new SQL.Database();

        // Создаем таблицы и вставляем тестовые данные
        initializeDatabase(db);
        
        // Инициализация интерфейса
        initializeUI(db);

    } catch (error) {
        console.error('Error initializing database:', error);
        showError('Ошибка инициализации базы данных');
    }
});

function initializeDatabase(db) {
    // Создаем таблицы
    const sql = `
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            stage_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id),
            FOREIGN KEY (stage_id) REFERENCES stages (id)
        );

        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id INTEGER NOT NULL,
            match_number TEXT NOT NULL,
            round_name TEXT NOT NULL,
            team1_id INTEGER NOT NULL,
            team2_id INTEGER NOT NULL,
            team1_score INTEGER DEFAULT 0,
            team2_score INTEGER DEFAULT 0,
            winner_id INTEGER,
            match_order INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Вставляем тестовые данные
        INSERT OR IGNORE INTO categories (name) VALUES 
        ('Мужчины'), ('Женщины');

        INSERT OR IGNORE INTO stages (name) VALUES 
        ('Финал'), ('Групповой этап'), ('Плей-офф');

        INSERT OR IGNORE INTO teams (name) VALUES 
        ('Иванов/Петров'),
        ('Сидоров/Кузнецов'),
        ('Смирнов/Попов'),
        ('Васильев/Морозов'),
        ('Волков/Алексеев'),
        ('Новиков/Фёдоров'),
        ('Егоров/Павлов'),
        ('Соколов/Орлов'),
        ('Ковалёва/Новикова'),
        ('Петрова/Сидорова'),
        ('Смирнова/Иванова'),
        ('Кузнецова/Попова');

        INSERT OR IGNORE INTO tournaments (category_id, stage_id, name) 
        VALUES (1, 3, 'Кубок победителей 2023'),
               (2, 3, 'Кубок победителей 2023');

        INSERT OR IGNORE INTO matches (tournament_id, match_number, round_name, team1_id, team2_id, team1_score, team2_score, winner_id, match_order) VALUES
        -- Мужчины
        (1, 'М1', '1/8 финала', 1, 2, 21, 18, 1, 1),
        (1, 'М2', '1/8 финала', 3, 4, 19, 21, 4, 2),
        (1, 'М3', '1/4 финала', 1, 4, 21, 19, 1, 3),
        (1, 'М4', '1/4 финала', 5, 6, 17, 21, 6, 4),
        (1, 'М5', '1/2 финала', 1, 6, 21, 15, 1, 5),
        (1, 'М6', '1/2 финала', 7, 8, 21, 23, 8, 6),
        (1, 'М7', 'Финал', 1, 8, 21, 18, 1, 7),
        
        -- Женщины
        (2, 'Ж1', '1/4 финала', 9, 10, 21, 17, 9, 8),
        (2, 'Ж2', '1/4 финала', 11, 12, 19, 21, 12, 9),
        (2, 'Ж3', '1/2 финала', 9, 12, 21, 19, 9, 10),
        (2, 'Ж4', 'Финал', 9, 11, 21, 16, 9, 11);
    `;

    db.exec(sql);
}

function initializeUI(db) {
    const categorySelect = document.getElementById('category');
    const stageSelect = document.getElementById('stage');
    const updateBtn = document.getElementById('update-btn');
    const bracketContainer = document.getElementById('tournament-bracket');

    // Заполняем выпадающие списки данными из БД
    populateSelects(db);

    // Загружаем начальные данные
    loadMatches(db);

    // Обработчик кнопки обновления
    updateBtn.addEventListener('click', () => loadMatches(db));

    // Обработчики изменений в select
    categorySelect.addEventListener('change', () => loadMatches(db));
    stageSelect.addEventListener('change', () => loadMatches(db));

    // Обработчики для навигационного меню
    setupNavigation();
}

function populateSelects(db) {
    const categorySelect = document.getElementById('category');
    const stageSelect = document.getElementById('stage');

    // Заполняем категории
    const categories = db.exec("SELECT name FROM categories");
    if (categories[0]) {
        categorySelect.innerHTML = '';
        categories[0].values.forEach(([name]) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            categorySelect.appendChild(option);
        });
    }

    // Заполняем стадии
    const stages = db.exec("SELECT name FROM stages");
    if (stages[0]) {
        stageSelect.innerHTML = '';
        stages[0].values.forEach(([name]) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            stageSelect.appendChild(option);
        });
    }
}

function loadMatches(db) {
    const categorySelect = document.getElementById('category');
    const stageSelect = document.getElementById('stage');
    const bracketContainer = document.getElementById('tournament-bracket');

    const selectedCategory = categorySelect.value;
    const selectedStage = stageSelect.value;

    const sql = `
        SELECT 
            m.id,
            m.match_number,
            m.round_name,
            t1.name as team1,
            t2.name as team2,
            m.team1_score,
            m.team2_score,
            tw.name as winner,
            c.name as category,
            s.name as stage
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN teams tw ON m.winner_id = tw.id
        JOIN tournaments t ON m.tournament_id = t.id
        JOIN categories c ON t.category_id = c.id
        JOIN stages s ON t.stage_id = s.id
        WHERE c.name = ? AND s.name = ?
        ORDER BY m.match_order
    `;

    try {
        const stmt = db.prepare(sql);
        stmt.bind([selectedCategory, selectedStage]);
        
        const matches = [];
        while (stmt.step()) {
            matches.push(stmt.getAsObject());
        }
        stmt.free();

        displayMatches(matches);
    } catch (error) {
        console.error('Error loading matches:', error);
        showError('Ошибка загрузки матчей');
    }
}

function displayMatches(matches) {
    const bracketContainer = document.getElementById('tournament-bracket');
    bracketContainer.innerHTML = '';
    
    if (matches.length === 0) {
        bracketContainer.innerHTML = '<p class="no-matches">Матчи не найдены для выбранных фильтров</p>';
        return;
    }

    const matchesByRound = groupMatchesByRound(matches);
    
    // Создаем сетку для каждого раунда
    Object.keys(matchesByRound).forEach(roundName => {
        createRoundBracket(roundName, matchesByRound[roundName]);
    });
}

function groupMatchesByRound(matches) {
    return matches.reduce((groups, match) => {
        const round = match.round_name;
        if (!groups[round]) {
            groups[round] = [];
        }
        groups[round].push(match);
        return groups;
    }, {});
}

function createRoundBracket(roundName, matches) {
    const roundSection = document.createElement('div');
    roundSection.className = 'round-section';
    
    const roundTitle = document.createElement('h3');
    roundTitle.className = 'round-title';
    roundTitle.textContent = roundName;
    roundSection.appendChild(roundTitle);
    
    const matchesContainer = document.createElement('div');
    matchesContainer.className = 'matches-container';
    
    matches.forEach(match => {
        const matchElement = createMatchElement(match);
        matchesContainer.appendChild(matchElement);
    });
    
    roundSection.appendChild(matchesContainer);
    document.getElementById('tournament-bracket').appendChild(roundSection);
}

function createMatchElement(match) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match';
    matchDiv.dataset.id = match.id;
    
    const matchHeader = document.createElement('div');
    matchHeader.className = 'match-header';
    matchHeader.innerHTML = `
        <span class="match-number">${match.match_number}</span>
        <span class="match-category">${match.category}</span>
    `;
    
    const teamsDiv = document.createElement('div');
    teamsDiv.className = 'teams';
    
    const team1 = createTeamElement(match.team1, match.team1_score, match.winner === match.team1);
    const team2 = createTeamElement(match.team2, match.team2_score, match.winner === match.team2);
    
    teamsDiv.appendChild(team1);
    teamsDiv.appendChild(team2);
    
    const matchFooter = document.createElement('div');
    matchFooter.className = 'match-footer';
    matchFooter.innerHTML = `
        <span class="match-stage">${match.stage}</span>
        ${match.winner ? `<span class="match-winner">Победитель: ${match.winner}</span>` : ''}
    `;
    
    matchDiv.appendChild(matchHeader);
    matchDiv.appendChild(teamsDiv);
    matchDiv.appendChild(matchFooter);
    
    return matchDiv;
}

function createTeamElement(teamName, score, isWinner) {
    const teamDiv = document.createElement('div');
    teamDiv.className = `team ${isWinner ? 'winner' : ''}`;
    
    teamDiv.innerHTML = `
        <span class="team-name">${teamName}</span>
        <span class="team-score">${score !== null && score !== undefined ? score : '-'}</span>
    `;
    
    return teamDiv;
}

function showError(message) {
    const bracketContainer = document.getElementById('tournament-bracket');
    bracketContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="location.reload()">Попробовать снова</button>
        </div>
    `;
}

function setupNavigation() {
    const navItems = document.querySelectorAll('#nav-menu li');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.querySelector('.dropdown')) {
                e.preventDefault();
                const dropdown = this.querySelector('.dropdown');
                dropdown.classList.toggle('show');
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('#nav-menu li')) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
}

// Загрузка данных турнира из базы данных
function loadTournamentData() {
    if (!database) {
        console.error('Database not initialized');
        return;
    }

    try {
        // Получаем данные из localStorage
        const data = database.getData();
        if (!data) {
            console.error('No data found in database');
            return;
        }

        // Обновляем информацию о турнире
        if (data.tournaments.length > 0) {
            const tournament = data.tournaments[0];
            tournamentData.name = tournament.name;
            tournamentData.date = tournament.date;
            tournamentData.location = tournament.location;
        }

        // Создаем карту команд
        const teams = {};
        data.teams.forEach(team => {
            teams[team.id] = team.name;
        });

        // Группируем матчи по раундам
        tournamentData.matches = {};
        data.matches.forEach(match => {
            if (!tournamentData.matches[match.round_name]) {
                tournamentData.matches[match.round_name] = [];
            }
            
            const winner = match.winner_id ? (match.winner_id === match.team1_id ? 'team1' : 'team2') : null;
            
            tournamentData.matches[match.round_name].push({
                team1: teams[match.team1_id] || 'TBD',
                team2: teams[match.team2_id] || 'TBD',
                score1: match.team1_score,
                score2: match.team2_score,
                winner: winner
            });
        });

        console.log('Tournament data loaded:', tournamentData);
    } catch (error) {
        console.error('Error loading tournament data:', error);
    }
}

// Глобальные функции для работы с матчами
window.addMatch = function(matchData) {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    database.addMatch(matchData, (err, result) => {
        if (err) {
            console.error('Error adding match:', err);
        } else {
            console.log('Match added successfully:', result);
            loadTournamentData(); // Перезагружаем данные
            if (typeof renderTournamentBracket === 'function') {
                renderTournamentBracket(); // Перерисовываем сетку
            }
        }
    });
};

window.editMatch = function(matchId, matchData) {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    database.updateMatch(matchId, matchData, (err, result) => {
        if (err) {
            console.error('Error updating match:', err);
        } else {
            console.log('Match updated successfully:', result);
            loadTournamentData(); // Перезагружаем данные
            if (typeof renderTournamentBracket === 'function') {
                renderTournamentBracket(); // Перерисовываем сетку
            }
        }
    });
};

window.deleteMatch = function(matchId) {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    database.deleteMatch(matchId, (err, result) => {
        if (err) {
            console.error('Error deleting match:', err);
        } else {
            console.log('Match deleted successfully:', result);
            loadTournamentData(); // Перезагружаем данные
            if (typeof renderTournamentBracket === 'function') {
                renderTournamentBracket(); // Перерисовываем сетку
            }
        }
    });
};

// Функция для получения данных турнира (для совместимости)
window.getTournamentData = function() {
    return tournamentData;
};

// Функция для обновления данных турнира
window.updateTournamentData = function() {
    loadTournamentData();
};

// Функция для получения команд
window.getTeams = function() {
    if (!database) {
        console.error('Database not initialized');
        return [];
    }
    return database.getTeams();
};

// Функция для получения матчей
window.getMatches = function() {
    if (!database) {
        console.error('Database not initialized');
        return [];
    }
    return database.getMatches();
};

// Функция настройки обработчиков событий
function setupEventHandlers() {
    // Обработчик для кнопки обновления
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            loadTournamentData();
            if (typeof renderTournamentBracket === 'function') {
                renderTournamentBracket();
            }
        });
    }
}