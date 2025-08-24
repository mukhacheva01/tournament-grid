/**
 * Современный движок турнирной сетки Double Elimination
 * Полностью переписанная архитектура для максимального удобства и адаптивности
 */

class BracketEngine {
    constructor(teams, options = {}) {
        this.teams = teams;
        this.options = {
            maxTeams: 64,
            enableAnimations: true,
            responsive: true,
            theme: 'modern',
            ...options
        };
        
        this.winnersRounds = [];
        this.losersRounds = [];
        this.grandFinal = null;
        this.matches = new Map();
        this.connections = new Map();
        
        this.init();
    }
    
    init() {
        this.validateTeams();
        this.calculateStructure();
        this.createWinnersBracket();
        this.createLosersBracket();
        this.createGrandFinal();
        this.setupConnections();
    }
    
    validateTeams() {
        if (!Array.isArray(this.teams) || this.teams.length < 2) {
            throw new Error('Необходимо минимум 2 команды');
        }
        
        if (this.teams.length > this.options.maxTeams) {
            console.warn(`Слишком много команд (${this.teams.length}), ограничиваем до ${this.options.maxTeams}`);
            this.teams = this.teams.slice(0, this.options.maxTeams);
        }
    }
    
    calculateStructure() {
        const teamCount = this.teams.length;
        this.winnersRoundCount = Math.ceil(Math.log2(teamCount));
        this.totalSlots = Math.pow(2, this.winnersRoundCount);
        this.losersRoundCount = Math.max(1, (this.winnersRoundCount - 1) * 2);
        
        // Добавляем bye-команды если нужно
        while (this.teams.length < this.totalSlots) {
            this.teams.push(null);
        }
    }
    
    createWinnersBracket() {
        for (let roundIndex = 0; roundIndex < this.winnersRoundCount; roundIndex++) {
            const matchCount = Math.pow(2, this.winnersRoundCount - roundIndex - 1);
            const round = {
                id: `winners-${roundIndex}`,
                name: this.getWinnersRoundName(roundIndex),
                type: 'winners',
                matches: []
            };
            
            for (let matchIndex = 0; matchIndex < matchCount; matchIndex++) {
                const match = this.createMatch(
                    `W${roundIndex + 1}-${matchIndex + 1}`,
                    roundIndex === 0 ? this.getInitialTeams(matchIndex) : [null, null],
                    'winners',
                    roundIndex,
                    matchIndex
                );
                
                round.matches.push(match);
                this.matches.set(match.id, match);
            }
            
            this.winnersRounds.push(round);
        }
    }
    
    createLosersBracket() {
        for (let roundIndex = 0; roundIndex < this.losersRoundCount; roundIndex++) {
            const round = {
                id: `losers-${roundIndex}`,
                name: this.getLosersRoundName(roundIndex),
                type: 'losers',
                matches: []
            };
            
            const matchCount = this.getLosersRoundMatchCount(roundIndex);
            
            for (let matchIndex = 0; matchIndex < matchCount; matchIndex++) {
                const match = this.createMatch(
                    `L${roundIndex + 1}-${matchIndex + 1}`,
                    [null, null],
                    'losers',
                    roundIndex,
                    matchIndex
                );
                
                round.matches.push(match);
                this.matches.set(match.id, match);
            }
            
            this.losersRounds.push(round);
        }
    }
    
    createGrandFinal() {
        this.grandFinal = this.createMatch(
            'grand-final',
            [null, null],
            'grand-final',
            0,
            0
        );
        
        this.matches.set(this.grandFinal.id, this.grandFinal);
    }
    
    createMatch(id, teams, type, roundIndex, matchIndex) {
        const [team1, team2] = teams;
        
        return {
            id,
            type,
            roundIndex,
            matchIndex,
            team1: team1 ? { ...team1 } : null,
            team2: team2 ? { ...team2 } : null,
            winner: null,
            loser: null,
            score: { team1: 0, team2: 0 },
            completed: false,
            isBye: !team1 || !team2,
            nextMatchId: null,
            loserNextMatchId: null,
            status: 'pending',
            startTime: null,
            endTime: null
        };
    }
    
    getInitialTeams(matchIndex) {
        const team1Index = matchIndex * 2;
        const team2Index = matchIndex * 2 + 1;
        
        return [
            this.teams[team1Index] || null,
            this.teams[team2Index] || null
        ];
    }
    
    getWinnersRoundName(roundIndex) {
        const totalRounds = this.winnersRoundCount;
        
        if (roundIndex === totalRounds - 1) return 'Финал Winners Bracket';
        if (roundIndex === totalRounds - 2) return 'Полуфинал Winners Bracket';
        if (roundIndex === totalRounds - 3) return 'Четвертьфинал Winners Bracket';
        
        return `Раунд ${roundIndex + 1} Winners Bracket`;
    }
    
    getLosersRoundName(roundIndex) {
        const totalRounds = this.losersRoundCount;
        
        if (roundIndex === totalRounds - 1) return 'Финал Losers Bracket';
        if (roundIndex === totalRounds - 2) return 'Полуфинал Losers Bracket';
        
        return `Раунд ${roundIndex + 1} Losers Bracket`;
    }
    
    getLosersRoundMatchCount(roundIndex) {
        const winnersRounds = this.winnersRoundCount;
        
        if (roundIndex % 2 === 0) {
            // Четные раунды: только проигравшие из winners bracket
            const winnersRoundIndex = Math.floor(roundIndex / 2);
            return Math.pow(2, winnersRounds - winnersRoundIndex - 2);
        } else {
            // Нечетные раунды: матчи между командами в losers bracket
            const winnersRoundIndex = Math.floor(roundIndex / 2);
            return Math.pow(2, winnersRounds - winnersRoundIndex - 2);
        }
    }
    
