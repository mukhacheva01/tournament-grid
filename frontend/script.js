let tournaments = [];
let currentTournament = null;
let teams = [];
let bracketData = null;
let isEditMode = false;
let matchSchedule = [];


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


document.addEventListener('DOMContentLoaded', function() {

    loadData();
    

    setupEventListeners();
    

    renderTournaments();
    updateTournamentInfo();
});


function setupEventListeners() {

    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            
            document.querySelectorAll('.main-nav a').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    
    toggleEditBtn.addEventListener('click', toggleEditMode);
    

    addTeamInputBtn.addEventListener('click', addTeamInputField);
    

    saveTeamsBtn.addEventListener('click', saveTeams);
    

    createTournamentBtn.addEventListener('click', showTournamentModal);
    

    closeModalBtn.addEventListener('click', closeTournamentModal);
    

    tournamentForm.addEventListener('submit', handleTournamentSubmit);
    

    generateBracketBtn.addEventListener('click', generateBracket);
    

    window.addEventListener('click', function(e) {
        if (e.target === tournamentModal) {
            closeTournamentModal();
        }
    });
    
    // Add quick fill button event listener
    const quickFillBtn = document.getElementById('quick-fill-btn');
    if (quickFillBtn) {
        quickFillBtn.addEventListener('click', quickFillForm);
    }
    
    // Add test save button event listener
    const testSaveBtn = document.getElementById('test-save-btn');
    if (testSaveBtn) {
        testSaveBtn.addEventListener('click', testDataSaving);
    }
    
    // Add reset data button event listener
    const resetDataBtn = document.getElementById('reset-data-btn');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetAllData);
    }
}


function loadData() {
    console.log('Loading data from localStorage...');
    
    const savedTournaments = localStorage.getItem('volleyballTournaments');
    const savedTeams = localStorage.getItem('volleyballTeams');
    const savedBracket = localStorage.getItem('volleyballBracket');
    const savedSchedule = localStorage.getItem('volleyballSchedule');
    
    console.log('Raw data from localStorage:', {
        tournaments: savedTournaments,
        teams: savedTeams,
        bracket: savedBracket,
        schedule: savedSchedule
    });
    
    if (savedTournaments) {
        try {
            tournaments = JSON.parse(savedTournaments);
            console.log('Tournaments loaded:', tournaments);
        } catch (error) {
            console.error('Error parsing tournaments:', error);
            tournaments = [];
        }
    } else {
        console.log('No tournaments found in localStorage');
    }
    
    if (savedTeams) {
        try {
            teams = JSON.parse(savedTeams);
            console.log('Teams loaded:', teams);
        } catch (error) {
            console.error('Error parsing teams:', error);
            teams = [];
        }
    } else {
        console.log('No teams found in localStorage');
    }
    
    if (savedBracket) {
        try {
            bracketData = JSON.parse(savedBracket);
            console.log('Bracket data loaded:', bracketData);
        } catch (error) {
            console.error('Error parsing bracket data:', error);
            bracketData = null;
        }
    } else {
        console.log('No bracket data found in localStorage');
    }
    
    if (savedSchedule) {
        try {
            matchSchedule = JSON.parse(savedSchedule);
            console.log('Schedule loaded:', matchSchedule);
        } catch (error) {
            console.error('Error parsing schedule:', error);
            matchSchedule = [];
        }
    } else {
        console.log('No schedule found in localStorage');
    }
    
    console.log('Final loaded data:', {
        tournaments: tournaments.length,
        teams: teams.length,
        bracketData: !!bracketData,
        matchSchedule: matchSchedule.length
    });

    if (tournaments.length > 0) {
        currentTournament = tournaments[0];
        console.log('Current tournament set to:', currentTournament);
    }
}


function saveData() {
    console.log('Saving data to localStorage...');
    console.log('Tournaments to save:', tournaments);
    console.log('Teams to save:', teams);
    console.log('Bracket data to save:', bracketData);
    console.log('Schedule to save:', matchSchedule);
    
    try {
        localStorage.setItem('volleyballTournaments', JSON.stringify(tournaments));
        localStorage.setItem('volleyballTeams', JSON.stringify(teams));
        localStorage.setItem('volleyballBracket', JSON.stringify(bracketData));
        localStorage.setItem('volleyballSchedule', JSON.stringify(matchSchedule));
        
        console.log('Data saved successfully to localStorage');
        
        // Verify data was saved
        const savedTournaments = localStorage.getItem('volleyballTournaments');
        console.log('Verification - saved tournaments:', savedTournaments);
        
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        alert('Ошибка при сохранении данных: ' + error.message);
    }
}


