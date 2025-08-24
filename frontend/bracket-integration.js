/**
 * Интеграция нового движка турнирной сетки с существующим кодом
 * Обеспечивает совместимость и плавный переход
 */

// Глобальные переменные для интеграции
let modernBracketEngine = null;
let modernBracketRenderer = null;
let isModernBracketActive = false;

/**
 * Инициализация современной турнирной сетки
 */
function initModernBracket() {
    try {
        // Проверяем доступность классов
        if (typeof BracketEngine === 'undefined' || typeof BracketRenderer === 'undefined') {
            console.error('Современные классы турнирной сетки не загружены');
            return false;
        }
        
        // Получаем контейнер
        const container = document.getElementById('tournament-bracket-section');
        if (!container) {
            console.error('Контейнер турнирной сетки не найден');
            return false;
        }
        
        // Создаем экземпляры
        modernBracketEngine = new BracketEngine();
        modernBracketRenderer = new BracketRenderer(container, {
            theme: 'modern',
            animations: true,
            responsive: true,
            showConnections: true
        });
        
        isModernBracketActive = true;
        console.log('Современная турнирная сетка инициализирована');
        return true;
        
    } catch (error) {
        console.error('Ошибка инициализации современной турнирной сетки:', error);
        return false;
    }
}

/**
 * Создание турнирной сетки с использованием нового движка
 */
function createModernDoubleEliminationBracket(teams) {
    try {
        if (!isModernBracketActive) {
            console.warn('Современная сетка не активна, используем старый метод');
            return createDoubleEliminationBracket(teams);
        }
        
        // Валидация команд
        if (!Array.isArray(teams) || teams.length < 2) {
            throw new Error('Необходимо минимум 2 команды для создания турнира');
        }
        
        // Преобразуем команды в нужный формат
        const formattedTeams = teams.map((team, index) => ({
            id: team.id || `team_${index + 1}`,
            name: team.name || team,
            seed: index + 1,
            score: 0
        }));
        
        // Создаем сетку
        const bracket = modernBracketEngine.createBracket(formattedTeams);
        
        // Сохраняем в глобальную переменную для совместимости
        window.currentTournament = {
            type: 'double-elimination',
            teams: formattedTeams,
            bracket: bracket,
            engine: modernBracketEngine
        };
        
        return bracket;
        
    } catch (error) {
        console.error('Ошибка создания современной турнирной сетки:', error);
        throw error;
    }
}

/**
 * Отображение турнирной сетки с использованием нового рендерера
 */
function renderModernDoubleEliminationBracket(bracket) {
    try {
        if (!isModernBracketActive || !modernBracketRenderer) {
            console.warn('Современный рендерер не активен, используем старый метод');
            return renderDoubleEliminationBracket(bracket);
        }
        
        // Рендерим сетку
        modernBracketRenderer.render(modernBracketEngine);
        
        // Обновляем интерфейс
        updateTournamentInterface();
        
        console.log('Современная турнирная сетка отображена');
        
    } catch (error) {
        console.error('Ошибка отображения современной турнирной сетки:', error);
        throw error;
    }
}

/**
 * Установка победителя матча с использованием нового движка
 */
function setModernMatchWinner(matchId, teamId) {
    try {
        if (!isModernBracketActive || !modernBracketEngine) {
            console.warn('Современный движок не активен, используем старый метод');
            return setDoubleEliminationMatchWinner(matchId, teamId);
        }
        
        // Устанавливаем победителя
        const result = modernBracketEngine.setMatchWinner(matchId, teamId);
        
        // Обновляем отображение
        if (modernBracketRenderer) {
            modernBracketRenderer.updateMatchDisplay(result.match);
            modernBracketRenderer.updateConnectedMatches(result.match);
        }
        
        // Проверяем завершение турнира
        if (modernBracketEngine.isComplete()) {
            handleTournamentComplete();
        }
        
        return result;
        
    } catch (error) {
        console.error('Ошибка установки победителя:', error);
        throw error;
    }
}

/**
 * Обработка завершения турнира
 */
function handleTournamentComplete() {
    try {
        const champion = modernBracketEngine.getChampion();
        const runnerUp = modernBracketEngine.getRunnerUp();
        
        console.log('Турнир завершен!');
        console.log('Чемпион:', champion.name);
        console.log('Второе место:', runnerUp.name);
        
        // Показываем празднование
        if (modernBracketRenderer) {
            modernBracketRenderer.showChampionCelebration();
        }
        
        // Обновляем статистику
        updateTournamentStats({
            champion: champion,
            runnerUp: runnerUp,
            totalMatches: modernBracketEngine.getAllMatches().length,
            completedMatches: modernBracketEngine.getCompletedMatches().length
        });
        
    } catch (error) {
        console.error('Ошибка обработки завершения турнира:', error);
    }
}

