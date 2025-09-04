const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { initDatabase, tournamentQueries, teamQueries, matchQueries } = require('./database');

// Загрузка переменных окружения из .env файла в режиме разработки
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}

const app = express();
const PORT = process.env.PORT || 3000;


// Настройка CORS для разных окружений
let corsOptions;
if (process.env.NODE_ENV === 'production') {
    // В продакшене разрешаем запросы только с определенных доменов
    corsOptions = {
        origin: [/\.render\.com$/, /localhost/],
        optionsSuccessStatus: 200
    };
} else {
    // В разработке разрешаем запросы со всех источников
    corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200
    };
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Статические файлы
app.use(express.static(path.join(__dirname, '../frontend')));

initDatabase().then(async () => {
    console.log('База данных инициализирована успешно.');
    
    // Создаем тестовые турниры, если их нет
    await createDefaultTournaments();
}).catch(err => {
    console.error('Ошибка инициализации базы данных:', err);
});

// Функция создания тестовых турниров
async function createDefaultTournaments() {
    try {
        // Проверяем, есть ли уже турниры
        const existingTournaments = await tournamentQueries.getAll();
        
        if (existingTournaments.length === 0) {
            console.log('Создание тестовых турниров...');
            
            const defaultTournaments = [
                {
                    id: uuidv4(),
                    name: 'Летний турнир 2024',
                    date: '2024-07-15',
                    location: 'Спортивный комплекс "Олимп"',
                    description: 'Летний турнир для 8 команд с 3 раундами',
                    type: 'single-elimination',
                    participantsCount: 8,
                    seededCount: 0,
                    status: 'created',
                    createdAt: new Date().toISOString()
                },
                {
                    id: uuidv4(),
                    name: 'Кубок чемпионов',
                    date: '2024-08-20',
                    location: 'Центральный стадион',
                    description: 'Престижный турнир на 16 команд',
                    type: 'single-elimination',
                    participantsCount: 16,
                    seededCount: 0,
                    status: 'created',
                    createdAt: new Date().toISOString()
                },
                {
                    id: uuidv4(),
                    name: 'Осенний кубок',
                    date: '2024-09-10',
                    location: 'Городской парк',
                    description: 'Небольшой турнир на 4 команды',
                    type: 'single-elimination',
                    participantsCount: 4,
                    seededCount: 0,
                    status: 'created',
                    createdAt: new Date().toISOString()
                }
            ];
            
            for (const tournament of defaultTournaments) {
                await tournamentQueries.create(tournament);
            }
            
            console.log('Тестовые турниры созданы успешно.');
        }
    } catch (error) {
        console.error('Ошибка создания тестовых турниров:', error);
    }
}