function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}


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
    

    addTeamInputField();
}


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
    

    updateTournamentInfo();
}


function updateTournamentInfo() {
    participantsCount.textContent = teams.length;
    seededCount.textContent = Math.min(4, teams.length);
    
    if (currentTournament) {
        tournamentDate.textContent = formatDate(currentTournament.date);
    }
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}


function showTournamentModal() {
    document.getElementById('tournament-modal-title').textContent = 'Создать турнир';
    document.getElementById('tournament-form').dataset.id = '';
    document.getElementById('tournament-form').reset();
    
    // Set default values
    document.getElementById('tournament-time').value = '10:00';
    document.getElementById('tournament-city').value = 'Москва';
    
    // Set default radio button selections
    document.querySelector('input[name="tournament-format"][value="double-elimination"]').checked = true;
    document.querySelector('input[name="game-type"][value="beach-2x2"]').checked = true;
    document.querySelector('input[name="gender-mix"][value="men"]').checked = true;
    document.querySelector('input[name="restrictions"][value="no-restrictions"]').checked = true;
    document.querySelector('input[name="application-collection"][value="yes"]').checked = true;
    
    tournamentModal.style.display = 'block';
}


function closeTournamentModal() {
    tournamentModal.style.display = 'none';
    tournamentForm.reset();
}

// Quick fill function for testing
function quickFillForm() {
    document.getElementById('tournament-name').value = 'Тестовый турнир';
    document.getElementById('tournament-date-input').value = '2025-08-22';
    document.getElementById('tournament-time').value = '10:00';
    document.getElementById('tournament-location').value = 'Спортивный комплекс';
    document.getElementById('tournament-city').value = 'Москва';
    document.getElementById('organizer-number').value = 'ORG001';
    document.getElementById('organizer-password').value = 'test123';
    document.getElementById('tournament-regulations').value = 'Дата и время окончания регистрации - 20.08.2025\nМесто проведения - Спортивный комплекс\nТип турнира (муж, жен, микс) - Мужской\nОграничения по участникам (возраст, территория..) - Без ограничений\nВзнос - Бесплатно\nОрганизатор - Тестовая организация\nКонтакты организатора - +7(999)123-45-67';
    
    // Set radio button values
    document.querySelector('input[name="tournament-format"][value="double-elimination"]').checked = true;
    document.querySelector('input[name="game-type"][value="beach-2x2"]').checked = true;
    document.querySelector('input[name="gender-mix"][value="men"]').checked = true;
    document.querySelector('input[name="restrictions"][value="no-restrictions"]').checked = true;
    document.querySelector('input[name="application-collection"][value="yes"]').checked = true;
}


function handleTournamentSubmit(e) {
    e.preventDefault();
    
    console.log('Form submitted, processing tournament data...');
    
    const name = document.getElementById('tournament-name').value;
    const date = document.getElementById('tournament-date-input').value;
    const time = document.getElementById('tournament-time').value;
    const location = document.getElementById('tournament-location').value;
    const city = document.getElementById('tournament-city').value;
    
    // Get radio button values
    const format = document.querySelector('input[name="tournament-format"]:checked')?.value;
    const gameType = document.querySelector('input[name="game-type"]:checked')?.value;
    const genderMix = document.querySelector('input[name="gender-mix"]:checked')?.value;
    const restrictions = document.querySelector('input[name="restrictions"]:checked')?.value;
    const applicationCollection = document.querySelector('input[name="application-collection"]:checked')?.value;
    
    // Get additional fields
    const organizerNumber = document.getElementById('organizer-number').value;
    const organizerPassword = document.getElementById('organizer-password').value;
    const regulations = document.getElementById('tournament-regulations').value;
    
    console.log('Tournament data collected:', {
        name, date, time, location, city, format, gameType, genderMix, restrictions, applicationCollection
    });
    
    const tournamentId = document.getElementById('tournament-form').dataset.id;
    
    if (tournamentId) {
        // Update existing tournament
        console.log('Updating existing tournament with ID:', tournamentId);
        tournaments = tournaments.map(t => t.id === tournamentId ? {
            ...t,
            name,
            date,
            time,
            location,
            city,
            format,
            gameType,
            genderMix,
            restrictions,
            applicationCollection,
            organizerNumber,
            organizerPassword,
            regulations,
            updatedAt: new Date().toISOString()
        } : t);
        alert('Турнир обновлен успешно!');
    } else {
        // Create new tournament
        console.log('Creating new tournament...');
        const newTournament = {
            id: Date.now().toString(),
            name,
            date,
            time,
            location,
            city,
            format,
            gameType,
            genderMix,
            restrictions,
            applicationCollection,
            organizerNumber,
            organizerPassword,
            regulations,
            createdAt: new Date().toISOString()
        };
        
        console.log('New tournament object:', newTournament);
        tournaments.push(newTournament);
        currentTournament = newTournament;
        console.log('Tournament added to array. Total tournaments:', tournaments.length);
        alert('Турнир создан успешно!');
    }
    
    console.log('Saving data to localStorage...');
    saveData();
    console.log('Data saved. Rendering tournaments...');
    renderTournaments();
    updateTournamentInfo();
    closeTournamentModal();
    
    console.log('Tournament creation/update completed successfully!');
}