    setupConnections() {
        this.setupWinnersConnections();
        this.setupLosersConnections();
        this.setupGrandFinalConnections();
    }
    
    setupWinnersConnections() {
        for (let roundIndex = 0; roundIndex < this.winnersRounds.length - 1; roundIndex++) {
            const currentRound = this.winnersRounds[roundIndex];
            const nextRound = this.winnersRounds[roundIndex + 1];
            
            currentRound.matches.forEach((match, matchIndex) => {
                const nextMatchIndex = Math.floor(matchIndex / 2);
                if (nextMatchIndex < nextRound.matches.length) {
                    match.nextMatchId = nextRound.matches[nextMatchIndex].id;
                }
                
                // Настраиваем куда идут проигравшие в losers bracket
                this.setupLoserDestination(match, roundIndex);
            });
        }
    }
    
    setupLosersConnections() {
        for (let roundIndex = 0; roundIndex < this.losersRounds.length - 1; roundIndex++) {
            const currentRound = this.losersRounds[roundIndex];
            const nextRound = this.losersRounds[roundIndex + 1];
            
            currentRound.matches.forEach((match, matchIndex) => {
                if (roundIndex % 2 === 0) {
                    // Четный раунд: победители идут в следующий раунд
                    match.nextMatchId = nextRound.matches[matchIndex].id;
                } else {
                    // Нечетный раунд: победители идут в следующий четный раунд
                    const nextMatchIndex = Math.floor(matchIndex / 2);
                    if (nextMatchIndex < nextRound.matches.length) {
                        match.nextMatchId = nextRound.matches[nextMatchIndex].id;
                    }
                }
            });
        }
    }
    
    setupLoserDestination(match, winnersRoundIndex) {
        const losersRoundIndex = winnersRoundIndex * 2;
        
        if (losersRoundIndex < this.losersRounds.length) {
            const losersRound = this.losersRounds[losersRoundIndex];
            const matchIndex = match.matchIndex;
            
            if (matchIndex < losersRound.matches.length) {
                match.loserNextMatchId = losersRound.matches[matchIndex].id;
            }
        }
    }
    
    setupGrandFinalConnections() {
        // Победитель winners bracket идет в гранд финал
        const winnersChampion = this.winnersRounds[this.winnersRounds.length - 1].matches[0];
        winnersChampion.nextMatchId = this.grandFinal.id;
        
        // Победитель losers bracket идет в гранд финал
        const losersChampion = this.losersRounds[this.losersRounds.length - 1].matches[0];
        losersChampion.nextMatchId = this.grandFinal.id;
    }
    
    setMatchWinner(matchId, winnerId) {
        const match = this.matches.get(matchId);
        if (!match || match.completed) {
            throw new Error('Матч не найден или уже завершен');
        }
        
        const winner = match.team1?.id === winnerId ? match.team1 : match.team2;
        const loser = match.team1?.id === winnerId ? match.team2 : match.team1;
        
        if (!winner) {
            throw new Error('Команда-победитель не найдена');
        }
        
        match.winner = winner;
        match.loser = loser;
        match.completed = true;
        match.endTime = new Date().toISOString();
        match.status = 'completed';
        
        this.updateNextMatches(match);
        
        return { match, winner, loser };
    }
    
    updateNextMatches(completedMatch) {
        // Обновляем следующий матч для победителя
        if (completedMatch.nextMatchId) {
            const nextMatch = this.matches.get(completedMatch.nextMatchId);
            if (nextMatch) {
                this.addTeamToMatch(nextMatch, completedMatch.winner);
            }
        }
        
        // Обновляем следующий матч для проигравшего (только в winners bracket)
        if (completedMatch.loserNextMatchId && completedMatch.type === 'winners') {
            const loserMatch = this.matches.get(completedMatch.loserNextMatchId);
            if (loserMatch) {
                this.addTeamToMatch(loserMatch, completedMatch.loser);
            }
        }
    }
    
    addTeamToMatch(match, team) {
        if (!match.team1) {
            match.team1 = team;
        } else if (!match.team2) {
            match.team2 = team;
        }
        
        // Проверяем, готов ли матч к началу
        if (match.team1 && match.team2 && !match.isBye) {
            match.status = 'ready';
        }
    }
    
    getBracketData() {
        return {
            type: 'double-elimination',
            winnersRounds: this.winnersRounds,
            losersRounds: this.losersRounds,
            grandFinal: this.grandFinal,
            totalTeams: this.teams.filter(t => t !== null).length,
            totalSlots: this.totalSlots,
            matches: Array.from(this.matches.values()),
            connections: Array.from(this.connections.entries()),
            createdAt: new Date().toISOString()
        };
    }
    
    getMatchById(matchId) {
        return this.matches.get(matchId);
    }
    
    getAllMatches() {
        return Array.from(this.matches.values());
    }
    
    getReadyMatches() {
        return this.getAllMatches().filter(match => 
            match.status === 'ready' && !match.completed
        );
    }
    
    getCompletedMatches() {
        return this.getAllMatches().filter(match => match.completed);
    }
    
    isComplete() {
        return this.grandFinal.completed;
    }
    
    getChampion() {
        return this.isComplete() ? this.grandFinal.winner : null;
    }
    
    getRunnerUp() {
        return this.isComplete() ? this.grandFinal.loser : null;
    }
    
    reset() {
        this.matches.clear();
        this.connections.clear();
        this.winnersRounds = [];
        this.losersRounds = [];
        this.grandFinal = null;
        this.init();
    }
}

// Экспортируем класс для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BracketEngine;
} else {
    window.BracketEngine = BracketEngine;
}