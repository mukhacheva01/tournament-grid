-- Создание базы данных для турнирной системы
CREATE DATABASE IF NOT EXISTS tournament_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Использование созданной базы данных
USE tournament_db;

-- Создание таблицы турниров
CREATE TABLE IF NOT EXISTS tournaments (
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
);

-- Создание таблицы команд
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tournamentId VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournamentId) REFERENCES tournaments (id) ON DELETE CASCADE
);

-- Создание таблицы матчей
CREATE TABLE IF NOT EXISTS matches (
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
);

-- Вставка тестовых данных из SQLite дампа
-- Турниры
INSERT IGNORE INTO tournaments VALUES('1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6','Летний турнир 2024','2024-07-15','Спортивный комплекс "Олимп"','Летний турнир для 8 команд с 3 раундами','single-elimination',8,0,'created',NULL,'2024-12-19 14:32:31');
INSERT IGNORE INTO tournaments VALUES('2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7','Кубок чемпионов','2024-08-20','Центральный стадион','Престижный турнир на 16 команд','single-elimination',16,0,'created',NULL,'2024-12-19 14:32:31');
INSERT IGNORE INTO tournaments VALUES('3c4d5e6f-7g8h-9i0j-1k2l-m3n4o5p6q7r8','Осенний кубок','2024-09-10','Городской парк','Небольшой турнир на 4 команды','single-elimination',4,0,'created',NULL,'2024-12-19 14:32:31');

-- Команды
INSERT IGNORE INTO teams VALUES('team1-uuid-1234-5678-abcdefghijkl','Команда А','1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6','2024-12-19 14:32:31');
INSERT IGNORE INTO teams VALUES('team2-uuid-1234-5678-abcdefghijkl','Команда Б','1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6','2024-12-19 14:32:31');
INSERT IGNORE INTO teams VALUES('team3-uuid-1234-5678-abcdefghijkl','Команда В','1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6','2024-12-19 14:32:31');
INSERT IGNORE INTO teams VALUES('team4-uuid-1234-5678-abcdefghijkl','Команда Г','1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6','2024-12-19 14:32:31');

-- Матчи
INSERT IGNORE INTO matches VALUES('match1-uuid-1234-5678-abcdefghijk','1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',1,1,'team1-uuid-1234-5678-abcdefghijkl','team2-uuid-1234-5678-abcdefghijkl',0,0,NULL,'pending','2024-12-19 14:32:31');
INSERT IGNORE INTO matches VALUES('match2-uuid-1234-5678-abcdefghijk','1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',1,2,'team3-uuid-1234-5678-abcdefghijkl','team4-uuid-1234-5678-abcdefghijkl',0,0,NULL,'pending','2024-12-19 14:32:31');