function getFormatDisplayName(format) {
    const formatNames = {
        'single-elimination': 'На выбывание',
        'double-elimination': 'Двойное выбывание',
        'groups': 'Группы',
        'pseudo-groups': 'Псевдогруппа',
        'sand-master': 'Мастер песка',
        'master-mix': 'Мастер-микст',
        'royal-mix': 'Королевский микст',
        'kings-court': 'Kings of the court',
        'kings-beach': 'Kings of the beach+',
        'dynamic': 'Динамический',
        'leagues': 'Деление на лиги'
    };
    return formatNames[format] || format;
}

function getGameTypeDisplayName(gameType) {
    const gameTypeNames = {
        'beach-2x2': 'Пляжный 2×2',
        'snow-3x3': 'Снежный 3×3',
        'park-4x4': 'Парковый 4×4',
        'classic-6x6': 'Классика 6×6',
        'other': 'Другой'
    };
    return gameTypeNames[gameType] || gameType;
}

function getGenderMixDisplayName(genderMix) {
    const genderMixNames = {
        'men': 'Мужской',
        'women': 'Женский',
        'mix': 'Микст'
    };
    return genderMixNames[genderMix] || genderMix;
}

function getRestrictionsDisplayName(restrictions) {
    const restrictionsNames = {
        'youth': 'Молодежный',
        'veterans': 'Ветераны',
        'no-restrictions': 'Без ограничений'
    };
    return restrictionsNames[restrictions] || restrictions;
}

function renderTournaments() {
    console.log('Rendering tournaments...');
    console.log('Tournaments array:', tournaments);
    console.log('Tournaments container:', tournamentsContainer);
    
    tournamentsContainer.innerHTML = '';
    
    if (tournaments.length === 0) {
        console.log('No tournaments to render, showing empty message');
        tournamentsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 1rem;"></i>
                <p>Нет созданных турниров</p>
                <p style="font-size: 0.9rem; color: #a0aec0; margin-top: 0.5rem;">
                    Создайте первый турнир, нажав кнопку "Создать турнир"
                </p>
            </div>
        `;
        return;
    }
    
    console.log(`Rendering ${tournaments.length} tournaments...`);
    
    tournaments.forEach((tournament, index) => {
        console.log(`Rendering tournament ${index + 1}:`, tournament);
        
        const tournamentEl = document.createElement('div');
        tournamentEl.className = 'tournament-item';
        if (currentTournament && tournament.id === currentTournament.id) {
            tournamentEl.classList.add('active');
        }
        
        tournamentEl.innerHTML = `
            <h3>${tournament.name}</h3>
            <div class="tournament-details">
                <p><i class="fas fa-calendar-alt"></i> ${formatDate(tournament.date)} ${tournament.time ? `в ${tournament.time}` : ''}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${tournament.location}${tournament.city ? `, ${tournament.city}` : ''}</p>
                ${tournament.format ? `<p><i class="fas fa-trophy"></i> ${getFormatDisplayName(tournament.format)}</p>` : ''}
                ${tournament.gameType ? `<p><i class="fas fa-volleyball-ball"></i> ${getGameTypeDisplayName(tournament.gameType)}</p>` : ''}
                ${tournament.genderMix ? `<p><i class="fas fa-users"></i> ${getGenderMixDisplayName(tournament.genderMix)}</p>` : ''}
                ${tournament.restrictions && tournament.restrictions !== 'no-restrictions' ? `<p><i class="fas fa-info-circle"></i> ${getRestrictionsDisplayName(tournament.restrictions)}</p>` : ''}
            </div>
            <div class="tournament-actions">
                <button class="btn edit-tournament-btn" data-id="${tournament.id}" title="Редактировать турнир">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn delete-tournament-btn" data-id="${tournament.id}" title="Удалить турнир">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn view-bracket-btn" data-id="${tournament.id}" title="Просмотреть сетку">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for the action buttons
        tournamentEl.querySelector('.edit-tournament-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editTournament(tournament.id);
        });

        tournamentEl.querySelector('.delete-tournament-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTournament(tournament.id);
        });

        tournamentEl.querySelector('.view-bracket-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            viewTournamentBracket(tournament.id);
        });
        
        tournamentsContainer.appendChild(tournamentEl);
        console.log(`Tournament ${index + 1} rendered and added to DOM`);
    });
    
    console.log('All tournaments rendered successfully');
}

