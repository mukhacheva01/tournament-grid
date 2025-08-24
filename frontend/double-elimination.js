// Double Elimination Tournament System
let doubleEliminationTournament = {
    teams: [],
    matches: [],
    currentMatchId: 1,
    isComplete: false,
    champion: null
};

function updateTournamentStatus(message) {
    const statusElement = document.getElementById('tournament-status');
    if (statusElement) {
        statusElement.innerHTML = `<strong>Статус:</strong> ${message}`;
    }
}

function generateTeams(count) {
    const names = [
        'Команда A', 'Команда B', 'Команда C', 'Команда D',
        'Команда E', 'Команда F', 'Команда G', 'Команда H',
        'Команда I', 'Команда J', 'Команда K', 'Команда L',
        'Команда M', 'Команда N', 'Команда O', 'Команда P'
    ];
    
    return Array.from({length: count}, (_, i) => ({
        id: i + 1,
        name: names[i] || `Команда ${i + 1}`,
        eliminated: false,
        losses: 0,
        seed: i + 1
    }));
}

function createDoubleEliminationTournament(teamCount) {
    doubleEliminationTournament.teams = generateTeams(teamCount);
    doubleEliminationTournament.matches = [];
    doubleEliminationTournament.currentMatchId = 1;
    doubleEliminationTournament.isComplete = false;
    doubleEliminationTournament.champion = null;
    
    generateFullTournamentStructure();
    renderDoubleEliminationBracket();
    updateTournamentStatus(`Турнир создан: ${teamCount} команд. Вся структура готова. Начинайте матчи.`);
}

function generateFullTournamentStructure() {
    const teamCount = doubleEliminationTournament.teams.length;
    const winnersRounds = Math.ceil(Math.log2(teamCount));
    const losersRounds = winnersRounds * 2 - 1;
    
    // Создаем Winners Bracket
    generateWinnersBracketStructure(winnersRounds);
    
    // Создаем Losers Bracket
    generateLosersBracketStructure(losersRounds);
    
    // Заполняем первый раунд Winners Bracket командами
    fillFirstRound();
}

function generateWinnersBracketStructure(rounds) {
    let matchesInRound = Math.ceil(doubleEliminationTournament.teams.length / 2);
    
    for (let round = 1; round <= rounds; round++) {
        for (let pos = 0; pos < matchesInRound; pos++) {
            const match = {
                id: doubleEliminationTournament.currentMatchId++,
                team1: null,
                team2: null,
                winner: null,
                loser: null,
                bracket: 'winners',
                round: round,
                status: 'waiting',
                position: pos
            };
            doubleEliminationTournament.matches.push(match);
        }
        matchesInRound = Math.ceil(matchesInRound / 2);
    }
}

function generateLosersBracketStructure(rounds) {
    for (let round = 1; round <= rounds; round++) {
        let matchesInRound;
        if (round === 1) {
            matchesInRound = Math.floor(doubleEliminationTournament.teams.length / 4);
        } else if (round % 2 === 0) {
            // Четные раунды - меньше матчей
            matchesInRound = Math.ceil(doubleEliminationTournament.teams.length / Math.pow(2, round + 1));
        } else {
            // Нечетные раунды - больше матчей
            matchesInRound = Math.ceil(doubleEliminationTournament.teams.length / Math.pow(2, round));
        }
        
        if (matchesInRound < 1) matchesInRound = 1;
        
        for (let pos = 0; pos < matchesInRound; pos++) {
            const match = {
                id: doubleEliminationTournament.currentMatchId++,
                team1: null,
                team2: null,
                winner: null,
                loser: null,
                bracket: 'losers',
                round: round,
                status: 'waiting',
                position: pos
            };
            doubleEliminationTournament.matches.push(match);
        }
    }
}

function fillFirstRound() {
    const firstRoundMatches = doubleEliminationTournament.matches.filter(m => 
        m.bracket === 'winners' && m.round === 1
    ).sort((a, b) => a.position - b.position);
    
    for (let i = 0; i < doubleEliminationTournament.teams.length; i += 2) {
        const matchIndex = Math.floor(i / 2);
        if (matchIndex < firstRoundMatches.length) {
            const match = firstRoundMatches[matchIndex];
            match.team1 = doubleEliminationTournament.teams[i];
            match.team2 = doubleEliminationTournament.teams[i + 1] || null;
            
            if (match.team2) {
                match.status = 'ready';
            } else {
                match.status = 'bye';
                match.winner = match.team1;
            }
        }
    }
}

