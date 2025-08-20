// Данные о матчах
const tournamentData = {
    // Информация о турнире
    tournamentInfo: {
        name: "Кубок победителей 2023",
        date: "15-17 сент",
        location: "г.Сочи, пляж Волна"
    },
    
    // Данные о раундах и матчах
    rounds: [
        {
            name: "1/8 финала",
            matches: [
                {
                    id: 1,
                    title: "Матч 1",
                    team1: {
                        name: "Иванов/Петров",
                        score: 2,
                        isWinner: true
                    },
                    team2: {
                        name: "Сидоров/Петров",
                        score: 0,
                        isWinner: false
                    }
                },
                {
                    id: 2,
                    title: "Матч 2",
                    team1: {
                        name: "Смирнов/Попов",
                        score: 2,
                        isWinner: true
                    },
                    team2: {
                        name: "Васильев/Морозов",
                        score: 1,
                        isWinner: false
                    }
                },
                {
                    id: 3,
                    title: "Матч 3",
                    team1: {
                        name: "Волков/Алексеев",
                        score: 2,
                        isWinner: true
                    },
                    team2: {
                        name: "Новиков/Фёдоров",
                        score: 1,
                        isWinner: false
                    }
                },
                {
                    id: 4,
                    title: "Матч 4",
                    team1: {
                        name: "Лебедев/Семёнов",
                        score: 0,
                        isWinner: false
                    },
                    team2: {
                        name: "Егоров/Павлов",
                        score: 1,
                        isWinner: true
                    }
                }
            ]
        },
        {
            name: "1/4 финала",
            matches: [
                {
                    id: 5,
                    title: "Матч 5",
                    team1: {
                        name: "Иванов/Петров",
                        score: 2,
                        isWinner: true
                    },
                    team2: {
                        name: "Смирнов/Попов",
                        score: 1,
                        isWinner: false
                    }
                },
                {
                    id: 6,
                    title: "Матч 6",
                    team1: {
                        name: "Волков/Алексеев",
                        score: 2,
                        isWinner: true
                    },
                    team2: {
                        name: "Егоров/Павлов",
                        score: 1,
                        isWinner: false
                    }
                }
            ]
        },
        {
            name: "1/2 финала",
            matches: [
                {
                    id: 7,
                    title: "Матч 7",
                    team1: {
                        name: "Иванов/Петров",
                        score: 2,
                        isWinner: true
                    },
                    team2: {
                        name: "Волков/Алексеев",
                        score: 1,
                        isWinner: false
                    }
                }
            ]
        },
        {
            name: "Финал",
            matches: [
                {
                    id: 8,
                    title: "Матч 8",
                    team1: {
                        name: "Иванов/Петров",
                        score: 1,
                        isWinner: false
                    },
                    team2: {
                        name: "Соколов/Орлов",
                        score: 2,
                        isWinner: true
                    }
                }
            ]
        },
        {
            name: "Победитель",
            matches: [
                {
                    id: 9,
                    title: "",
                    team1: {
                        name: "Соколов/Орлов",
                        score: null,
                        isWinner: true
                    },
                    team2: null
                }
            ]
        }
    ]
};

// Функция для отображения турнирной сетки
function renderTournamentBracket() {
    const bracketContainer = document.getElementById('tournament-bracket');
    
    // Очищаем контейнер перед заполнением
    bracketContainer.innerHTML = '';
    
    // Проходим по всем раундам
    tournamentData.rounds.forEach(round => {
        // Создаем элемент для раунда
        const roundElement = document.createElement('div');
        roundElement.className = 'round';
        
        // Добавляем заголовок раунда
        const roundTitle = document.createElement('div');
        roundTitle.className = 'round-title';
        roundTitle.textContent = round.name;
        roundElement.appendChild(roundTitle);
        
        // Добавляем матчи раунда
        round.matches.forEach(match => {
            // Создаем элемент для матча
            const matchElement = document.createElement('div');
            matchElement.className = 'match';
            
            // Добавляем заголовок матча
            if (match.title) {
                const matchTitle = document.createElement('div');
                matchTitle.className = 'match-title';
                matchTitle.textContent = match.title;
                matchElement.appendChild(matchTitle);
            }
            
            // Добавляем первую команду
            if (match.team1) {
                const team1Element = document.createElement('div');
                team1Element.className = 'team';
                if (match.team1.isWinner) {
                    team1Element.classList.add('winner');
                }
                
                // Если это победитель (последний раунд)
                if (round.name === 'Победитель') {
                    team1Element.style.justifyContent = 'center';
                }
                
                const team1Name = document.createElement('span');
                team1Name.className = 'team-name';
                team1Name.textContent = match.team1.name;
                team1Element.appendChild(team1Name);
                
                // Добавляем счет, если он есть
                if (match.team1.score !== null) {
                    const team1Score = document.createElement('span');
                    team1Score.className = 'score';
                    team1Score.textContent = match.team1.score;
                    team1Element.appendChild(team1Score);
                }
                
                matchElement.appendChild(team1Element);
            }
            
            // Добавляем вторую команду, если она есть
            if (match.team2) {
                const team2Element = document.createElement('div');
                team2Element.className = 'team';
                if (match.team2.isWinner) {
                    team2Element.classList.add('winner');
                }
                
                const team2Name = document.createElement('span');
                team2Name.className = 'team-name';
                team2Name.textContent = match.team2.name;
                team2Element.appendChild(team2Name);
                
                const team2Score = document.createElement('span');
                team2Score.className = 'score';
                team2Score.textContent = match.team2.score;
                team2Element.appendChild(team2Score);
                
                matchElement.appendChild(team2Element);
            }
            
            roundElement.appendChild(matchElement);
        });
        
        bracketContainer.appendChild(roundElement);
    });
}

// Обработчик события для кнопки обновления
document.getElementById('update-btn').addEventListener('click', function() {
    // Здесь можно добавить логику фильтрации по категории и стадии
    const category = document.getElementById('category').value;
    const stage = document.getElementById('stage').value;
    
    console.log(`Фильтрация: ${category}, ${stage}`);
    
    // Перерисовываем турнирную сетку
    renderTournamentBracket();
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Заполняем информацию о турнире
    const tournamentInfo = tournamentData.tournamentInfo;
    document.querySelector('.tournament-info div:nth-child(1) strong').nextSibling.textContent = ` ${tournamentInfo.name}`;
    document.querySelector('.tournament-info div:nth-child(2) strong').nextSibling.textContent = ` ${tournamentInfo.date}`;
    document.querySelector('.tournament-info div:nth-child(3) strong').nextSibling.textContent = ` ${tournamentInfo.location}`;
    
    // Отображаем турнирную сетку
    renderTournamentBracket();
});