function editTournament(id) {
    const tournamentToEdit = tournaments.find(t => t.id === id);
    if (tournamentToEdit) {
        // Fill form fields
        document.getElementById('tournament-name').value = tournamentToEdit.name;
        document.getElementById('tournament-date-input').value = tournamentToEdit.date;
        document.getElementById('tournament-time').value = tournamentToEdit.time || '10:00';
        document.getElementById('tournament-location').value = tournamentToEdit.location;
        document.getElementById('tournament-city').value = tournamentToEdit.city || 'Москва';
        document.getElementById('organizer-number').value = tournamentToEdit.organizerNumber || '';
        document.getElementById('organizer-password').value = tournamentToEdit.organizerPassword || '';
        document.getElementById('tournament-regulations').value = tournamentToEdit.regulations || '';
        
        // Set radio button values
        if (tournamentToEdit.format) {
            document.querySelector(`input[name="tournament-format"][value="${tournamentToEdit.format}"]`).checked = true;
        }
        if (tournamentToEdit.gameType) {
            document.querySelector(`input[name="game-type"][value="${tournamentToEdit.gameType}"]`).checked = true;
        }
        if (tournamentToEdit.genderMix) {
            document.querySelector(`input[name="gender-mix"][value="${tournamentToEdit.genderMix}"]`).checked = true;
        }
        if (tournamentToEdit.restrictions) {
            document.querySelector(`input[name="restrictions"][value="${tournamentToEdit.restrictions}"]`).checked = true;
        }
        if (tournamentToEdit.applicationCollection) {
            document.querySelector(`input[name="application-collection"][value="${tournamentToEdit.applicationCollection}"]`).checked = true;
        }
        
        // Update modal title and store ID for update
        document.getElementById('tournament-modal-title').textContent = 'Редактировать турнир';
        document.getElementById('tournament-form').dataset.id = id;
        showTournamentModal();
    }
}

function deleteTournament(id) {
    if (confirm('Вы уверены, что хотите удалить этот турнир?')) {
        tournaments = tournaments.filter(t => t.id !== id);
        saveData();
        renderTournaments();
        if (currentTournament && currentTournament.id === id) {
            currentTournament = null;
            bracketData = null;
            teams = [];
            matchSchedule = [];
            updateTournamentInfo();
            renderBracket();
            renderSchedule();
        }
        alert('Турнир удален.');
    }
}

function viewTournamentBracket(id) {
    const tournamentToView = tournaments.find(t => t.id === id);
    if (tournamentToView) {
        currentTournament = tournamentToView;
        updateTournamentInfo();
        showSection('tournament-bracket-section');
        document.querySelectorAll('.main-nav a').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-section="tournament-bracket-section"]').classList.add('active');
        
        if (bracketData && currentTournament.id === bracketData.tournamentId) {
            renderBracket();
            renderSchedule();
        } else {
            bracketContainer.innerHTML = '<p>Сетка для этого турнира не сгенерирована. Пожалуйста, сгенерируйте ее.</p>';
            scheduleBody.innerHTML = '<tr><td colspan="6">Расписание матчей не сгенерировано</td></tr>';
        }
    }
}


function generateBracket() {
    if (teams.length < 2) {
        alert('Для генерации сетки нужно минимум 2 команды!');
        return;
    }
    

    bracketData = null;
    matchSchedule = [];
    

    const bracket = createInitialBracket(teams);
    bracketData = bracket;
    

    generateSchedule(bracket);
    
    saveData();
    

    showSection('tournament-bracket-section');
    document.querySelector('[data-section="tournament-bracket-section"]').classList.add('active');
    document.querySelector('[data-section="tournaments-list"]').classList.remove('active');
    

    renderBracket();
    renderSchedule();
}


