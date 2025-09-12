class TournamentAPI {
    constructor(baseURL = null) {
    if (baseURL) {
        this.baseURL = baseURL;
    } else {
        // Всегда используем абсолютный URL
        this.baseURL = window.location.origin + '/api';
        
        // Для отладки
        console.log('API Base URL:', this.baseURL);
    }

    }


    async request(endpoint, options = {}) {
    const config = {
        credentials: 'include', // Важно для продакшена
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

    
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }


    async getTournaments() {
        return this.request('/tournaments');
    }

    async createTournament(tournamentData) {
        return this.request('/tournaments', {
            method: 'POST',
            body: tournamentData
        });
    }

    async getTournament(id) {
        return this.request(`/tournaments/${id}`);
    }

    async updateTournament(id, tournamentData) {
        return this.request(`/tournaments/${id}`, {
            method: 'PUT',
            body: tournamentData
        });
    }

    async deleteTournament(id) {
        return this.request(`/tournaments/${id}`, {
            method: 'DELETE'
        });
    }


    async getTournamentTeams(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/teams`);
    }

    async addTeamToTournament(tournamentId, teamData) {
        return this.request(`/tournaments/${tournamentId}/teams`, {
            method: 'POST',
            body: teamData
        });
    }

    async updateTeam(teamId, teamData) {
        return this.request(`/teams/${teamId}`, {
            method: 'PUT',
            body: teamData
        });
    }

    async deleteTeam(teamId) {
        return this.request(`/teams/${teamId}`, {
            method: 'DELETE'
        });
    }


    async getTournamentMatches(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/matches`);
    }

    async generateBracket(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/bracket`, {
            method: 'POST'
        });
    }

    async updateMatch(matchId, matchData) {
        return this.request(`/matches/${matchId}`, {
            method: 'PUT',
            body: matchData
        });
    }


    async resetAllData() {
        return this.request('/reset', {
            method: 'DELETE'
        });
    }

    // Сохранение состояния турнира
    async saveTournamentState(tournamentId, state) {
        return this.request(`/tournaments/${tournamentId}/state`, {
            method: 'PUT',
            body: { state }
        });
    }

    // Загрузка состояния турнира
    async loadTournamentState(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/state`);
    }
}





if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentAPI;
}