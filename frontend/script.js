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
}


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
    

    if (tournaments.length > 0) {
        currentTournament = tournaments[0];
    }
}


function saveData() {
    localStorage.setItem('volleyballTournaments', JSON.stringify(tournaments));
    localStorage.setItem('volleyballTeams', JSON.stringify(teams));
    localStorage.setItem('volleyballBracket', JSON.stringify(bracketData));
    localStorage.setItem('volleyballSchedule', JSON.stringify(matchSchedule));
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
    tournamentModal.style.display = 'block';
}


function closeTournamentModal() {
    tournamentModal.style.display = 'none';
    tournamentForm.reset();
}


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
            
        
            if (bracketData) {
                renderBracket();
                renderSchedule();
            }
        });
        
        tournamentsContainer.appendChild(tournamentEl);
    });
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