function createInitialBracket(teams) {
    const teamCount = teams.length;
    

    const hasBye = teamCount % 2 !== 0;
    const teamsWithBye = hasBye ? [...teams, null] : teams;
    const effectiveTeamCount = teamsWithBye.length;
    

    const rounds = Math.ceil(Math.log2(effectiveTeamCount));
    

    const bracket = {
        rounds: []
    };
    

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
                completed: false,
                isBye: false
            });
        }
        
        bracket.rounds.push(round);
    }
    

    const firstRound = bracket.rounds[0];
    let teamIndex = 0;
    
    for (let i = 0; i < firstRound.matches.length; i++) {
        const match = firstRound.matches[i];
        
        if (teamIndex < teamsWithBye.length) {
            match.team1 = teamsWithBye[teamIndex++];
        }
        
        if (teamIndex < teamsWithBye.length) {
            match.team2 = teamsWithBye[teamIndex++];
        }
        
    
        if (match.team1 === null || match.team2 === null) {
            match.isBye = true;
            match.completed = true;
            

            if (match.team1 !== null) {
                match.winner = match.team1;
    
                updateNextMatches(match, match.winner);
            } else if (match.team2 !== null) {
                match.winner = match.team2;
        
                updateNextMatches(match, match.winner);
            }
        }
    }
    
    return bracket;
}


function getRoundName(roundIndex, totalRounds) {
    const roundNames = [
        'Финал',
        'Полуфинал',
        'Четвертьфинал'
    ];
    
    const difference = totalRounds - roundIndex - 1;
    
    if (difference < roundNames.length) {
        return roundNames[difference];
    }
    
    return `Раунд ${roundIndex + 1}`;
}


function generateSchedule(bracket) {
    matchSchedule = [];
    

    const startDate = currentTournament ? new Date(currentTournament.date) : new Date();
    let matchDateTime = new Date(startDate);
    matchDateTime.setHours(10, 0, 0, 0);
    

    bracket.rounds.forEach(round => {
        round.matches.forEach(match => {
    
            if ((!match.team1 && !match.team2) || match.completed) {
                return;
            }
            
    
            matchSchedule.push({
                round: round.name,
                team1: match.team1 ? match.team1.name : 'TBD',
                team2: match.team2 ? match.team2.name : 'TBD',
                date: matchDateTime.toLocaleDateString('ru-RU'),
                time: matchDateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                court: `Площадка ${Math.floor(Math.random() * 3) + 1}`,
                matchId: match.id
            });
            
    
            matchDateTime.setMinutes(matchDateTime.getMinutes() + 30);
        });
        
    
        matchDateTime.setHours(matchDateTime.getHours() + 2);
    });
}


