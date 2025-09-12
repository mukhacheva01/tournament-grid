const mysql = require('mysql2/promise');
require('dotenv').config();

// Конфигурация MySQL
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tournament_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Создание пула соединений
const pool = mysql.createPool(config);

console.log('Подключение к MySQL базе данных:', config.host + ':' + config.port + '/' + config.database);

// Инициализация базы данных
async function initDatabase() {
    try {
        console.log('Инициализация MySQL базы данных');
        
        // Создание таблицы tournaments
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS tournaments (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                startDate TIMESTAMP NULL,
                endDate TIMESTAMP NULL,
                maxTeams INT DEFAULT 8,
                status VARCHAR(50) DEFAULT 'upcoming',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Таблица tournaments создана или уже существует.');
        
        // Создание таблицы teams
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS teams (
                id VARCHAR(255) PRIMARY KEY,
                tournamentId VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                players TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournamentId) REFERENCES tournaments(id) ON DELETE CASCADE
            )
        `);
        console.log('Таблица teams создана или уже существует.');
        
        // Создание таблицы matches
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS matches (
                id VARCHAR(255) PRIMARY KEY,
                tournamentId VARCHAR(255) NOT NULL,
                round INT NOT NULL,
                position INT NOT NULL,
                team1Id VARCHAR(255),
                team2Id VARCHAR(255),
                team1Score INT DEFAULT 0,
                team2Score INT DEFAULT 0,
                winnerId VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournamentId) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (team1Id) REFERENCES teams(id) ON DELETE SET NULL,
                FOREIGN KEY (team2Id) REFERENCES teams(id) ON DELETE SET NULL,
                FOREIGN KEY (winnerId) REFERENCES teams(id) ON DELETE SET NULL
            )
        `);
        console.log('Таблица matches создана или уже существует.');
        
        console.log('База данных инициализирована успешно.');
    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
        throw error;
    }
}

const tournamentQueries = {
    getAll: async () => {
        try {
            const [tournaments] = await pool.execute('SELECT * FROM tournaments ORDER BY createdAt DESC');
            return tournaments;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [tournaments] = await pool.execute('SELECT * FROM tournaments WHERE id = ?', [id]);
            return tournaments[0];
        } catch (error) {
            throw error;
        }
    },

    create: async (tournament) => {
        try {
            const { id, name, description, startDate, endDate, maxTeams, status } = tournament;
            const [result] = await pool.execute(
                'INSERT INTO tournaments (id, name, description, startDate, endDate, maxTeams, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, name, description, startDate, endDate, maxTeams, status]
            );
            return { insertId: result.insertId, affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, updates) => {
        try {
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            
            const [result] = await pool.execute(
                `UPDATE tournaments SET ${setClause} WHERE id = ?`,
                [...values, id]
            );
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute('DELETE FROM tournaments WHERE id = ?', [id]);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    }
};

const teamQueries = {
    getByTournament: async (tournamentId) => {
        try {
            const [teams] = await pool.execute('SELECT * FROM teams WHERE tournamentId = ? ORDER BY createdAt', [tournamentId]);
            return teams;
        } catch (error) {
            throw error;
        }
    },
    
    getByTournamentId: async (tournamentId) => {
        try {
            const [teams] = await pool.execute('SELECT * FROM teams WHERE tournamentId = ? ORDER BY createdAt', [tournamentId]);
            return teams;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [teams] = await pool.execute('SELECT * FROM teams WHERE id = ?', [id]);
            return teams[0];
        } catch (error) {
            throw error;
        }
    },

    create: async (team) => {
        try {
            const { id, tournamentId, name, players } = team;
            const [result] = await pool.execute(
                'INSERT INTO teams (id, tournamentId, name, players) VALUES (?, ?, ?, ?)',
                [id, tournamentId, name, players]
            );
            return { insertId: result.insertId, affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, updates) => {
        try {
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            
            const [result] = await pool.execute(
                `UPDATE teams SET ${setClause} WHERE id = ?`,
                [...values, id]
            );
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute('DELETE FROM teams WHERE id = ?', [id]);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    deleteByTournamentId: async (tournamentId) => {
        try {
            const [result] = await pool.execute('DELETE FROM teams WHERE tournamentId = ?', [tournamentId]);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    }
};

const matchQueries = {
    getByTournament: async (tournamentId) => {
        try {
            const [rows] = await pool.execute(`
                SELECT m.*, 
                       t1.name as team1Name, 
                       t2.name as team2Name,
                       tw.name as winnerName
                FROM matches m
                LEFT JOIN teams t1 ON m.team1Id = t1.id
                LEFT JOIN teams t2 ON m.team2Id = t2.id
                LEFT JOIN teams tw ON m.winnerId = tw.id
                WHERE m.tournamentId = ?
                ORDER BY m.round, m.position
            `, [tournamentId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    
    getByTournamentId: async (tournamentId) => {
        try {
            const [rows] = await pool.execute(`
                SELECT m.*, 
                       t1.name as team1Name, 
                       t2.name as team2Name,
                       tw.name as winnerName
                FROM matches m
                LEFT JOIN teams t1 ON m.team1Id = t1.id
                LEFT JOIN teams t2 ON m.team2Id = t2.id
                LEFT JOIN teams tw ON m.winnerId = tw.id
                WHERE m.tournamentId = ?
                ORDER BY m.round, m.position
            `, [tournamentId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    create: async (match) => {
        try {
            const { id, tournamentId, round, position, team1Id, team2Id, team1Score, team2Score, winnerId, status } = match;
            const [result] = await pool.execute(
                'INSERT INTO matches (id, tournamentId, round, position, team1Id, team2Id, team1Score, team2Score, winnerId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, tournamentId, round, position, team1Id, team2Id, team1Score, team2Score, winnerId, status]
            );
            return { insertId: result.insertId, affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, updates) => {
        try {
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            
            const [result] = await pool.execute(
                `UPDATE matches SET ${setClause} WHERE id = ?`,
                [...values, id]
            );
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute('DELETE FROM matches WHERE id = ?', [id]);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    },

    deleteByTournament: async (tournamentId) => {
        try {
            const [result] = await pool.execute('DELETE FROM matches WHERE tournamentId = ?', [tournamentId]);
            return { affectedRows: result.affectedRows };
        } catch (error) {
            throw error;
        }
    }
};

// Закрытие соединения с базой данных
async function closeDatabase() {
    try {
        await pool.end();
        console.log('Соединение с базой данных закрыто.');
    } catch (error) {
        console.error('Ошибка закрытия базы данных:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    initDatabase,
    closeDatabase,
    tournamentQueries,
    teamQueries,
    matchQueries
};