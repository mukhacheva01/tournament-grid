const mysql = require('mysql2/promise');
const path = require('path');

// Конфигурация подключения к MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tournament_db',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4'
};

// Создание пула подключений
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log(`Подключение к MySQL базе данных: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        
        await connection.execute(`CREATE TABLE IF NOT EXISTS tournaments (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            date VARCHAR(20),
            location VARCHAR(255),
            description TEXT,
            type VARCHAR(50),
            participantsCount INT,
            seededCount INT DEFAULT 0,
            status VARCHAR(20) DEFAULT 'created',
            state TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('Таблица tournaments создана или уже существует.');

        await connection.execute(`CREATE TABLE IF NOT EXISTS teams (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            tournamentId VARCHAR(36) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tournamentId) REFERENCES tournaments (id) ON DELETE CASCADE
        )`);
        console.log('Таблица teams создана или уже существует.');

        await connection.execute(`CREATE TABLE IF NOT EXISTS matches (
            id VARCHAR(36) PRIMARY KEY,
            tournamentId VARCHAR(36) NOT NULL,
            round INT NOT NULL,
            position INT NOT NULL,
            team1Id VARCHAR(36),
            team2Id VARCHAR(36),
            team1Score INT DEFAULT 0,
            team2Score INT DEFAULT 0,
            winnerId VARCHAR(36),
            status VARCHAR(20) DEFAULT 'pending',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tournamentId) REFERENCES tournaments (id) ON DELETE CASCADE,
            FOREIGN KEY (team1Id) REFERENCES teams (id) ON DELETE SET NULL,
            FOREIGN KEY (team2Id) REFERENCES teams (id) ON DELETE SET NULL,
            FOREIGN KEY (winnerId) REFERENCES teams (id) ON DELETE SET NULL
        )`);
        console.log('Таблица matches создана или уже существует.');
        
        connection.release();
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error.message);
        throw error;
    }
}

const tournamentQueries = {
    getAll: async () => {
        try {
            const [rows] = await pool.execute('SELECT * FROM tournaments ORDER BY createdAt DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM tournaments WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    create: async (tournament) => {
        try {
            const { id, name, date, location, description, type, participantsCount, seededCount } = tournament;
            await pool.execute(
                'INSERT INTO tournaments (id, name, date, location, description, type, participantsCount, seededCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [id, name, date, location, description, type, participantsCount, seededCount]
            );
            return { id, ...tournament };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, updates) => {
        try {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            
            const [result] = await pool.execute(
                `UPDATE tournaments SET ${fields} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute('DELETE FROM tournaments WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

const teamQueries = {
    getByTournament: async (tournamentId) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM teams WHERE tournamentId = ? ORDER BY createdAt', [tournamentId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    
    getByTournamentId: async (tournamentId) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM teams WHERE tournamentId = ? ORDER BY createdAt', [tournamentId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM teams WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    create: async (team) => {
        try {
            const { id, name, tournamentId } = team;
            await pool.execute(
                'INSERT INTO teams (id, name, tournamentId) VALUES (?, ?, ?)',
                [id, name, tournamentId]
            );
            return { id, ...team };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, updates) => {
        try {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            
            const [result] = await pool.execute(
                `UPDATE teams SET ${fields} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute('DELETE FROM teams WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    deleteByTournamentId: async (tournamentId) => {
        try {
            const [result] = await pool.execute('DELETE FROM teams WHERE tournamentId = ?', [tournamentId]);
            return result.affectedRows;
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
                       w.name as winnerName
                FROM matches m
                LEFT JOIN teams t1 ON m.team1Id = t1.id
                LEFT JOIN teams t2 ON m.team2Id = t2.id
                LEFT JOIN teams w ON m.winnerId = w.id
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
                       w.name as winnerName
                FROM matches m
                LEFT JOIN teams t1 ON m.team1Id = t1.id
                LEFT JOIN teams t2 ON m.team2Id = t2.id
                LEFT JOIN teams w ON m.winnerId = w.id
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
            const { id, tournamentId, round, position, team1Id, team2Id } = match;
            await pool.execute(
                'INSERT INTO matches (id, tournamentId, round, position, team1Id, team2Id) VALUES (?, ?, ?, ?, ?, ?)',
                [id, tournamentId, round, position, team1Id, team2Id]
            );
            return { id, ...match };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, updates) => {
        try {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            
            const [result] = await pool.execute(
                `UPDATE matches SET ${fields} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute('DELETE FROM matches WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    deleteByTournament: async (tournamentId) => {
        try {
            const [result] = await pool.execute('DELETE FROM matches WHERE tournamentId = ?', [tournamentId]);
            return result.affectedRows;
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