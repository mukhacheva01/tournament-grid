let tournaments = [];
let currentTournament = null;
let teams = [];
let bracketData = null;
let isEditMode = false;
let matchSchedule = [];

// DOM элементы будут инициализированы после загрузки страницы
let tournamentsContainer;
let participantsCount;
let seededCount;
let tournamentDate;
let toggleEditBtn;
let teamsInputSection;
let teamsList;
let addTeamInputBtn;
let saveTeamsBtn;
let bracketContainer;
let scheduleBody;
let createTournamentBtn;
let generateBracketBtn;
let tournamentModal;
let closeModalBtn;
let tournamentForm;


document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем DOM элементы
    initializeDOMElements();
    
    // Загружаем данные
    loadData();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Рендерим турниры
    renderTournaments();
    
    // Обновляем информацию о турнире
    updateTournamentInfo();
});

// Функция для инициализации DOM элементов
function initializeDOMElements() {
    tournamentsContainer = document.getElementById('tournaments-container');
    participantsCount = document.getElementById('participants-count');
    seededCount = document.getElementById('seeded-count');  
    tournamentDate = document.getElementById('tournament-date');
    toggleEditBtn = document.getElementById('toggle-edit-btn');
    teamsInputSection = document.getElementById('teams-input-section');
    teamsList = document.getElementById('teams-list');
    addTeamInputBtn = document.getElementById('add-team-input-btn');
    saveTeamsBtn = document.getElementById('save-teams-btn');
    bracketContainer = document.getElementById('bracket-container');
    scheduleBody = document.getElementById('schedule-body');
    createTournamentBtn = document.getElementById('create-tournament-btn');
    generateBracketBtn = document.getElementById('generate-bracket-btn');
    tournamentModal = document.getElementById('tournament-modal');
    closeModalBtn = document.querySelector('.close');
    tournamentForm = document.getElementById('tournament-form');
    
    // Проверяем, что все необходимые элементы найдены
    if (!bracketContainer) {
        console.error('bracketContainer не найден!');
    }
    if (!tournamentsContainer) {
        console.error('tournamentsContainer не найден!');
    }
    if (!scheduleBody) {
        console.error('scheduleBody не найден!');
    }
}


