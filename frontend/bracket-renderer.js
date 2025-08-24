/**
 * Современный рендерер турнирной сетки Double Elimination
 * Адаптивный дизайн с анимациями и интерактивностью
 */

class BracketRenderer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            theme: 'modern',
            animations: true,
            responsive: true,
            showConnections: true,
            compactMode: false,
            ...options
        };
        
        this.bracket = null;
        this.elements = new Map();
        this.observers = [];
        
        this.init();
    }
    
    init() {
        this.setupContainer();
        this.setupEventListeners();
        this.setupResponsiveObserver();
    }
    
    setupContainer() {
        this.container.className = `bracket-renderer ${this.options.theme}-theme`;
        this.container.innerHTML = '';
        
        // Добавляем основные контейнеры
        this.headerContainer = this.createElement('div', 'bracket-header-container');
        this.bracketsContainer = this.createElement('div', 'brackets-main-container');
        this.footerContainer = this.createElement('div', 'bracket-footer-container');
        
        this.container.appendChild(this.headerContainer);
        this.container.appendChild(this.bracketsContainer);
        this.container.appendChild(this.footerContainer);
    }
    
    setupEventListeners() {
        // Обработчики для выбора победителя
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-winner-btn')) {
                this.handleWinnerSelection(e);
            }
        });
        
        // Обработчики для hover эффектов
        this.container.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('bracket-match')) {
                this.highlightConnections(e.target);
            }
        }, true);
        
        this.container.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('bracket-match')) {
                this.clearHighlights();
            }
        }, true);
    }
    
    setupResponsiveObserver() {
        if (!this.options.responsive) return;
        
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                this.handleResize(entry.contentRect);
            }
        });
        
        observer.observe(this.container);
        this.observers.push(observer);
    }
    
    render(bracket) {
        this.bracket = bracket;
        this.elements.clear();
        
        try {
            this.renderHeader();
            this.renderBrackets();
            this.renderFooter();
            
            if (this.options.animations) {
                this.animateEntrance();
            }
            
        } catch (error) {
            console.error('Ошибка при рендеринге сетки:', error);
            this.renderError(error.message);
        }
    }
    
    renderHeader() {
        const bracketData = this.bracket.getBracketData();
        
        this.headerContainer.innerHTML = `
            <div class="bracket-title">
                <h2>Турнирная сетка Double Elimination</h2>
                <div class="bracket-stats">
                    <div class="stat-item">
                        <span class="stat-value">${bracketData.totalTeams}</span>
                        <span class="stat-label">Команд</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${bracketData.winnersRounds.length}</span>
                        <span class="stat-label">Раундов Winners</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${bracketData.losersRounds.length}</span>
                        <span class="stat-label">Раундов Losers</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.bracket.getAllMatches().length}</span>
                        <span class="stat-label">Всего матчей</span>
                    </div>
                </div>
            </div>
            <div class="bracket-controls">
                <button class="control-btn" data-action="zoom-in" title="Увеличить">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="control-btn" data-action="zoom-out" title="Уменьшить">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="control-btn" data-action="fit-screen" title="По размеру экрана">
                    <i class="fas fa-expand-arrows-alt"></i>
                </button>
                <button class="control-btn" data-action="toggle-compact" title="Компактный режим">
                    <i class="fas fa-compress"></i>
                </button>
            </div>
        `;
    }
    
    renderBrackets() {
        this.bracketsContainer.innerHTML = '';
        
        // Создаем контейнеры для Winners и Losers Bracket
        const winnersContainer = this.createElement('div', 'winners-bracket-section');
        const losersContainer = this.createElement('div', 'losers-bracket-section');
        const grandFinalContainer = this.createElement('div', 'grand-final-section');
        
        // Рендерим Winners Bracket
        this.renderWinnersBracket(winnersContainer);
        
        // Рендерим Losers Bracket
        this.renderLosersBracket(losersContainer);
        
        // Рендерим Grand Final
        this.renderGrandFinal(grandFinalContainer);
        
        this.bracketsContainer.appendChild(winnersContainer);
        this.bracketsContainer.appendChild(losersContainer);
        this.bracketsContainer.appendChild(grandFinalContainer);
    }
    
    renderWinnersBracket(container) {
        const header = this.createElement('div', 'bracket-section-header');
        header.innerHTML = `
            <h3><i class="fas fa-trophy"></i> Winners Bracket</h3>
            <div class="section-info">Путь к победе</div>
        `;
        
        const roundsContainer = this.createElement('div', 'bracket-rounds-container');
        
        this.bracket.winnersRounds.forEach((round, index) => {
            const roundElement = this.renderRound(round, index, 'winners');
            roundsContainer.appendChild(roundElement);
        });
        
        container.appendChild(header);
        container.appendChild(roundsContainer);
    }
    
    renderLosersBracket(container) {
        const header = this.createElement('div', 'bracket-section-header');
        header.innerHTML = `
            <h3><i class="fas fa-heart-broken"></i> Losers Bracket</h3>
            <div class="section-info">Второй шанс</div>
        `;
        
        const roundsContainer = this.createElement('div', 'bracket-rounds-container');
        
        this.bracket.losersRounds.forEach((round, index) => {
            const roundElement = this.renderRound(round, index, 'losers');
            roundsContainer.appendChild(roundElement);
        });
        
        container.appendChild(header);
        container.appendChild(roundsContainer);
    }
    
    renderGrandFinal(container) {
        const header = this.createElement('div', 'bracket-section-header grand-final-header');
        header.innerHTML = `
            <h3><i class="fas fa-crown"></i> Grand Final</h3>
            <div class="section-info">Решающий матч</div>
        `;
        
        const matchContainer = this.createElement('div', 'grand-final-container');
        const matchElement = this.renderMatch(this.bracket.grandFinal, 'grand-final', 0, 0);
        matchContainer.appendChild(matchElement);
        
        container.appendChild(header);
        container.appendChild(matchContainer);
    }
    
    renderRound(round, roundIndex, bracketType) {
        const roundElement = this.createElement('div', `bracket-round ${bracketType}-round`);
        roundElement.dataset.roundIndex = roundIndex;
        roundElement.dataset.bracketType = bracketType;
        
        const roundHeader = this.createElement('div', 'round-header');
        roundHeader.innerHTML = `
            <h4 class="round-title">${round.name}</h4>
            <div class="round-info">
                <span class="match-count">${round.matches.length} матч(ей)</span>
            </div>
        `;
        
        const matchesContainer = this.createElement('div', 'round-matches');
        
        round.matches.forEach((match, matchIndex) => {
            const matchElement = this.renderMatch(match, bracketType, roundIndex, matchIndex);
            matchesContainer.appendChild(matchElement);
        });
        
        roundElement.appendChild(roundHeader);
        roundElement.appendChild(matchesContainer);
        
        return roundElement;
    }
    
    renderMatch(match, bracketType, roundIndex, matchIndex) {
        const matchElement = this.createElement('div', 
            `bracket-match ${bracketType}-match ${match.completed ? 'completed' : ''} ${match.isBye ? 'bye-match' : ''}`
        );
        
        matchElement.dataset.matchId = match.id;
        matchElement.dataset.bracketType = bracketType;
        
        const matchHeader = this.createElement('div', 'match-header');
        matchHeader.innerHTML = `
            <div class="match-number">${this.getMatchDisplayNumber(match, bracketType, roundIndex, matchIndex)}</div>
            <div class="match-status ${match.status}">${this.getStatusText(match.status)}</div>
            ${match.isBye ? '<div class="bye-indicator">BYE</div>' : ''}
        `;
        
        const teamsContainer = this.createElement('div', 'match-teams');
        
        if (!match.isBye) {
            const team1Element = this.renderTeam(match.team1, match.winner?.id === match.team1?.id, 1);
            const team2Element = this.renderTeam(match.team2, match.winner?.id === match.team2?.id, 2);
            
            teamsContainer.appendChild(team1Element);
            teamsContainer.appendChild(this.createElement('div', 'vs-divider', 'VS'));
            teamsContainer.appendChild(team2Element);
        } else {
            const byeElement = this.createElement('div', 'bye-message');
            byeElement.innerHTML = `
                <div class="bye-team">${match.team1?.name || match.team2?.name || 'TBD'}</div>
                <div class="bye-text">проходит без игры</div>
            `;
            teamsContainer.appendChild(byeElement);
        }
        
        const actionsContainer = this.createElement('div', 'match-actions');
        if (!match.completed && !match.isBye && match.team1 && match.team2) {
            actionsContainer.innerHTML = `
                <button class="select-winner-btn team1-btn" data-match-id="${match.id}" data-team-id="${match.team1.id}">
                    Победа ${match.team1.name}
                </button>
                <button class="select-winner-btn team2-btn" data-match-id="${match.id}" data-team-id="${match.team2.id}">
                    Победа ${match.team2.name}
                </button>
            `;
        }
        
        matchElement.appendChild(matchHeader);
        matchElement.appendChild(teamsContainer);
        matchElement.appendChild(actionsContainer);
        
        this.elements.set(match.id, matchElement);
        
        return matchElement;
    }
    
    renderTeam(team, isWinner, position) {
        const teamElement = this.createElement('div', 
            `match-team ${isWinner ? 'winner' : ''} team-${position}`
        );
        
        if (team) {
            teamElement.innerHTML = `
                <div class="team-info">
                    <div class="team-name">${team.name}</div>
                    ${team.seed ? `<div class="team-seed">#${team.seed}</div>` : ''}
                </div>
                <div class="team-score">${team.score || 0}</div>
                ${isWinner ? '<div class="winner-indicator"><i class="fas fa-crown"></i></div>' : ''}
            `;
        } else {
            teamElement.innerHTML = `
                <div class="team-info">
                    <div class="team-name placeholder">TBD</div>
                </div>
                <div class="team-score">-</div>
            `;
        }
        
        return teamElement;
    }
    
    renderFooter() {
        const completedMatches = this.bracket.getCompletedMatches().length;
        const totalMatches = this.bracket.getAllMatches().length;
        const progress = (completedMatches / totalMatches) * 100;
        
        this.footerContainer.innerHTML = `
            <div class="bracket-progress">
                <div class="progress-info">
                    <span>Прогресс турнира: ${completedMatches} из ${totalMatches} матчей</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="bracket-legend">
                <div class="legend-item">
                    <div class="legend-color winner"></div>
                    <span>Победитель</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color ready"></div>
                    <span>Готов к игре</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color pending"></div>
                    <span>Ожидание</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color bye"></div>
                    <span>Проход без игры</span>
                </div>
            </div>
        `;
    }
    
    renderError(message) {
        this.container.innerHTML = `
            <div class="bracket-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="error-message">
                    <h3>Ошибка при создании турнирной сетки</h3>
                    <p>${message}</p>
                </div>
                <button class="retry-btn" onclick="location.reload()">
                    Попробовать снова
                </button>
            </div>
        `;
    }
    
    handleWinnerSelection(event) {
        const matchId = event.target.dataset.matchId;
        const teamId = event.target.dataset.teamId;
        
        if (!matchId || !teamId) return;
        
        try {
            const result = this.bracket.setMatchWinner(matchId, teamId);
            this.updateMatchDisplay(result.match);
            this.updateConnectedMatches(result.match);
            
            // Показываем уведомление
            this.showNotification(`${result.winner.name} побеждает!`, 'success');
            
            // Проверяем, завершен ли турнир
            if (this.bracket.isComplete()) {
                this.showChampionCelebration();
            }
            
        } catch (error) {
            console.error('Ошибка при выборе победителя:', error);
            this.showNotification(error.message, 'error');
        }
    }
    
    updateMatchDisplay(match) {
        const element = this.elements.get(match.id);
        if (!element) return;
        
        element.classList.add('completed');
        element.classList.remove('ready', 'pending');
        
        // Обновляем команды
        const teams = element.querySelectorAll('.match-team');
        teams.forEach((teamEl, index) => {
            const team = index === 0 ? match.team1 : match.team2;
            const isWinner = match.winner?.id === team?.id;
            
            teamEl.classList.toggle('winner', isWinner);
            
            if (isWinner) {
                const winnerIndicator = teamEl.querySelector('.winner-indicator');
                if (!winnerIndicator) {
                    const indicator = this.createElement('div', 'winner-indicator');
                    indicator.innerHTML = '<i class="fas fa-crown"></i>';
                    teamEl.appendChild(indicator);
                }
            }
        });
        
        // Убираем кнопки выбора
        const actions = element.querySelector('.match-actions');
        if (actions) {
            actions.innerHTML = `
                <div class="match-result">
                    <i class="fas fa-check-circle"></i>
                    Матч завершен
                </div>
            `;
        }
        
        // Анимация завершения
        if (this.options.animations) {
            element.style.animation = 'matchComplete 0.6s ease-out';
        }
    }
    
    updateConnectedMatches(completedMatch) {
        // Обновляем следующие матчи
        const nextMatches = [completedMatch.nextMatchId, completedMatch.loserNextMatchId]
            .filter(id => id)
            .map(id => this.bracket.getMatchById(id))
            .filter(match => match);
        
        nextMatches.forEach(match => {
            const element = this.elements.get(match.id);
            if (element && match.team1 && match.team2) {
                element.classList.add('ready');
                element.classList.remove('pending');
                
                // Перерендериваем матч
                const newElement = this.renderMatch(match, match.type, match.roundIndex, match.matchIndex);
                element.replaceWith(newElement);
            }
        });
    }
    
    highlightConnections(matchElement) {
        if (!this.options.showConnections) return;
        
        const matchId = matchElement.dataset.matchId;
        const match = this.bracket.getMatchById(matchId);
        
        if (!match) return;
        
        // Подсвечиваем связанные матчи
        [match.nextMatchId, match.loserNextMatchId]
            .filter(id => id)
            .forEach(id => {
                const element = this.elements.get(id);
                if (element) {
                    element.classList.add('connected-highlight');
                }
            });
    }
    
    clearHighlights() {
        this.container.querySelectorAll('.connected-highlight')
            .forEach(el => el.classList.remove('connected-highlight'));
    }
    
    showChampionCelebration() {
        const champion = this.bracket.getChampion();
        const runnerUp = this.bracket.getRunnerUp();
        
        const celebration = this.createElement('div', 'champion-celebration');
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="champion-crown">
                    <i class="fas fa-crown"></i>
                </div>
                <h2>Поздравляем победителя!</h2>
                <div class="champion-name">${champion.name}</div>
                <div class="runner-up">2-е место: ${runnerUp.name}</div>
                <button class="close-celebration" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="celebration-confetti"></div>
        `;
        
        this.container.appendChild(celebration);
        
        // Анимация конфетти
        if (this.options.animations) {
            this.animateConfetti(celebration.querySelector('.celebration-confetti'));
        }
    }
    
    animateConfetti(container) {
        for (let i = 0; i < 50; i++) {
            const confetti = this.createElement('div', 'confetti-piece');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = this.getRandomColor();
            container.appendChild(confetti);
        }
    }
    
    animateEntrance() {
        const elements = this.container.querySelectorAll('.bracket-match, .bracket-section-header');
        elements.forEach((el, index) => {
            el.style.animationDelay = (index * 0.1) + 's';
            el.classList.add('animate-entrance');
        });
    }
    
    handleResize(rect) {
        const isSmall = rect.width < 768;
        const isMedium = rect.width < 1200;
        
        this.container.classList.toggle('compact-mode', isSmall);
        this.container.classList.toggle('medium-mode', isMedium && !isSmall);
    }
    
    showNotification(message, type = 'info') {
        const notification = this.createElement('div', `notification ${type}`);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    getMatchDisplayNumber(match, bracketType, roundIndex, matchIndex) {
        if (bracketType === 'grand-final') return 'GF';
        if (bracketType === 'winners') return `W${roundIndex + 1}.${matchIndex + 1}`;
        if (bracketType === 'losers') return `L${roundIndex + 1}.${matchIndex + 1}`;
        return `${matchIndex + 1}`;
    }
    
    getStatusText(status) {
        const statusMap = {
            'pending': 'Ожидание',
            'ready': 'Готов',
            'in-progress': 'Идет игра',
            'completed': 'Завершен'
        };
        return statusMap[status] || status;
    }
    
    getNotificationIcon(type) {
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return iconMap[type] || 'info-circle';
    }
    
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
    
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.elements.clear();
        this.container.innerHTML = '';
    }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BracketRenderer;
} else {
    window.BracketRenderer = BracketRenderer;
}