/**
 * Обновление интерфейса турнира
 */
function updateTournamentInterface() {
    try {
        // Обновляем кнопки управления
        const bracketActions = document.querySelector('.bracket-actions');
        if (bracketActions && isModernBracketActive) {
            // Добавляем современные кнопки управления
            const modernControls = document.createElement('div');
            modernControls.className = 'modern-bracket-controls';
            modernControls.innerHTML = `
                <button class="modern-btn" onclick="toggleBracketTheme()">
                    <i class="fas fa-palette"></i> Сменить тему
                </button>
                <button class="modern-btn" onclick="toggleBracketAnimations()">
                    <i class="fas fa-magic"></i> Анимации
                </button>
                <button class="modern-btn" onclick="exportBracketData()">
                    <i class="fas fa-download"></i> Экспорт
                </button>
                <button class="modern-btn" onclick="resetBracket()">
                    <i class="fas fa-redo"></i> Сброс
                </button>
            `;
            
            // Добавляем только если еще не добавлено
            if (!bracketActions.querySelector('.modern-bracket-controls')) {
                bracketActions.appendChild(modernControls);
            }
        }
        
    } catch (error) {
        console.error('Ошибка обновления интерфейса:', error);
    }
}

/**
 * Обновление статистики турнира
 */
function updateTournamentStats(stats) {
    try {
        // Обновляем существующие элементы статистики
        const statsElements = {
            champion: document.querySelector('.tournament-champion'),
            runnerUp: document.querySelector('.tournament-runner-up'),
            progress: document.querySelector('.tournament-progress')
        };
        
        if (statsElements.champion) {
            statsElements.champion.textContent = stats.champion.name;
        }
        
        if (statsElements.runnerUp) {
            statsElements.runnerUp.textContent = stats.runnerUp.name;
        }
        
        if (statsElements.progress) {
            const progressPercent = (stats.completedMatches / stats.totalMatches) * 100;
            statsElements.progress.style.width = `${progressPercent}%`;
        }
        
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
    }
}

/**
 * Переключение темы сетки
 */
function toggleBracketTheme() {
    try {
        if (!modernBracketRenderer) return;
        
        const container = modernBracketRenderer.container;
        const isDark = container.classList.contains('dark-theme');
        
        if (isDark) {
            container.classList.remove('dark-theme');
            container.classList.add('modern-theme');
        } else {
            container.classList.remove('modern-theme');
            container.classList.add('dark-theme');
        }
        
        // Сохраняем предпочтение
        localStorage.setItem('bracketTheme', isDark ? 'modern' : 'dark');
        
    } catch (error) {
        console.error('Ошибка переключения темы:', error);
    }
}

/**
 * Переключение анимаций
 */
function toggleBracketAnimations() {
    try {
        if (!modernBracketRenderer) return;
        
        const container = modernBracketRenderer.container;
        const hasAnimations = !container.classList.contains('no-animations');
        
        container.classList.toggle('no-animations', hasAnimations);
        modernBracketRenderer.options.animations = !hasAnimations;
        
        // Сохраняем предпочтение
        localStorage.setItem('bracketAnimations', hasAnimations ? 'false' : 'true');
        
        // Показываем уведомление
        if (modernBracketRenderer.showNotification) {
            modernBracketRenderer.showNotification(
                hasAnimations ? 'Анимации отключены' : 'Анимации включены',
                'info'
            );
        }
        
    } catch (error) {
        console.error('Ошибка переключения анимаций:', error);
    }
}

/**
 * Экспорт данных сетки
 */
function exportBracketData() {
    try {
        if (!modernBracketEngine) return;
        
        const bracketData = modernBracketEngine.getBracketData();
        const exportData = {
            timestamp: new Date().toISOString(),
            tournament: window.currentTournament,
            bracket: bracketData,
            matches: modernBracketEngine.getAllMatches(),
            champion: modernBracketEngine.isComplete() ? modernBracketEngine.getChampion() : null
        };
        
        // Создаем и скачиваем файл
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tournament-bracket-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Показываем уведомление
        if (modernBracketRenderer && modernBracketRenderer.showNotification) {
            modernBracketRenderer.showNotification('Данные турнира экспортированы', 'success');
        }
        
    } catch (error) {
        console.error('Ошибка экспорта данных:', error);
    }
}

/**
 * Сброс турнирной сетки
 */