app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await tournamentQueries.getAll();
        res.json(tournaments);
    } catch (error) {
        console.error('Ошибка получения турниров:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/api/tournaments', async (req, res) => {
    const { name, date, location, description, type, participantsCount, seededCount } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Название обязательно' });
    }
    
    const tournament = {
        id: uuidv4(),
        name,
        date: date || null,
        location: location || '',
        description: description || '',
        type: type || 'single-elimination',
        participantsCount: parseInt(participantsCount) || 0,
        seededCount: parseInt(seededCount) || 0,
        status: 'created',
        createdAt: new Date().toISOString()
    };
    
    try {
        const createdTournament = await tournamentQueries.create(tournament);
        res.status(201).json(createdTournament);
    } catch (error) {
        console.error('Ошибка создания турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.get('/api/tournaments/:id', async (req, res) => {
    try {
        const tournament = await tournamentQueries.getById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        res.json(tournament);
    } catch (error) {
        console.error('Ошибка получения турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.put('/api/tournaments/:id', async (req, res) => {
    try {
        const updatedTournament = await tournamentQueries.update(req.params.id, req.body);
        if (!updatedTournament) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        res.json(updatedTournament);
    } catch (error) {
        console.error('Ошибка обновления турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.delete('/api/tournaments/:id', async (req, res) => {
    try {
        const deleted = await tournamentQueries.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка удаления турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.get('/api/tournaments/:id/teams', async (req, res) => {
    try {
        const tournamentTeams = await teamQueries.getByTournamentId(req.params.id);
        res.json(tournamentTeams);
    } catch (error) {
        console.error('Ошибка получения команд:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/api/tournaments/:id/teams', async (req, res) => {
    const { name, players } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Название команды обязательно' });
    }
    
    const team = {
        id: uuidv4(),
        tournamentId: req.params.id,
        name,
        players: JSON.stringify(players || []),
        createdAt: new Date().toISOString()
    };
    
    try {
        const createdTeam = await teamQueries.create(team);
        res.status(201).json(createdTeam);
    } catch (error) {
        console.error('Ошибка создания команды:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.put('/api/teams/:id', async (req, res) => {
    try {
        const updatedTeam = await teamQueries.update(req.params.id, req.body);
        if (!updatedTeam) {
            return res.status(404).json({ error: 'Команда не найдена' });
        }
        res.json(updatedTeam);
    } catch (error) {
        console.error('Ошибка обновления команды:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.delete('/api/teams/:id', async (req, res) => {
    try {
        const deleted = await teamQueries.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Команда не найдена' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка удаления команды:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление всех команд турнира
app.delete('/api/tournaments/:id/teams', async (req, res) => {
    try {
        await teamQueries.deleteByTournamentId(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка удаления команд турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.get('/api/tournaments/:id/matches', async (req, res) => {
    try {
        const tournamentMatches = await matchQueries.getByTournamentId(req.params.id);
        res.json(tournamentMatches);
    } catch (error) {
        console.error('Ошибка получения матчей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/api/tournaments/:id/generate-bracket', async (req, res) => {
    try {
        const tournament = await tournamentQueries.getById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        
        const tournamentTeams = await teamQueries.getByTournamentId(req.params.id);
        
        if (tournamentTeams.length < 2) {
            return res.status(400).json({ error: 'Для генерации сетки нужно минимум 2 команды' });
        }
        

        const shuffledTeams = [...tournamentTeams].sort(() => Math.random() - 0.5);
        const generatedMatches = [];
        

        for (let i = 0; i < shuffledTeams.length; i += 2) {
            if (i + 1 < shuffledTeams.length) {
                const match = {
                    id: uuidv4(),
                    tournamentId: req.params.id,
                    team1Id: shuffledTeams[i].id,
                    team2Id: shuffledTeams[i + 1].id,
                    team1Name: shuffledTeams[i].name,
                    team2Name: shuffledTeams[i + 1].name,
                    round: 1,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                generatedMatches.push(match);
            }
        }
        

        await matchQueries.deleteByTournamentId(req.params.id);
        

        for (const match of generatedMatches) {
            await matchQueries.create(match);
        }
        

        const updatedTournament = await tournamentQueries.update(req.params.id, { status: 'in-progress' });
        
        res.json({ matches: generatedMatches, tournament: updatedTournament });
    } catch (error) {
        console.error('Ошибка генерации сетки:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.put('/api/matches/:id', async (req, res) => {
    try {
        const updatedMatch = await matchQueries.update(req.params.id, req.body);
        if (!updatedMatch) {
            return res.status(404).json({ error: 'Матч не найден' });
        }
        res.json(updatedMatch);
    } catch (error) {
        console.error('Ошибка обновления матча:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Сохранение состояния турнира (POST)
app.post('/api/tournaments/:id/state', async (req, res) => {
    try {
        const state = req.body;
        if (!state) {
            return res.status(400).json({ error: 'Состояние турнира обязательно' });
        }
        
        const updatedTournament = await tournamentQueries.update(req.params.id, {
            state: JSON.stringify(state)
        });
        
        if (!updatedTournament) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        
        res.json({ success: true, message: 'Состояние турнира сохранено' });
    } catch (error) {
        console.error('Ошибка сохранения состояния турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Сохранение состояния турнира (PUT)
app.put('/api/tournaments/:id/state', async (req, res) => {
    try {
        const { state } = req.body;
        if (!state) {
            return res.status(400).json({ error: 'Состояние турнира обязательно' });
        }
        
        const updatedTournament = await tournamentQueries.update(req.params.id, {
            state: JSON.stringify(state)
        });
        
        if (!updatedTournament) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        
        res.json({ success: true, message: 'Состояние турнира сохранено' });
    } catch (error) {
        console.error('Ошибка сохранения состояния турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Загрузка состояния турнира
app.get('/api/tournaments/:id/state', async (req, res) => {
    try {
        const tournament = await tournamentQueries.getById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ error: 'Турнир не найден' });
        }
        
        let state = null;
        if (tournament.state) {
            try {
                state = JSON.parse(tournament.state);
            } catch (parseError) {
                console.error('Ошибка парсинга состояния турнира:', parseError);
                state = null;
            }
        }
        
        res.json({ state });
    } catch (error) {
        console.error('Ошибка загрузки состояния турнира:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


function generateBracket(teams, tournamentId) {
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const bracket = [];
    

    const totalRounds = Math.ceil(Math.log2(shuffledTeams.length));
    

    const firstRoundMatches = [];
    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const match = {
            id: uuidv4(),
            tournamentId,
            round: 1,
            team1: shuffledTeams[i],
            team2: shuffledTeams[i + 1] || null,
            winner: null,
            score: null,
            status: 'pending',
            nextMatchId: null
        };
        
        
        if (!match.team2) {
            match.winner = match.team1;
            match.status = 'completed';
        }
        
        firstRoundMatches.push(match);
    }
    
    bracket.push(...firstRoundMatches);
    

    let currentRoundMatches = firstRoundMatches;
    
    for (let round = 2; round <= totalRounds; round++) {
        const nextRoundMatches = [];
        
        for (let i = 0; i < currentRoundMatches.length; i += 2) {
            const match = {
                id: uuidv4(),
                tournamentId,
                round,
                team1: null,
                team2: null,
                winner: null,
                score: null,
                status: 'pending',
                nextMatchId: null
            };
            
    
            if (currentRoundMatches[i]) {
                currentRoundMatches[i].nextMatchId = match.id;
            }
            if (currentRoundMatches[i + 1]) {
                currentRoundMatches[i + 1].nextMatchId = match.id;
            }
            
            nextRoundMatches.push(match);
        }
        
        bracket.push(...nextRoundMatches);
        currentRoundMatches = nextRoundMatches;
    }
    
    return bracket;
}


app.delete('/api/reset', async (req, res) => {
    try {
        await matchQueries.deleteAll();
        await teamQueries.deleteAll();
        await tournamentQueries.deleteAll();
        res.json({ message: 'Все данные сброшены' });
    } catch (error) {
        console.error('Ошибка сброса данных:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработка всех остальных маршрутов для SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка маршрутов для SPA в продакшене
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка всех остальных маршрутов для SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});

module.exports = app;