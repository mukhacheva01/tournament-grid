const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { ensureDataDirectory } = require('./ensure-data-dir');

// Убедимся, что директория данных существует
const dataDir = ensureDataDirectory();

// Определяем путь к базе данных
const dbPath = path.join(dataDir, 'tournament.db');

// Создание подключения к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log(`Подключение к SQLite базе данных установлено: ${dbPath}`);
    }
});

function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS tournaments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                location TEXT,
                description TEXT,
                type TEXT,
                participantsCount INTEGER,
                seededCount INTEGER DEFAULT 0,
                status TEXT DEFAULT 'created',
                state TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Ошибка создания таблицы tournaments:', err.message);
                    reject(err);
                } else {
                    console.log('Таблица tournaments создана или уже существует.');
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS teams (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                tournamentId TEXT NOT NULL,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournamentId) REFERENCES tournaments (id) ON DELETE CASCADE
            )`, (err) => {
                if (err) {
                    console.error('Ошибка создания таблицы teams:', err.message);
                    reject(err);
                } else {
                    console.log('Таблица teams создана или уже существует.');
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS matches (
                id TEXT PRIMARY KEY,
                tournamentId TEXT NOT NULL,
                round INTEGER NOT NULL,
                position INTEGER NOT NULL,
                team1Id TEXT,
                team2Id TEXT,
                team1Score INTEGER DEFAULT 0,
                team2Score INTEGER DEFAULT 0,
                winnerId TEXT,
                status TEXT DEFAULT 'pending',
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournamentId) REFERENCES tournaments (id) ON DELETE CASCADE,
                FOREIGN KEY (team1Id) REFERENCES teams (id) ON DELETE SET NULL,
                FOREIGN KEY (team2Id) REFERENCES teams (id) ON DELETE SET NULL,
                FOREIGN KEY (winnerId) REFERENCES teams (id) ON DELETE SET NULL
            )`, (err) => {
                if (err) {
                    console.error('Ошибка создания таблицы matches:', err.message);
                    reject(err);
                } else {
                    console.log('Таблица matches создана или уже существует.');
                    resolve();
                }
            });
        });
    });
}

const tournamentQueries = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM tournaments ORDER BY createdAt DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM tournaments WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    create: (tournament) => {
        return new Promise((resolve, reject) => {
            const { id, name, date, location, description, type, participantsCount, seededCount } = tournament;
            db.run(
                'INSERT INTO tournaments (id, name, date, location, description, type, participantsCount, seededCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [id, name, date, location, description, type, participantsCount, seededCount],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, ...tournament });
                }
            );
        });
    },

    update: (id, updates) => {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            
            db.run(
                `UPDATE tournaments SET ${fields} WHERE id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM tournaments WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }
};

const teamQueries = {
    getByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM teams WHERE tournamentId = ? ORDER BY createdAt', [tournamentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    
    getByTournamentId: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM teams WHERE tournamentId = ? ORDER BY createdAt', [tournamentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM teams WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    create: (team) => {
        return new Promise((resolve, reject) => {
            const { id, name, tournamentId } = team;
            db.run(
                'INSERT INTO teams (id, name, tournamentId) VALUES (?, ?, ?)',
                [id, name, tournamentId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, ...team });
                }
            );
        });
    },

    update: (id, updates) => {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            
            db.run(
                `UPDATE teams SET ${fields} WHERE id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM teams WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    },

    deleteByTournamentId: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM teams WHERE tournamentId = ?', [tournamentId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
};

const matchQueries = {
    getByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.all(`
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
            `, [tournamentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    
    getByTournamentId: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.all(`
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
            `, [tournamentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    create: (match) => {
        return new Promise((resolve, reject) => {
            const { id, tournamentId, round, position, team1Id, team2Id } = match;
            db.run(
                'INSERT INTO matches (id, tournamentId, round, position, team1Id, team2Id) VALUES (?, ?, ?, ?, ?, ?)',
                [id, tournamentId, round, position, team1Id, team2Id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, ...match });
                }
            );
        });
    },

    update: (id, updates) => {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(id);
            
            db.run(
                `UPDATE matches SET ${fields} WHERE id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM matches WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    },

    deleteByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM matches WHERE tournamentId = ?', [tournamentId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
};

// Закрытие соединения с базой данных
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('Ошибка закрытия базы данных:', err.message);
                reject(err);
            } else {
                console.log('Соединение с базой данных закрыто.');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    initDatabase,
    closeDatabase,
    tournamentQueries,
    teamQueries,
    matchQueries
};