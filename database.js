const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TournamentDatabase {
    constructor(dbPath = ':memory:') {
        this.db = null;
        this.dbPath = dbPath;
        this.init();
    }

    init() {
        try {
            // Создаем подключение к базе данных
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    return;
                }
                console.log('Connected to SQLite database');
                
                // Инициализируем таблицы и данные
                this.createTables();
                this.insertSampleData();
            });
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    createTables() {
        const sql = `
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS stages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS tournaments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                stage_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id),
                FOREIGN KEY (stage_id) REFERENCES stages (id)
            );

            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                match_number TEXT NOT NULL,
                round_name TEXT NOT NULL,
                team1_id INTEGER NOT NULL,
                team2_id INTEGER NOT NULL,
                team1_score INTEGER DEFAULT 0,
                team2_score INTEGER DEFAULT 0,
                winner_id INTEGER,
                match_order INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
                FOREIGN KEY (team1_id) REFERENCES teams (id),
                FOREIGN KEY (team2_id) REFERENCES teams (id),
                FOREIGN KEY (winner_id) REFERENCES teams (id)
            );
        `;

        this.db.exec(sql, (err) => {
            if (err) {
                console.error('Error creating tables:', err);
            } else {
                console.log('Tables created successfully');
            }
        });
    }

    insertSampleData() {
        // Проверяем, есть ли уже данные
        this.db.get("SELECT COUNT(*) as count FROM matches", (err, row) => {
            if (err) {
                console.error('Error checking data:', err);
                return;
            }

            if (row.count > 0) {
                console.log('Database already has data');
                return;
            }

            // Вставляем тестовые данные
            const sql = `
                INSERT INTO categories (name) VALUES ('Мужчины');
                INSERT INTO stages (name) VALUES ('Финал');
                
                INSERT INTO teams (name) VALUES 
                ('Иванов/Петров'),
                ('Сидоров/Петров'),
                ('Смирнов/Попов'),
                ('Васильев/Морозов'),
                ('Волков/Алексеев'),
                ('Новиков/Фёдоров'),
                ('Егоров/Павлов'),
                ('Соколов/Орлов');

                INSERT INTO tournaments (category_id, stage_id, name) 
                VALUES (1, 1, 'Турнир 1');

                INSERT INTO matches (tournament_id, match_number, round_name, team1_id, team2_id, team1_score, team2_score, winner_id, match_order) VALUES
                (1, 'Матч 1', '1/8 финала', 1, 2, 2, 0, 1, 1),
                (1, 'Матч 2', '1/8 финала', 3, 4, 2, 1, 3, 2),
                (1, 'Матч 3', '1/8 финала', 5, 6, 2, 1, 5, 3),
                (1, 'Матч 5', '1/4 финала', 1, 3, 2, 1, 1, 4),
                (1, 'Матч 6', '1/4 финала', 5, 7, 2, 1, 5, 5),
                (1, 'Матч 7', '1/2 финала', 1, 5, 2, 1, 1, 6),
                (1, 'Матч 8', 'Финал', 1, 8, 1, 2, 8, 7);
            `;

            this.db.exec(sql, (err) => {
                if (err) {
                    console.error('Error inserting sample data:', err);
                } else {
                    console.log('Sample data inserted successfully');
                }
            });
        });
    }

    getMatches(callback) {
        const sql = `
            SELECT 
                m.id,
                m.match_number,
                m.round_name,
                t1.name as team1,
                t2.name as team2,
                m.team1_score,
                m.team2_score,
                tw.name as winner,
                c.name as category,
                s.name as stage
            FROM matches m
            JOIN teams t1 ON m.team1_id = t1.id
            JOIN teams t2 ON m.team2_id = t2.id
            LEFT JOIN teams tw ON m.winner_id = tw.id
            JOIN tournaments t ON m.tournament_id = t.id
            JOIN categories c ON t.category_id = c.id
            JOIN stages s ON t.stage_id = s.id
            ORDER BY m.match_order
        `;

        this.db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error getting matches:', err);
                callback(err, null);
                return;
            }
            callback(null, rows);
        });
    }

    getTeams(callback) {
        const sql = "SELECT id, name FROM teams ORDER BY name";
        
        this.db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error getting teams:', err);
                callback(err, null);
                return;
            }
            callback(null, rows);
        });
    }

    addMatch(matchData, callback) {
        // Находим максимальный order для правильной сортировки
        this.db.get("SELECT MAX(match_order) as max_order FROM matches", (err, row) => {
            if (err) {
                callback(err, null);
                return;
            }

            const nextOrder = (row.max_order || 0) + 1;
            const winnerId = matchData.team1_score > matchData.team2_score ? 
                matchData.team1_id : matchData.team2_id;

            const sql = `
                INSERT INTO matches (tournament_id, match_number, round_name, team1_id, team2_id, team1_score, team2_score, winner_id, match_order)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(sql, [
                `Матч ${nextOrder}`,
                matchData.round_name,
                matchData.team1_id,
                matchData.team2_id,
                matchData.team1_score || 0,
                matchData.team2_score || 0,
                winnerId,
                nextOrder
            ], function(err) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, { id: this.lastID, message: 'Match added successfully' });
            });
        });
    }

    updateMatch(matchId, matchData, callback) {
        const winnerId = matchData.team1_score > matchData.team2_score ? 
            matchData.team1_id : matchData.team2_id;

        const sql = `
            UPDATE matches 
            SET round_name = ?, team1_id = ?, team2_id = ?, 
                team1_score = ?, team2_score = ?, winner_id = ?
            WHERE id = ?
        `;

        this.db.run(sql, [
            matchData.round_name,
            matchData.team1_id,
            matchData.team2_id,
            matchData.team1_score || 0,
            matchData.team2_score || 0,
            winnerId,
            matchId
        ], function(err) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, { changes: this.changes, message: 'Match updated successfully' });
        });
    }

    deleteMatch(matchId, callback) {
        this.db.run("DELETE FROM matches WHERE id = ?", [matchId], function(err) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, { changes: this.changes, message: 'Match deleted successfully' });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = TournamentDatabase;