function renderDoubleEliminationBracket() {
    const container = document.getElementById('bracket-container');
    
    // Группируем матчи по bracket и round
    const winnerRounds = {};
    const loserRounds = {};
    
    doubleEliminationTournament.matches.forEach(match => {
        if (match.bracket === 'winners') {
            if (!winnerRounds[match.round]) winnerRounds[match.round] = [];
            winnerRounds[match.round].push(match);
        } else if (match.bracket === 'losers') {
            if (!loserRounds[match.round]) loserRounds[match.round] = [];
            loserRounds[match.round].push(match);
        }
    });
    
    let html = '';
    
    // Создаем горизонтальное расположение: Losers слева, Winners справа
    html += '<div class="de-bracket-container">';
    
    // Losers Bracket слева
    if (Object.keys(loserRounds).length > 0) {
        html += '<div style="flex: 1;">';
        html += '<div class="de-bracket-label">Losers Bracket</div>';
        html += '<div class="de-losers-bracket">';
        html += renderBracketGrid(loserRounds, 'L');
        html += '</div>';
        html += '</div>';
    }
    
    // Winners Bracket справа
    if (Object.keys(winnerRounds).length > 0) {
        html += '<div style="flex: 1;">';
        html += '<div class="de-bracket-label">Winners Bracket</div>';
        html += '<div class="de-winners-bracket">';
        html += renderBracketGrid(winnerRounds, 'W');
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    
    // Финал
    if (doubleEliminationTournament.champion) {
        html += '<div class="de-bracket-label">🏆 Чемпион турнира 🏆</div>';
        html += '<div class="de-final-bracket">';
        html += `<div class="de-champion">${doubleEliminationTournament.champion.name}</div>`;
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function renderBracketGrid(rounds, prefix) {
    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    
    let html = '<div class="de-bracket-container">';
    html += '<div class="de-bracket-grid">';
    
    // Создаем колонки для каждого раунда
    roundNumbers.forEach((round, roundIndex) => {
        const matches = rounds[round] || [];
        
        html += '<div class="de-bracket-column">';
        html += `<div class="de-round-header">${prefix}${round}</div>`;
        
        matches.forEach(match => {
            html += '<div class="de-match-cell">';
            html += renderMatch(match);
            html += '</div>';
        });
        
        html += '</div>';
    });
    
    html += '</div>';
    html += '</div>';
    return html;
}

function renderMatch(match) {
    let html = `<div class="de-match-number">${match.id}</div>`;
    
    if (match.status === 'bye') {
        html += `<div class="de-team-slot bye-slot">BYE</div>`;
        html += `<div class="de-team-slot winner">${match.team1.name}</div>`;
        return html;
    }
    
    if (match.team1) {
        const team1Class = match.winner && match.winner.id === match.team1.id ? 'winner' : 
                         match.loser && match.loser.id === match.team1.id ? 'loser' : '';
        html += `<div class="de-team-slot ${team1Class}" onclick="setDoubleEliminationWinner(${match.id}, ${match.team1.id})">${match.team1.name}</div>`;
    } else {
        html += '<div class="de-team-slot" style="color: #ccc;">Ожидание</div>';
    }
    
    if (match.team2) {
        const team2Class = match.winner && match.winner.id === match.team2.id ? 'winner' : 
                         match.loser && match.loser.id === match.team2.id ? 'loser' : '';
        html += `<div class="de-team-slot ${team2Class}" onclick="setDoubleEliminationWinner(${match.id}, ${match.team2.id})">${match.team2.name}</div>`;
    } else if (match.status !== 'bye') {
        html += '<div class="de-team-slot" style="color: #ccc;">Ожидание</div>';
    }
    
    return html;
}

function setDoubleEliminationWinner(matchId, winnerId) {
    const match = doubleEliminationTournament.matches.find(m => m.id === matchId);
    if (!match || match.winner || (match.status !== 'ready' && match.status !== 'bye')) return;
    
    const winner = doubleEliminationTournament.teams.find(t => t.id === winnerId);
    const loser = match.team1 && match.team1.id === winnerId ? match.team2 : match.team1;
    
    match.winner = winner;
    match.loser = loser;
    match.status = 'completed';
    
    // Увеличиваем поражения
    if (loser) {
        loser.losses++;
        if (loser.losses >= 2) {
            loser.eliminated = true;
        }
    }
    
    // Продвигаем победителя в Winners Bracket
    if (match.bracket === 'winners') {
        advanceWinnerInWinnersBracket(winner, match.round, match.position);
        
        // Отправляем проигравшего в Losers Bracket
        if (loser && loser.losses === 1) {
            sendToLosersBracket(loser, match.round);
        }
    }
    
    // Продвигаем победителя в Losers Bracket
    if (match.bracket === 'losers') {
        advanceWinnerInLosersBracket(winner, match.round, match.position);
    }
    
    checkTournamentComplete();
    renderDoubleEliminationBracket();
    updateTournamentStatus(`Матч ${matchId}: ${winner.name} победил`);
}

function advanceWinnerInWinnersBracket(winner, currentRound, currentPosition) {
    const nextRound = currentRound + 1;
    const nextPosition = Math.floor(currentPosition / 2);
    
    const nextMatch = doubleEliminationTournament.matches.find(m => 
        m.bracket === 'winners' && 
        m.round === nextRound && 
        m.position === nextPosition
    );
    
    if (nextMatch) {
        if (!nextMatch.team1) {
            nextMatch.team1 = winner;
        } else if (!nextMatch.team2) {
            nextMatch.team2 = winner;
            nextMatch.status = 'ready';
        }
    }
}

function advanceWinnerInLosersBracket(winner, currentRound, currentPosition) {
    const nextRound = currentRound + 1;
    const maxLosersRounds = Math.ceil(Math.log2(doubleEliminationTournament.teams.length)) * 2 - 1;
    
    if (nextRound <= maxLosersRounds) {
        const nextMatch = doubleEliminationTournament.matches.find(m => 
            m.bracket === 'losers' && 
            m.round === nextRound && 
            (!m.team1 || !m.team2)
        );
        
        if (nextMatch) {
            if (!nextMatch.team1) {
                nextMatch.team1 = winner;
            } else if (!nextMatch.team2) {
                nextMatch.team2 = winner;
                nextMatch.status = 'ready';
            }
        }
    }
}

function sendToLosersBracket(loser, winnersRound) {
    // Правильная логика Double Elimination:
    // W1 проигравшие -> L1
    // W2 проигравшие -> L2 (играют с победителями L1)
    // W3 проигравшие -> L4 (играют с победителями L3)
    // W4 проигравшие -> L6 (играют с победителями L5)
    
    let targetRound;
    if (winnersRound === 1) {
        targetRound = 1;
    } else {
        targetRound = (winnersRound - 1) * 2;
    }
    
    const targetMatch = doubleEliminationTournament.matches.find(m => 
        m.bracket === 'losers' && 
        m.round === targetRound && 
        (!m.team1 || !m.team2)
    );
    
    if (targetMatch) {
        if (!targetMatch.team1) {
            targetMatch.team1 = loser;
        } else if (!targetMatch.team2) {
            targetMatch.team2 = loser;
            targetMatch.status = 'ready';
        }
        
        // Добавляем победителя из предыдущего раунда Losers Bracket
        addWinnerFromPreviousLosersRound(targetMatch, targetRound);
    }
}

function addWinnerFromPreviousLosersRound(match, currentRound) {
    if (currentRound > 1) {
        const previousRound = currentRound - 1;
        const previousWinner = doubleEliminationTournament.matches.find(m => 
            m.bracket === 'losers' && 
            m.round === previousRound && 
            m.winner && 
            !m.winner.eliminated
        );
        
        if (previousWinner && previousWinner.winner) {
            if (!match.team1) {
                match.team1 = previousWinner.winner;
            } else if (!match.team2) {
                match.team2 = previousWinner.winner;
                match.status = 'ready';
            }
        }
    }
}

function checkTournamentComplete() {
    const winnersRounds = Math.ceil(Math.log2(doubleEliminationTournament.teams.length));
    const finalWinnersMatch = doubleEliminationTournament.matches.find(m => 
        m.bracket === 'winners' && m.round === winnersRounds
    );
    
    const losersRounds = winnersRounds * 2 - 1;
    const finalLosersMatch = doubleEliminationTournament.matches.find(m => 
        m.bracket === 'losers' && m.round === losersRounds
    );
    
    if (finalWinnersMatch && finalWinnersMatch.winner && 
        finalLosersMatch && finalLosersMatch.winner) {
        
        // Если победитель Winners Bracket проиграл в Grand Final
        if (finalWinnersMatch.winner.losses === 0 && finalLosersMatch.winner.losses === 1) {
            // Нужен дополнительный матч
            // Для простоты, пока считаем победителем того, кто выиграл Winners Bracket
            doubleEliminationTournament.champion = finalWinnersMatch.winner;
        } else {
            doubleEliminationTournament.champion = finalLosersMatch.winner;
        }
        
        doubleEliminationTournament.isComplete = true;
        updateTournamentStatus(`Турнир завершен! Чемпион: ${doubleEliminationTournament.champion.name}`);
    }
}

function simulateRandomMatch() {
    const readyMatches = doubleEliminationTournament.matches.filter(m => 
        m.status === 'ready' && !m.winner
    );
    
    if (readyMatches.length === 0) {
        updateTournamentStatus('Нет готовых матчей для симуляции');
        return;
    }
    
    const randomMatch = readyMatches[Math.floor(Math.random() * readyMatches.length)];
    const randomWinner = Math.random() < 0.5 ? randomMatch.team1 : randomMatch.team2;
    
    setDoubleEliminationWinner(randomMatch.id, randomWinner.id);
}

function resetDoubleEliminationTournament() {
    doubleEliminationTournament = {
        teams: [],
        matches: [],
        currentMatchId: 1,
        isComplete: false,
        champion: null
    };
    
    const container = document.getElementById('bracket-container');
    container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Выберите количество команд для начала турнира</p>';
    
    updateTournamentStatus('Готов к созданию турнира');
}