function resetBracket() {
    try {
        if (!confirm('Вы уверены, что хотите сбросить турнирную сетку? Все данные будут потеряны.')) {
            return;
        }
        
        // Очищаем данные
        if (modernBracketEngine) {
            modernBracketEngine = new BracketEngine();
        }
        
        if (modernBracketRenderer) {
            modernBracketRenderer.container.innerHTML = '';
        }
        
        // Очищаем глобальные переменные
        window.currentTournament = null;
        
        // Показываем уведомление
        if (modernBracketRenderer && modernBracketRenderer.showNotification) {
            modernBracketRenderer.showNotification('Турнирная сетка сброшена', 'info');
        }
        
        console.log('Турнирная сетка сброшена');
        
    } catch (error) {
        console.error('Ошибка сброса сетки:', error);
    }
}

/**
 * Загрузка сохраненных настроек
 */
function loadBracketSettings() {
    try {
        // Загружаем тему
        const savedTheme = localStorage.getItem('bracketTheme');
        if (savedTheme && modernBracketRenderer) {
            const container = modernBracketRenderer.container;
            container.classList.remove('modern-theme', 'dark-theme');
            container.classList.add(`${savedTheme}-theme`);
        }
        
        // Загружаем настройки анимаций
        const savedAnimations = localStorage.getItem('bracketAnimations');
        if (savedAnimations === 'false' && modernBracketRenderer) {
            modernBracketRenderer.container.classList.add('no-animations');
            modernBracketRenderer.options.animations = false;
        }
        
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
    }
}

/**
 * Переопределение старых функций для совместимости
 */
function overrideOldFunctions() {
    // Сохраняем оригинальные функции
    window.originalCreateDoubleEliminationBracket = window.createDoubleEliminationBracket;
    window.originalRenderDoubleEliminationBracket = window.renderDoubleEliminationBracket;
    window.originalSetDoubleEliminationMatchWinner = window.setDoubleEliminationMatchWinner;
    
    // Переопределяем функции
    window.createDoubleEliminationBracket = function(teams) {
        if (isModernBracketActive) {
            return createModernDoubleEliminationBracket(teams);
        }
        return window.originalCreateDoubleEliminationBracket(teams);
    };
    
    window.renderDoubleEliminationBracket = function(bracket) {
        if (isModernBracketActive) {
            return renderModernDoubleEliminationBracket(bracket);
        }
        return window.originalRenderDoubleEliminationBracket(bracket);
    };
    
    window.setDoubleEliminationMatchWinner = function(matchId, teamId) {
        if (isModernBracketActive) {
            return setModernMatchWinner(matchId, teamId);
        }
        return window.originalSetDoubleEliminationMatchWinner(matchId, teamId);
    };
}

/**
 * Инициализация интеграции при загрузке страницы
 */
function initBracketIntegration() {
    try {
        console.log('Инициализация интеграции турнирной сетки...');
        
        // Ждем загрузки всех скриптов
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initBracketIntegration);
            return;
        }
        
        // Инициализируем современную сетку
        const success = initModernBracket();
        
        if (success) {
            // Переопределяем старые функции
            overrideOldFunctions();
            
            // Загружаем настройки
            loadBracketSettings();
            
            console.log('Интеграция турнирной сетки завершена успешно');
        } else {
            console.warn('Не удалось инициализировать современную сетку, используем старую версию');
        }
        
    } catch (error) {
        console.error('Ошибка инициализации интеграции:', error);
    }
}

/**
 * Проверка совместимости браузера
 */
function checkBrowserCompatibility() {
    const requiredFeatures = [
        'ResizeObserver',
        'IntersectionObserver',
        'CSS.supports',
        'fetch'
    ];
    
    const unsupported = requiredFeatures.filter(feature => {
        try {
            return !window[feature] && !CSS.supports(feature);
        } catch {
            return true;
        }
    });
    
    if (unsupported.length > 0) {
        console.warn('Некоторые функции могут не работать:', unsupported);
        return false;
    }
    
    return true;
}

// Экспортируем функции для глобального использования
window.initModernBracket = initModernBracket;
window.createModernDoubleEliminationBracket = createModernDoubleEliminationBracket;
window.renderModernDoubleEliminationBracket = renderModernDoubleEliminationBracket;
window.setModernMatchWinner = setModernMatchWinner;
window.toggleBracketTheme = toggleBracketTheme;
window.toggleBracketAnimations = toggleBracketAnimations;
window.exportBracketData = exportBracketData;
window.resetBracket = resetBracket;

// Автоматическая инициализация
if (checkBrowserCompatibility()) {
    initBracketIntegration();
} else {
    console.warn('Браузер не поддерживает все необходимые функции для современной турнирной сетки');
}