function renderBracket() {
    if (!bracketData) {
        bracketContainer.innerHTML = '<p>Турнирная сетка не сгенерирована</p>';
        return;
    }
    
    bracketContainer.innerHTML = '';
    

    const bracketEl = document.createElement('div');
    bracketEl.className = 'bracket';
    

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


function createMatchElement(match, round) {
    const matchEl = document.createElement('div');
    matchEl.className = 'match';
    matchEl.dataset.matchId = match.id;
    

    const isFinal = round.name === 'Финал';
    
    let team1Name = match.team1 ? match.team1.name : 'TBD';
    let team2Name = match.team2 ? match.team2.name : 'TBD';
    

    if (match.completed && match.winner) {
        if (match.winner.id === (match.team1?.id || null)) {
            team1Name = `${team1Name} ✓`;
        } else if (match.winner.id === (match.team2?.id || null)) {
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
        ${isEditMode && !match.completed && match.team1 && match.team2 ? 
            `<div class="match-actions">
                <button class="select-winner-btn" data-winner="team1">${match.team1.name}</button>
                <button class="select-winner-btn" data-winner="team2">${match.team2.name}</button>
            </div>` : ''
        }
    `;
    

    if (isEditMode && !match.completed && match.team1 && match.team2) {
        matchEl.querySelectorAll('.select-winner-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const winnerTeam = this.dataset.winner === 'team1' ? match.team1 : match.team2;
                setMatchWinner(match, winnerTeam);
            });
        });
    }
    
    return matchEl;
}


function setMatchWinner(match, winner) {
    match.winner = winner;
    match.completed = true;
    

    updateNextMatches(match, winner);
    
    saveData();
    renderBracket();
    renderSchedule();
}


function createInitialBracket(teams) {
    const teamCount = teams.length;
    

    const hasBye = teamCount % 2 !== 0;
    const teamsWithBye = hasBye ? [...teams, null] : teams;
    const effectiveTeamCount = teamsWithBye.length;
    

    const rounds = Math.ceil(Math.log2(effectiveTeamCount));
    

    const bracket = {
        rounds: []
    };
    

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
                completed: false,
                isBye: false
            });
        }
        
        bracket.rounds.push(round);
    }
    

    const firstRound = bracket.rounds[0];
    let teamIndex = 0;
    
    for (let i = 0; i < firstRound.matches.length; i++) {
        const match = firstRound.matches[i];
        
        if (teamIndex < teamsWithBye.length) {
            match.team1 = teamsWithBye[teamIndex++];
        }
        
        if (teamIndex < teamsWithBye.length) {
            match.team2 = teamsWithBye[teamIndex++];
        }
        
    
        if (match.team1 === null || match.team2 === null) {
            match.isBye = true;
            match.completed = true;
            

            if (match.team1 !== null) {
                match.winner = match.team1;
    
                updateNextMatches(match, match.winner);
            } else if (match.team2 !== null) {
                match.winner = match.team2;
        
                updateNextMatches(match, match.winner);
            }
        }
    }
    
    return bracket;
}


function renderSchedule() {
    scheduleBody.innerHTML = '';
    
    if (matchSchedule.length === 0) {
        scheduleBody.innerHTML = '<tr><td colspan="6">Расписание матчей не сгенерировано</td></tr>';
        return;
    }
    
    matchSchedule.forEach(match => {
        const row = document.createElement('tr');
        
    
        const bracketMatch = findMatchInBracket(match.matchId);
        
    
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

// Test function for debugging data saving
function testDataSaving() {
    console.log('=== TESTING DATA SAVING ===');
    
    // Test 1: Check if localStorage is available
    try {
        localStorage.setItem('test', 'test-value');
        const testValue = localStorage.getItem('test');
        localStorage.removeItem('test');
        console.log('✅ localStorage is working');
    } catch (error) {
        console.error('❌ localStorage is not working:', error);
        alert('localStorage не работает: ' + error.message);
        return;
    }
    
    // Test 2: Check current data
    console.log('Current tournaments array:', tournaments);
    console.log('Current teams array:', teams);
    
    // Test 3: Try to save data
    console.log('Attempting to save data...');
    saveData();
    
    // Test 4: Verify data was saved
    const savedTournaments = localStorage.getItem('volleyballTournaments');
    const savedTeams = localStorage.getItem('volleyballTeams');
    
    console.log('Saved tournaments (raw):', savedTournaments);
    console.log('Saved teams (raw):', savedTeams);
    
    if (savedTournaments) {
        try {
            const parsedTournaments = JSON.parse(savedTournaments);
            console.log('✅ Tournaments saved successfully:', parsedTournaments);
        } catch (error) {
            console.error('❌ Error parsing saved tournaments:', error);
        }
    } else {
        console.log('❌ No tournaments found in localStorage');
    }
    
    if (savedTeams) {
        try {
            const parsedTeams = JSON.parse(savedTeams);
            console.log('✅ Teams saved successfully:', parsedTeams);
        } catch (error) {
            console.error('❌ Error parsing saved teams:', error);
        }
    } else {
        console.log('❌ No teams found in localStorage');
    }
    
    // Test 5: Try to load data
    console.log('Attempting to load data...');
    loadData();
    
    console.log('=== TEST COMPLETED ===');
    alert('Тест сохранения завершен. Проверьте консоль браузера для деталей.');
}

// Reset all data function
function resetAllData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        console.log('Resetting all data...');
        
        // Clear arrays
        tournaments = [];
        teams = [];
        bracketData = null;
        matchSchedule = [];
        currentTournament = null;
        
        // Clear localStorage
        localStorage.removeItem('volleyballTournaments');
        localStorage.removeItem('volleyballTeams');
        localStorage.removeItem('volleyballBracket');
        localStorage.removeItem('volleyballSchedule');
        
        console.log('All data cleared');
        
        // Update UI
        renderTournaments();
        updateTournamentInfo();
        
        if (bracketContainer) {
            bracketContainer.innerHTML = '<p>Турнирная сетка не сгенерирована</p>';
        }
        
        if (scheduleBody) {
            scheduleBody.innerHTML = '<tr><td colspan="6">Расписание матчей не сгенерировано</td></tr>';
        }
        
        alert('Все данные сброшены успешно!');
    }
}