function setupEventListeners() {
    // Проверяем, что все необходимые элементы существуют
    if (!toggleEditBtn || !addTeamInputBtn || !saveTeamsBtn || !createTournamentBtn || 
        !closeModalBtn || !tournamentForm || !generateBracketBtn) {
        console.error('Не все необходимые элементы найдены в setupEventListeners');
        return;
    }

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
    
    // Add system health button event listener
    const systemHealthBtn = document.getElementById('system-health-btn');
    if (systemHealthBtn) {
        systemHealthBtn.addEventListener('click', showSystemHealth);
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
    
    // Если есть данные сетки, рендерим их
    if (bracketData) {
        console.log('Rendering existing bracket data...');
        renderImprovedBracket();
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
    // Проверяем, что sectionId передан
    if (!sectionId) {
        console.error('sectionId не передан в showSection');
        return;
    }
    
    // Убираем активный класс со всех секций
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Добавляем активный класс к нужной секции
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Секция с id "${sectionId}" не найдена`);
    }
}


function toggleEditMode() {
    // Проверяем, что необходимые элементы существуют
    if (!toggleEditBtn || !teamsInputSection) {
        console.error('Необходимые элементы не инициализированы в toggleEditMode');
        return;
    }
    
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        toggleEditBtn.textContent = 'Режим просмотра';
        teamsInputSection.style.display = 'block';
        renderTeamInputs();
    } else {
        toggleEditBtn.textContent = 'Режим редактирования';
        teamsInputSection.style.display = 'none';
    }
    
    // Используем новую функцию рендеринга сетки
    if (bracketData) {
        renderImprovedBracket();
    }
}


function addTeamInputField() {
    // Проверяем, что teamsList существует
    if (!teamsList) {
        console.error('teamsList не инициализирован');
        return;
    }
    
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
    // Проверяем, что teamsList существует
    if (!teamsList) {
        console.error('teamsList не инициализирован');
        return;
    }
    
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
    // Проверяем, что teamsList существует
    if (!teamsList) {
        console.error('teamsList не инициализирован');
        return;
    }
    
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
    
    // Обновляем информацию о турнире
    updateTournamentInfo();
}


function updateTournamentInfo() {
    // Проверяем, что необходимые элементы существуют
    if (!participantsCount || !seededCount || !tournamentDate) {
        console.error('Необходимые элементы не инициализированы в updateTournamentInfo');
        return;
    }
    
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
    // Проверяем, что все необходимые элементы существуют
    const modalTitle = document.getElementById('tournament-modal-title');
    const form = document.getElementById('tournament-form');
    const timeInput = document.getElementById('tournament-time');
    const cityInput = document.getElementById('tournament-city');
    
    if (!modalTitle || !form || !timeInput || !cityInput || !tournamentModal) {
        console.error('Не все элементы модального окна найдены');
        return;
    }
    
    modalTitle.textContent = 'Создать турнир';
    form.dataset.id = '';
    form.reset();
    
    // Set default values
    timeInput.value = '10:00';
    cityInput.value = 'Москва';
    
    // Set default radio button selections
    const formatRadio = document.querySelector('input[name="tournament-format"][value="double-elimination"]');
    const gameTypeRadio = document.querySelector('input[name="game-type"][value="beach-2x2"]');
    const genderMixRadio = document.querySelector('input[name="gender-mix"][value="men"]');
    const restrictionsRadio = document.querySelector('input[name="restrictions"][value="no-restrictions"]');
    const applicationCollectionRadio = document.querySelector('input[name="application-collection"][value="yes"]');
    
    if (formatRadio) formatRadio.checked = true;
    if (gameTypeRadio) gameTypeRadio.checked = true;
    if (genderMixRadio) genderMixRadio.checked = true;
    if (restrictionsRadio) restrictionsRadio.checked = true;
    if (applicationCollectionRadio) applicationCollectionRadio.checked = true;
    
    tournamentModal.style.display = 'block';
}


function closeTournamentModal() {
    // Проверяем, что необходимые элементы существуют
    if (!tournamentModal || !tournamentForm) {
        console.error('Не все элементы модального окна найдены в closeTournamentModal');
        return;
    }
    
    tournamentModal.style.display = 'none';
    tournamentForm.reset();
}

// Quick fill function for testing
function quickFillForm() {
    // Проверяем, что все необходимые элементы существуют
    const nameInput = document.getElementById('tournament-name');
    const dateInput = document.getElementById('tournament-date-input');
    const timeInput = document.getElementById('tournament-time');
    const locationInput = document.getElementById('tournament-location');
    const cityInput = document.getElementById('tournament-city');
    const organizerNumberInput = document.getElementById('organizer-number');
    const organizerPasswordInput = document.getElementById('organizer-password');
    const regulationsInput = document.getElementById('tournament-regulations');
    
    if (!nameInput || !dateInput || !timeInput || !locationInput || !cityInput || 
        !organizerNumberInput || !organizerPasswordInput || !regulationsInput) {
        console.error('Не все элементы формы найдены в quickFillForm');
        return;
    }
    
    nameInput.value = 'Тестовый турнир';
    dateInput.value = '2025-08-22';
    timeInput.value = '10:00';
    locationInput.value = 'Спортивный комплекс';
    cityInput.value = 'Москва';
    organizerNumberInput.value = 'ORG001';
    organizerPasswordInput.value = 'test123';
    regulationsInput.value = 'Дата и время окончания регистрации - 20.08.2025\nМесто проведения - Спортивный комплекс\nТип турнира (муж, жен, микс) - Мужской\nОграничения по участникам (возраст, территория..) - Без ограничений\nВзнос - Бесплатно\nОрганизатор - Тестовая организация\nКонтакты организатора - +7(999)123-45-67';
    
    // Set radio button values
    const formatRadio = document.querySelector('input[name="tournament-format"][value="double-elimination"]');
    const gameTypeRadio = document.querySelector('input[name="game-type"][value="beach-2x2"]');
    const genderMixRadio = document.querySelector('input[name="gender-mix"][value="men"]');
    const restrictionsRadio = document.querySelector('input[name="restrictions"][value="no-restrictions"]');
    const applicationCollectionRadio = document.querySelector('input[name="application-collection"][value="yes"]');
    
    if (formatRadio) formatRadio.checked = true;
    if (gameTypeRadio) gameTypeRadio.checked = true;
    if (genderMixRadio) genderMixRadio.checked = true;
    if (restrictionsRadio) restrictionsRadio.checked = true;
    if (applicationCollectionRadio) applicationCollectionRadio.checked = true;
}


function handleTournamentSubmit(e) {
    e.preventDefault();
    
    console.log('Form submitted, processing tournament data...');
    
    // Проверяем, что все необходимые элементы существуют
    const nameInput = document.getElementById('tournament-name');
    const dateInput = document.getElementById('tournament-date-input');
    const timeInput = document.getElementById('tournament-time');
    const locationInput = document.getElementById('tournament-location');
    const cityInput = document.getElementById('tournament-city');
    const organizerNumberInput = document.getElementById('organizer-number');
    const organizerPasswordInput = document.getElementById('organizer-password');
    const regulationsInput = document.getElementById('tournament-regulations');
    
    if (!nameInput || !dateInput || !timeInput || !locationInput || !cityInput || 
        !organizerNumberInput || !organizerPasswordInput || !regulationsInput) {
        console.error('Не все элементы формы найдены в handleTournamentSubmit');
        return;
    }
    
    const name = nameInput.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const location = locationInput.value;
    const city = cityInput.value;
    
    // Get radio button values
    const format = document.querySelector('input[name="tournament-format"]:checked')?.value;
    const gameType = document.querySelector('input[name="game-type"]:checked')?.value;
    const genderMix = document.querySelector('input[name="gender-mix"]:checked')?.value;
    const restrictions = document.querySelector('input[name="restrictions"]:checked')?.value;
    const applicationCollection = document.querySelector('input[name="application-collection"]:checked')?.value;
    
    // Get additional fields
    const organizerNumber = organizerNumberInput.value;
    const organizerPassword = organizerPasswordInput.value;
    const regulations = regulationsInput.value;
    
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
    // Проверяем, что контейнер существует
    if (!tournamentsContainer) {
        console.error('tournamentsContainer не инициализирован');
        return;
    }
    
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
        // Проверяем, что все необходимые элементы формы существуют
        const nameInput = document.getElementById('tournament-name');
        const dateInput = document.getElementById('tournament-date-input');
        const timeInput = document.getElementById('tournament-time');
        const locationInput = document.getElementById('tournament-location');
        const cityInput = document.getElementById('tournament-city');
        const organizerNumberInput = document.getElementById('organizer-number');
        const organizerPasswordInput = document.getElementById('organizer-password');
        const regulationsInput = document.getElementById('tournament-regulations');
        
        if (!nameInput || !dateInput || !timeInput || !locationInput || !cityInput || 
            !organizerNumberInput || !organizerPasswordInput || !regulationsInput) {
            console.error('Не все элементы формы найдены');
            return;
        }
        
        // Fill form fields
        nameInput.value = tournamentToEdit.name;
        dateInput.value = tournamentToEdit.date;
        timeInput.value = tournamentToEdit.time || '10:00';
        locationInput.value = tournamentToEdit.location;
        cityInput.value = tournamentToEdit.city || 'Москва';
        organizerNumberInput.value = tournamentToEdit.organizerNumber || '';
        organizerPasswordInput.value = tournamentToEdit.organizerPassword || '';
        regulationsInput.value = tournamentToEdit.regulations || '';
        
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
            
            // Проверяем, что функции существуют перед вызовом
            if (typeof renderBracket === 'function') {
                renderBracket();
            }
            if (typeof renderSchedule === 'function') {
                renderSchedule();
            }
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
            // Проверяем, что функции существуют перед вызовом
            if (typeof renderBracket === 'function') {
                renderBracket();
            }
            if (typeof renderSchedule === 'function') {
                renderSchedule();
            }
        } else {
            // Проверяем, что контейнеры существуют
            if (bracketContainer) {
                bracketContainer.innerHTML = '<p>Сетка для этого турнира не сгенерирована. Пожалуйста, сгенерируйте ее.</p>';
            }
            if (scheduleBody) {
                scheduleBody.innerHTML = '<tr><td colspan="6">Расписание матчей не сгенерировано</td></tr>';
            }
        }
    }
}


function generateBracket() {
    try {
        console.log('=== STARTING BRACKET GENERATION ===');
        
        // Проверяем здоровье системы
        const systemHealth = checkSystemHealth();
        if (!systemHealth.localStorage) {
            alert('Проблема с сохранением данных. Проверьте настройки браузера.');
            return;
        }
        
        // Проверяем количество команд
        if (!teams || teams.length < 2) {
            alert('Для генерации сетки нужно минимум 2 команды!');
            return;
        }
        
        if (teams.length > 128) {
            const proceed = confirm(`Вы пытаетесь создать сетку для ${teams.length} команд. Это может занять много времени и ресурсов. Продолжить?`);
            if (!proceed) {
                return;
            }
        }
        
        // Очищаем предыдущие данные
        bracketData = null;
        matchSchedule = [];
        
        console.log(`Generating bracket for ${teams.length} teams...`);
        
        // Создаем улучшенную сетку с мониторингом производительности
        const bracket = monitorPerformance('bracket-creation', () => {
            return createImprovedBracket(teams);
        });
        
        if (!bracket) {
            console.error('Failed to create bracket');
            showNotification('Не удалось создать сетку. Проверьте консоль для деталей.', 'error');
            return;
        }
        
        bracketData = bracket;
        
        console.log('Bracket created successfully, generating schedule...');
        
        // Генерируем расписание с мониторингом производительности
        monitorPerformance('schedule-generation', () => {
            generateImprovedSchedule(bracket);
        });
        
        // Сохраняем данные с мониторингом производительности
        console.log('Saving data...');
        monitorPerformance('data-saving', () => {
            saveData();
        });
        
        // Показываем секцию с сеткой
        showSection('tournament-bracket-section');
        
        // Проверяем, что элементы навигации существуют
        const bracketSection = document.querySelector('[data-section="tournament-bracket-section"]');
        const tournamentsListSection = document.querySelector('[data-section="tournaments-list"]');
        
        if (bracketSection) {
            bracketSection.classList.add('active');
        }
        if (tournamentsListSection) {
            tournamentsListSection.classList.remove('active');
        }
        
        // Рендерим сетку и расписание с мониторингом производительности
        console.log('Rendering bracket and schedule...');
        const renderTime = monitorPerformance('bracket-rendering', () => {
            renderImprovedBracket();
            renderSchedule();
        });
        
        // Показываем статистику
        showBracketStats(bracket, renderTime);
        
        console.log('=== BRACKET GENERATION COMPLETED ===');
        
        // Показываем уведомление об успехе
        showNotification('Турнирная сетка успешно создана!', 'success');
        
    } catch (error) {
        console.error('Critical error in bracket generation:', error);
        handleCriticalError(error, 'bracket-generation');
        
        // Очищаем данные в случае ошибки
        bracketData = null;
        matchSchedule = [];
    }
}

function showBracketStats(bracket, generationTime) {
    try {
        const stats = {
            totalTeams: bracket.totalTeams,
            totalRounds: bracket.rounds.length,
            totalMatches: bracket.rounds.reduce((sum, round) => sum + round.matches.length, 0),
            byeMatches: bracket.rounds[0].matches.filter(match => match.isBye).length,
            generationTime: generationTime.toFixed(2)
        };
        
        console.log('Bracket Statistics:', stats);
        
        // Показываем уведомление пользователю
        const message = `Сетка создана успешно!\n\n` +
                       `Команд: ${stats.totalTeams}\n` +
                       `Раундов: ${stats.totalRounds}\n` +
                       `Матчей: ${stats.totalMatches}\n` +
                       `BYE-матчей: ${stats.byeMatches}\n` +
                       `Время генерации: ${stats.generationTime}мс`;
        
        // Создаем красивое уведомление
        showNotification(message, 'success');
        
    } catch (error) {
        console.error('Error showing bracket stats:', error);
    }
}

function showNotification(message, type = 'info') {
    try {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Добавляем обработчик закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Добавляем в DOM
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback к простому alert
        alert(message);
    }
}

function createImprovedBracket(teams) {
    try {
        // Проверяем входные данные
        if (!Array.isArray(teams)) {
            console.error('Teams must be an array');
            throw new Error('Команды должны быть массивом');
        }
        
        const teamCount = teams.length;
        console.log(`Creating bracket for ${teamCount} teams`);
        
        // Ограничиваем максимальное количество команд для предотвращения проблем с производительностью
        const MAX_TEAMS = 128; // Максимум 128 команд (7 раундов)
        if (teamCount > MAX_TEAMS) {
            console.warn(`Too many teams (${teamCount}), limiting to ${MAX_TEAMS}`);
            teams = teams.slice(0, MAX_TEAMS);
        }
        
        // Минимальное количество команд
        if (teamCount < 2) {
            throw new Error('Для создания сетки нужно минимум 2 команды');
        }
        
        // Определяем количество раундов с проверкой
        const rounds = Math.ceil(Math.log2(teamCount));
        const totalSlots = Math.pow(2, rounds);
        
        console.log(`Tournament structure: ${rounds} rounds, ${totalSlots} total slots`);
        
        // Проверяем, что количество раундов не превышает разумные пределы
        if (rounds > 10) {
            throw new Error('Слишком много раундов для турнира');
        }
        
        // Создаем массив с bye-командами если нужно
        const teamsWithBye = [...teams];
        while (teamsWithBye.length < totalSlots) {
            teamsWithBye.push(null);
        }
        
        // Создаем структуру сетки
        const bracket = {
            rounds: [],
            totalTeams: teamCount,
            totalSlots: totalSlots,
            tournamentId: currentTournament ? currentTournament.id : null,
            createdAt: new Date().toISOString()
        };
        
        // Создаем раунды с проверкой
        for (let i = 0; i < rounds; i++) {
            const matchCount = Math.pow(2, rounds - i - 1);
            
            // Проверяем, что количество матчей разумное
            if (matchCount > 1000) {
                throw new Error('Слишком много матчей в раунде');
            }
            
            const round = {
                name: getImprovedRoundName(i, rounds),
                matches: [],
                roundNumber: i,
                matchCount: matchCount
            };
            
            for (let j = 0; j < matchCount; j++) {
                round.matches.push({
                    id: `round-${i}-match-${j}`,
                    team1: null,
                    team2: null,
                    winner: null,
                    completed: false,
                    isBye: false,
                    score1: null,
                    score2: null,
                    nextMatchId: null,
                    position: j,
                    roundIndex: i
                });
            }
            
            bracket.rounds.push(round);
        }
        
        // Заполняем первый раунд с правильным seeding и проверками
        const firstRound = bracket.rounds[0];
        const seededTeams = seedTeams(teamsWithBye, totalSlots);
        
        console.log(`Seeded teams: ${seededTeams.length} total, ${teams.length} actual teams`);
        
        let matchIndex = 0;
        let byeMatches = 0;
        
        for (let i = 0; i < seededTeams.length; i += 2) {
            if (matchIndex < firstRound.matches.length) {
                const match = firstRound.matches[matchIndex];
                match.team1 = seededTeams[i];
                match.team2 = seededTeams[i + 1];
                
                // Проверяем bye-матчи
                if (match.team1 === null || match.team2 === null) {
                    match.isBye = true;
                    match.completed = true;
                    byeMatches++;
                    
                    if (match.team1 !== null) {
                        match.winner = match.team1;
                        match.score1 = 1;
                        match.score2 = 0;
                        console.log(`Bye match: ${match.team1.name} advances automatically`);
                    } else if (match.team2 !== null) {
                        match.winner = match.team2;
                        match.score1 = 0;
                        match.score2 = 1;
                        console.log(`Bye match: ${match.team2.name} advances automatically`);
                    }
                    
                    // Обновляем следующие матчи с проверкой на ошибки
                    try {
                        updateNextMatches(bracket, match, match.winner);
                    } catch (error) {
                        console.error('Error updating next matches for bye:', error);
                        // Продолжаем выполнение, не прерывая создание сетки
                    }
                }
                
                matchIndex++;
            }
        }
        
        console.log(`Created ${matchIndex} matches in first round, ${byeMatches} bye matches`);
        
        // Устанавливаем связи между матчами с проверкой
        try {
            setupMatchConnections(bracket);
        } catch (error) {
            console.error('Error setting up match connections:', error);
            // Продолжаем выполнение
        }
        
        // Валидация созданной сетки
        validateBracket(bracket);
        
        console.log('Bracket created successfully:', bracket);
        return bracket;
        
    } catch (error) {
        console.error('Error creating bracket:', error);
        alert(`Ошибка при создании сетки: ${error.message}`);
        return null;
    }
}

function validateBracket(bracket) {
    try {
        console.log('Validating bracket...');
        
        if (!bracket || !bracket.rounds || !Array.isArray(bracket.rounds)) {
            throw new Error('Неверная структура сетки');
        }
        
        if (bracket.rounds.length === 0) {
            throw new Error('Сетка не содержит раундов');
        }
        
        let totalMatches = 0;
        let totalTeams = 0;
        
        bracket.rounds.forEach((round, roundIndex) => {
            if (!round.matches || !Array.isArray(round.matches)) {
                throw new Error(`Раунд ${roundIndex} не содержит матчей`);
            }
            
            totalMatches += round.matches.length;
            
            round.matches.forEach((match, matchIndex) => {
                if (!match.id) {
                    throw new Error(`Матч ${matchIndex} в раунде ${roundIndex} не имеет ID`);
                }
                
                if (match.team1 && match.team1.id) totalTeams++;
                if (match.team2 && match.team2.id) totalTeams++;
            });
        });
        
        console.log(`Bracket validation passed: ${totalMatches} matches, ${totalTeams} team slots`);
        
    } catch (error) {
        console.error('Bracket validation failed:', error);
        throw error;
    }
}

function seedTeams(teams, totalSlots) {
    try {
        console.log(`Seeding ${teams.length} teams into ${totalSlots} slots`);
        
        if (!Array.isArray(teams) || teams.length === 0) {
            console.warn('No teams to seed');
            return new Array(totalSlots).fill(null);
        }
        
        const seededTeams = new Array(totalSlots).fill(null);
        
        // Улучшенный seeding алгоритм для больших турниров
        if (teams.length <= 8) {
            // Для небольших турниров используем простое seeding
            let topIndex = 0;
            let bottomIndex = totalSlots - 1;
            
            for (let i = 0; i < teams.length; i++) {
                if (i % 2 === 0) {
                    seededTeams[topIndex++] = teams[i];
                } else {
                    seededTeams[bottomIndex--] = teams[i];
                }
            }
        } else {
            // Для больших турниров используем более сложный seeding
            const seedOrder = generateSeedOrder(teams.length, totalSlots);
            
            for (let i = 0; i < teams.length && i < seedOrder.length; i++) {
                const slotIndex = seedOrder[i];
                if (slotIndex < totalSlots) {
                    seededTeams[slotIndex] = teams[i];
                }
            }
        }
        
        console.log(`Seeding completed. Filled ${seededTeams.filter(t => t !== null).length} slots`);
        return seededTeams;
        
    } catch (error) {
        console.error('Error in seeding:', error);
        // Возвращаем простое распределение в случае ошибки
        const fallbackSeeding = new Array(totalSlots).fill(null);
        for (let i = 0; i < teams.length && i < totalSlots; i++) {
            fallbackSeeding[i] = teams[i];
        }
        return fallbackSeeding;
    }
}

function generateSeedOrder(teamCount, totalSlots) {
    try {
        const order = [];
        const half = Math.floor(totalSlots / 2);
        
        // Первая команда в первом слоте
        order.push(0);
        
        if (teamCount > 1) {
            // Вторая команда в последнем слоте
            order.push(totalSlots - 1);
        }
        
        if (teamCount > 2) {
            // Третья команда в середине
            order.push(half);
        }
        
        if (teamCount > 3) {
            // Четвертая команда в середине + 1
            order.push(half + 1);
        }
        
        // Заполняем оставшиеся слоты по принципу "змейки"
        let leftIndex = 1;
        let rightIndex = totalSlots - 2;
        
        for (let i = 4; i < teamCount; i++) {
            if (i % 2 === 0) {
                if (leftIndex < half) {
                    order.push(leftIndex++);
                }
            } else {
                if (rightIndex > half) {
                    order.push(rightIndex--);
                }
            }
        }
        
        return order;
        
    } catch (error) {
        console.error('Error generating seed order:', error);
        // Возвращаем простое последовательное распределение
        const simpleOrder = [];
        for (let i = 0; i < teamCount; i++) {
            simpleOrder.push(i);
        }
        return simpleOrder;
    }
}

function setupMatchConnections(bracket) {
    try {
        console.log('Setting up match connections...');
        
        if (!bracket || !bracket.rounds || bracket.rounds.length < 2) {
            console.warn('Not enough rounds to set up connections');
            return;
        }
        
        let connectionsCreated = 0;
        
        // Устанавливаем связи между матчами для продвижения победителей
        for (let roundIndex = 0; roundIndex < bracket.rounds.length - 1; roundIndex++) {
            const currentRound = bracket.rounds[roundIndex];
            const nextRound = bracket.rounds[roundIndex + 1];
            
            if (!currentRound || !nextRound || !currentRound.matches || !nextRound.matches) {
                console.warn(`Invalid round structure at index ${roundIndex}`);
                continue;
            }
            
            for (let matchIndex = 0; matchIndex < currentRound.matches.length; matchIndex++) {
                const currentMatch = currentRound.matches[matchIndex];
                const nextMatchIndex = Math.floor(matchIndex / 2);
                
                if (currentMatch && nextMatchIndex < nextRound.matches.length) {
                    const nextMatch = nextRound.matches[nextMatchIndex];
                    if (nextMatch) {
                        currentMatch.nextMatchId = nextMatch.id;
                        connectionsCreated++;
                    }
                }
            }
        }
        
        console.log(`Created ${connectionsCreated} match connections`);
        
    } catch (error) {
        console.error('Error setting up match connections:', error);
        // Продолжаем выполнение без связей
    }
}

function getImprovedRoundName(roundIndex, totalRounds) {
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

function generateImprovedSchedule(bracket) {
    try {
        console.log('Generating improved schedule...');
        
        if (!bracket || !bracket.rounds) {
            console.warn('Invalid bracket for schedule generation');
            matchSchedule = [];
            return;
        }
        
        matchSchedule = [];
        
        // Начинаем с даты турнира
        const startDate = currentTournament ? new Date(currentTournament.date) : new Date();
        let matchDateTime = new Date(startDate);
        matchDateTime.setHours(10, 0, 0, 0);
        
        let totalMatches = 0;
        let scheduledMatches = 0;
        
        // Генерируем расписание для каждого раунда
        bracket.rounds.forEach((round, roundIndex) => {
            if (!round.matches || !Array.isArray(round.matches)) {
                console.warn(`Invalid round ${roundIndex} for schedule generation`);
                return;
            }
            
            console.log(`Scheduling round ${round.name} with ${round.matches.length} matches`);
            
            round.matches.forEach((match, matchIndex) => {
                totalMatches++;
                
                // Пропускаем bye-матчи и завершенные матчи
                if (match.isBye || match.completed) {
                    return;
                }
                
                try {
                    // Добавляем матч в расписание
                    const scheduleEntry = {
                        round: round.name,
                        team1: match.team1 ? match.team1.name : 'TBD',
                        team2: match.team2 ? match.team2.name : 'TBD',
                        date: matchDateTime.toLocaleDateString('ru-RU'),
                        time: matchDateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                        court: `Площадка ${(matchIndex % 3) + 1}`,
                        matchId: match.id,
                        roundNumber: roundIndex,
                        matchNumber: matchIndex
                    };
                    
                    matchSchedule.push(scheduleEntry);
                    scheduledMatches++;
                    
                    // Увеличиваем время для следующего матча
                    matchDateTime.setMinutes(matchDateTime.getMinutes() + 45);
                    
                    // Если прошло 4 часа, переходим на следующий день
                    if (matchDateTime.getHours() >= 22) {
                        matchDateTime.setDate(matchDateTime.getDate() + 1);
                        matchDateTime.setHours(10, 0, 0, 0);
                    }
                    
                } catch (error) {
                    console.error(`Error scheduling match ${match.id}:`, error);
                    // Продолжаем с следующим матчем
                }
            });
            
            // Перерыв между раундами
            if (roundIndex < bracket.rounds.length - 1) {
                matchDateTime.setHours(matchDateTime.getHours() + 2);
            }
        });
        
        console.log(`Schedule generated: ${scheduledMatches} matches scheduled out of ${totalMatches} total`);
        
    } catch (error) {
        console.error('Error generating schedule:', error);
        matchSchedule = [];
        alert(`Ошибка при генерации расписания: ${error.message}`);
    }
}

function renderImprovedBracket() {
    try {
        // Проверяем, что контейнер существует
        if (!bracketContainer) {
            console.error('bracketContainer не инициализирован');
            return;
        }
        
        if (!bracketData) {
            bracketContainer.innerHTML = '<p>Турнирная сетка не сгенерирована</p>';
            return;
        }
        
        console.log('Rendering improved bracket...');
        const startTime = performance.now();
        
        // Очищаем контейнер
        bracketContainer.innerHTML = '';
        
        // Проверяем размер сетки для оптимизации
        const totalMatches = bracketData.rounds.reduce((sum, round) => sum + round.matches.length, 0);
        const isLargeBracket = totalMatches > 50;
        
        if (isLargeBracket) {
            console.log('Large bracket detected, using optimized rendering...');
            renderLargeBracketOptimized();
        } else {
            console.log('Standard bracket rendering...');
            renderStandardBracket();
        }
        
        const endTime = performance.now();
        console.log(`Bracket rendered in ${(endTime - startTime).toFixed(2)}ms`);
        
    } catch (error) {
        console.error('Error rendering bracket:', error);
        if (bracketContainer) {
            bracketContainer.innerHTML = `<p>Ошибка при отображении сетки: ${error.message}</p>`;
        }
    }
}

function renderStandardBracket() {
    // Проверяем, что контейнер существует
    if (!bracketContainer) {
        console.error('bracketContainer не инициализирован в renderStandardBracket');
        return;
    }
    
    // Создаем контейнер для сетки
    const bracketEl = document.createElement('div');
    bracketEl.className = 'improved-bracket';
    
    // Добавляем заголовок
    const headerEl = document.createElement('div');
    headerEl.className = 'bracket-header';
    headerEl.innerHTML = `
        <h2>Турнирная сетка</h2>
        <div class="bracket-info">
            <span>Команд: ${bracketData.totalTeams}</span>
            <span>Раундов: ${bracketData.rounds.length}</span>
        </div>
    `;
    bracketEl.appendChild(headerEl);
    
    // Создаем сетку
    const gridEl = document.createElement('div');
    gridEl.className = 'bracket-grid';
    
    // Рендерим каждый раунд
    bracketData.rounds.forEach((round, roundIndex) => {
        const roundEl = createImprovedRoundElement(round, roundIndex);
        gridEl.appendChild(roundEl);
    });
    
    bracketEl.appendChild(gridEl);
    bracketContainer.appendChild(bracketEl);
}

function renderLargeBracketOptimized() {
    // Проверяем, что контейнер существует
    if (!bracketContainer) {
        console.error('bracketContainer не инициализирован в renderLargeBracketOptimized');
        return;
    }
    
    // Для больших сеток используем виртуализацию и ленивую загрузку
    const bracketEl = document.createElement('div');
    bracketEl.className = 'improved-bracket large-bracket';
    
    // Добавляем заголовок с дополнительной информацией
    const headerEl = document.createElement('div');
    headerEl.className = 'bracket-header';
    headerEl.innerHTML = `
        <h2>Турнирная сетка</h2>
        <div class="bracket-info">
            <span>Команд: ${bracketData.totalTeams}</span>
            <span>Раундов: ${bracketData.rounds.length}</span>
            <span>Матчей: ${bracketData.rounds.reduce((sum, round) => sum + round.matches.length, 0)}</span>
        </div>
        <div class="bracket-controls">
            <button class="btn btn-secondary" id="expand-all-btn">Развернуть все</button>
            <button class="btn btn-secondary" id="collapse-all-btn">Свернуть все</button>
        </div>
    `;
    bracketEl.appendChild(headerEl);
    
    // Создаем сетку с ленивой загрузкой
    const gridEl = document.createElement('div');
    gridEl.className = 'bracket-grid large-bracket-grid';
    
    // Рендерим только первые несколько раундов для начала
    const initialRounds = Math.min(3, bracketData.rounds.length);
    
    for (let i = 0; i < initialRounds; i++) {
        const roundEl = createImprovedRoundElement(bracketData.rounds[i], i);
        gridEl.appendChild(roundEl);
    }
    
    // Добавляем кнопку "Показать больше" если есть еще раунды
    if (bracketData.rounds.length > initialRounds) {
        const showMoreBtn = document.createElement('div');
        showMoreBtn.className = 'show-more-rounds';
        showMoreBtn.innerHTML = `
            <button class="btn btn-primary" id="show-more-rounds-btn">
                Показать еще ${bracketData.rounds.length - initialRounds} раундов
            </button>
        `;
        gridEl.appendChild(showMoreBtn);
        
        // Обработчик для показа дополнительных раундов
        showMoreBtn.querySelector('#show-more-rounds-btn').addEventListener('click', () => {
            showMoreBtn.remove();
            renderRemainingRounds(gridEl, initialRounds);
        });
    }
    
    bracketEl.appendChild(gridEl);
    bracketContainer.appendChild(bracketEl);
    
    // Добавляем обработчики для кнопок управления
    setupLargeBracketControls(bracketEl);
}

async function renderRemainingRounds(gridEl, startIndex) {
    try {
        console.log(`Rendering remaining rounds from ${startIndex}...`);
        
        for (let i = startIndex; i < bracketData.rounds.length; i++) {
            const roundEl = createImprovedRoundElement(bracketData.rounds[i], i);
            gridEl.appendChild(roundEl);
            
            // Небольшая задержка для предотвращения блокировки UI
            if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        console.log('All rounds rendered successfully');
        
    } catch (error) {
        console.error('Error rendering remaining rounds:', error);
    }
}

function setupLargeBracketControls(bracketEl) {
    // Обработчик для разворачивания всех раундов
    const expandAllBtn = bracketEl.querySelector('#expand-all-btn');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
            const roundElements = bracketEl.querySelectorAll('.bracket-round');
            roundElements.forEach(round => {
                round.classList.add('expanded');
            });
        });
    }
    
    // Обработчик для сворачивания всех раундов
    const collapseAllBtn = bracketEl.querySelector('#collapse-all-btn');
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
            const roundElements = bracketEl.querySelectorAll('.bracket-round');
            roundElements.forEach(round => {
                round.classList.remove('expanded');
            });
        });
    }
}

function createImprovedRoundElement(round, roundIndex) {
    const roundEl = document.createElement('div');
    roundEl.className = 'bracket-round';
    roundEl.dataset.round = roundIndex;
    
    // Заголовок раунда
    const roundTitle = document.createElement('div');
    roundTitle.className = 'round-title';
    roundTitle.innerHTML = `
        <h3>${round.name}</h3>
        <span class="match-count">${round.matches.length} матч(ей)</span>
    `;
    roundEl.appendChild(roundTitle);
    
    // Контейнер для матчей
    const matchesEl = document.createElement('div');
    matchesEl.className = 'round-matches';
    
    // Рендерим матчи
    round.matches.forEach((match, matchIndex) => {
        const matchEl = createImprovedMatchElement(match, round, roundIndex, matchIndex);
        matchesEl.appendChild(matchEl);
    });
    
    roundEl.appendChild(matchesEl);
    return roundEl;
}

function createImprovedMatchElement(match, round, roundIndex, matchIndex) {
    const matchEl = document.createElement('div');
    matchEl.className = `bracket-match ${match.isBye ? 'bye-match' : ''} ${match.completed ? 'completed' : ''}`;
    matchEl.dataset.matchId = match.id;
    
    // Определяем, является ли это финалом
    const isFinal = round.name === 'Финал';
    
    // Получаем имена команд
    let team1Name = match.team1 ? match.team1.name : 'TBD';
    let team2Name = match.team2 ? match.team2.name : 'TBD';
    
    // Добавляем галочку победителю
    if (match.completed && match.winner) {
        if (match.winner.id === (match.team1?.id || null)) {
            team1Name = `${team1Name} ✓`;
        } else if (match.winner.id === (match.team2?.id || null)) {
            team2Name = `${team2Name} ✓`;
        }
    }
    
    // Создаем HTML для матча
    matchEl.innerHTML = `
        <div class="match-header">
            <span class="match-number">#${matchIndex + 1}</span>
            ${match.isBye ? '<span class="bye-label">BYE</span>' : ''}
        </div>
        <div class="match-teams">
            <div class="match-team team1 ${match.winner && match.team1 && match.winner.id === match.team1.id ? 'winner' : ''}">
                <span class="team-name">${team1Name}</span>
                ${match.score1 !== null ? `<span class="team-score">${match.score1}</span>` : ''}
            </div>
            <div class="match-vs">VS</div>
            <div class="match-team team2 ${match.winner && match.team2 && match.winner.id === match.team2.id ? 'winner' : ''}">
                <span class="team-name">${team2Name}</span>
                ${match.score2 !== null ? `<span class="team-score">${match.score2}</span>` : ''}
            </div>
        </div>
        ${isEditMode && !match.completed && match.team1 && match.team2 && !match.isBye ? 
            `<div class="match-actions">
                <button class="select-winner-btn" data-winner="team1">${match.team1.name}</button>
                <button class="select-winner-btn" data-winner="team2">${match.team2.name}</button>
            </div>` : ''
        }
    `;
    
    // Добавляем обработчики событий для кнопок выбора победителя
    if (isEditMode && !match.completed && match.team1 && match.team2 && !match.isBye) {
        matchEl.querySelectorAll('.select-winner-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const winnerTeam = this.dataset.winner === 'team1' ? match.team1 : match.team2;
                setImprovedMatchWinner(match, winnerTeam);
            });
        });
    }
    
    return matchEl;
}

function setImprovedMatchWinner(match, winner) {
    match.winner = winner;
    match.completed = true;
    
    // Устанавливаем счет
    if (winner.id === (match.team1?.id || null)) {
        match.score1 = 1;
        match.score2 = 0;
    } else {
        match.score1 = 0;
        match.score2 = 1;
    }
    
    // Обновляем следующие матчи
    updateNextMatches(bracketData, match, winner);
    
    // Сохраняем данные
    saveData();
    
    // Перерисовываем сетку и расписание
    renderImprovedBracket();
    renderSchedule();
}

function updateNextMatches(bracket, currentMatch, winner) {
    try {
        if (!currentMatch || !currentMatch.nextMatchId || !winner) {
            console.warn('Invalid parameters for updateNextMatches');
            return;
        }
        
        if (!bracket || !bracket.rounds) {
            console.warn('Invalid bracket structure for updateNextMatches');
            return;
        }
        
        // Находим следующий матч
        let nextMatch = null;
        let found = false;
        
        for (const round of bracket.rounds) {
            if (!round.matches) continue;
            
            for (const match of round.matches) {
                if (match && match.id === currentMatch.nextMatchId) {
                    nextMatch = match;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        
        if (!nextMatch) {
            console.warn(`Next match not found for ID: ${currentMatch.nextMatchId}`);
            return;
        }
        
        // Определяем, какая команда должна быть team1 или team2
        const currentMatchIndex = currentMatch.position || 0;
        const isFirstHalf = currentMatchIndex % 2 === 0;
        
        if (isFirstHalf) {
            nextMatch.team1 = winner;
        } else {
            nextMatch.team2 = winner;
        }
        
        // Проверяем, можно ли завершить матч
        if (nextMatch.team1 && nextMatch.team2) {
            // Проверяем на bye-матч (если одна из команд null)
            if (nextMatch.team1 === null || nextMatch.team2 === null) {
                nextMatch.isBye = true;
                nextMatch.completed = true;
                
                if (nextMatch.team1 !== null) {
                    nextMatch.winner = nextMatch.team1;
                    nextMatch.score1 = 1;
                    nextMatch.score2 = 0;
                    console.log(`Bye match auto-completed: ${nextMatch.team1.name} advances`);
                    
                    // Рекурсивно обновляем следующие матчи
                    updateNextMatches(bracket, nextMatch, nextMatch.winner);
                } else if (nextMatch.team2 !== null) {
                    nextMatch.winner = nextMatch.team2;
                    nextMatch.score1 = 0;
                    nextMatch.score2 = 1;
                    console.log(`Bye match auto-completed: ${nextMatch.team2.name} advances`);
                    
                    // Рекурсивно обновляем следующие матчи
                    updateNextMatches(bracket, nextMatch, nextMatch.winner);
                }
            }
        }
        
        console.log(`Updated next match ${nextMatch.id}: ${winner.name} added`);
        
    } catch (error) {
        console.error('Error in updateNextMatches:', error);
        // Продолжаем выполнение без обновления
    }
}

// Старая функция renderBracket заменена на renderImprovedBracket


// Старая функция createMatchElement заменена на createImprovedMatchElement


// Старая функция setMatchWinner заменена на setImprovedMatchWinner


// Старая функция createInitialBracket заменена на createImprovedBracket


// Старые функции getRoundName и generateSchedule заменены на улучшенные версии


function renderSchedule() {
    // Проверяем, что scheduleBody существует
    if (!scheduleBody) {
        console.error('scheduleBody не инициализирован');
        return;
    }
    
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

// Функция для мониторинга производительности
function monitorPerformance(operation, callback) {
    const startTime = performance.now();
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    try {
        const result = callback();
        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const duration = endTime - startTime;
        const memoryUsed = endMemory - startMemory;
        
        console.log(`Performance: ${operation} completed in ${duration.toFixed(2)}ms`);
        if (memoryUsed > 0) {
            console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
        }
        
        return result;
        
    } catch (error) {
        const endTime = performance.now();
        console.error(`Performance: ${operation} failed after ${(endTime - startTime).toFixed(2)}ms`, error);
        throw error;
    }
}

// Функция для проверки здоровья системы
function checkSystemHealth() {
    try {
        const health = {
            localStorage: false,
            memory: false,
            performance: false,
            timestamp: new Date().toISOString()
        };
        
        // Проверяем localStorage
        try {
            localStorage.setItem('health-check', 'test');
            localStorage.removeItem('health-check');
            health.localStorage = true;
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
        
        // Проверяем память
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            health.memory = memoryUsage < 0.9; // Используется менее 90% памяти
            console.log(`Memory usage: ${(memoryUsage * 100).toFixed(1)}%`);
        } else {
            health.memory = true; // Не можем проверить, считаем что все хорошо
        }
        
        // Проверяем производительность
        health.performance = performance.now() > 0;
        
        console.log('System health check:', health);
        return health;
        
    } catch (error) {
        console.error('Error checking system health:', error);
        return { error: error.message, timestamp: new Date().toISOString() };
    }
}

function showSystemHealth() {
    try {
        console.log('Checking system health...');
        
        const health = checkSystemHealth();
        const stats = getSystemStats();
        
        let message = '=== ПРОВЕРКА СИСТЕМЫ ===\n\n';
        
        // Основные показатели
        message += `✅ localStorage: ${health.localStorage ? 'Работает' : 'Не работает'}\n`;
        message += `✅ Память: ${health.memory ? 'В норме' : 'Критично'}\n`;
        message += `✅ Производительность: ${health.performance ? 'Работает' : 'Не работает'}\n\n`;
        
        // Статистика
        message += `📊 Статистика:\n`;
        message += `• Турниров: ${tournaments.length}\n`;
        message += `• Команд: ${teams.length}\n`;
        message += `• Сеток: ${bracketData ? '1' : '0'}\n`;
        message += `• Расписаний: ${matchSchedule.length}\n\n`;
        
        // Рекомендации
        message += `💡 Рекомендации:\n`;
        if (!health.localStorage) {
            message += `• Проверьте настройки браузера для localStorage\n`;
        }
        if (!health.memory) {
            message += `• Закройте другие вкладки для освобождения памяти\n`;
        }
        if (tournaments.length > 100) {
            message += `• Много турниров может замедлить работу\n`;
        }
        if (teams.length > 64) {
            message += `• Большое количество команд может вызвать проблемы\n`;
        }
        
        if (health.localStorage && health.memory && health.performance) {
            message += `✅ Система работает нормально!`;
        } else {
            message += `⚠️ Обнаружены проблемы в системе`;
        }
        
        // Показываем уведомление
        showNotification(message, health.localStorage && health.memory && health.performance ? 'success' : 'error');
        
        // Дополнительно выводим в консоль
        console.log('System Health Report:', health);
        console.log('System Stats:', stats);
        
    } catch (error) {
        console.error('Error showing system health:', error);
        showNotification('Ошибка при проверке системы: ' + error.message, 'error');
    }
}

function getSystemStats() {
    try {
        const stats = {
            tournaments: tournaments.length,
            teams: teams.length,
            bracketData: !!bracketData,
            matchSchedule: matchSchedule.length,
            localStorage: {
                tournaments: localStorage.getItem('volleyballTournaments') ? 'Есть' : 'Нет',
                teams: localStorage.getItem('volleyballTeams') ? 'Есть' : 'Нет',
                bracket: localStorage.getItem('volleyballBracket') ? 'Есть' : 'Нет',
                schedule: localStorage.getItem('volleyballSchedule') ? 'Есть' : 'Нет'
            },
            memory: performance.memory ? {
                used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
                usage: `${((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
            } : 'Недоступно',
            timestamp: new Date().toISOString()
        };
        
        return stats;
        
    } catch (error) {
        console.error('Error getting system stats:', error);
        return { error: error.message, timestamp: new Date().toISOString() };
    }
}

// Улучшенная функция для обработки критических ошибок
function handleCriticalError(error, context) {
    console.error(`Critical error in ${context}:`, error);
    
    // Показываем пользователю понятное сообщение об ошибке
    const userMessage = getErrorMessage(error, context);
    showNotification(userMessage, 'error');
    
    // Логируем ошибку для разработчиков
    const errorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        error: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    console.error('Error log for developers:', errorLog);
    
    // В критических случаях предлагаем перезагрузить страницу
    if (context === 'bracket-generation' || context === 'data-saving') {
        setTimeout(() => {
            if (confirm('Произошла критическая ошибка. Перезагрузить страницу?')) {
                window.location.reload();
            }
        }, 2000);
    }
}

// Функция для получения понятных пользователю сообщений об ошибках
function getErrorMessage(error, context) {
    const errorMessages = {
        'bracket-generation': 'Ошибка при создании турнирной сетки',
        'data-saving': 'Ошибка при сохранении данных',
        'data-loading': 'Ошибка при загрузке данных',
        'rendering': 'Ошибка при отображении интерфейса',
        'schedule-generation': 'Ошибка при создании расписания'
    };
    
    const baseMessage = errorMessages[context] || 'Произошла ошибка';
    
    if (error.message.includes('memory') || error.message.includes('Memory')) {
        return `${baseMessage}: недостаточно памяти. Попробуйте закрыть другие вкладки или перезагрузить страницу.`;
    }
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return `${baseMessage}: операция заняла слишком много времени. Попробуйте еще раз.`;
    }
    
    if (error.message.includes('localStorage')) {
        return `${baseMessage}: проблема с сохранением данных. Проверьте настройки браузера.`;
    }
    
    return `${baseMessage}: ${error.message}`;
}