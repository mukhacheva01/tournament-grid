-- MySQL dump for Tournament Grid
-- Generated on 2024-12-19
-- This dump contains the database structure and sample data

-- Create database
CREATE DATABASE IF NOT EXISTS tournament_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tournament_db;

-- Table structure for tournaments
DROP TABLE IF EXISTS `tournaments`;
CREATE TABLE `tournaments` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `type` varchar(50) DEFAULT NULL,
  `participantsCount` int DEFAULT NULL,
  `seededCount` int DEFAULT '0',
  `status` varchar(20) DEFAULT 'created',
  `state` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for teams
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tournamentId` varchar(36) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tournamentId` (`tournamentId`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for matches
DROP TABLE IF EXISTS `matches`;
CREATE TABLE `matches` (
  `id` varchar(36) NOT NULL,
  `tournamentId` varchar(36) NOT NULL,
  `round` int NOT NULL,
  `position` int NOT NULL,
  `team1Id` varchar(36) DEFAULT NULL,
  `team2Id` varchar(36) DEFAULT NULL,
  `team1Score` int DEFAULT '0',
  `team2Score` int DEFAULT '0',
  `winnerId` varchar(36) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tournamentId` (`tournamentId`),
  KEY `team1Id` (`team1Id`),
  KEY `team2Id` (`team2Id`),
  KEY `winnerId` (`winnerId`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`tournamentId`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`team1Id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`team2Id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`winnerId`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for tournaments
INSERT INTO `tournaments` (`id`, `name`, `date`, `location`, `description`, `type`, `participantsCount`, `seededCount`, `status`, `state`, `createdAt`) VALUES
('1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 'Летний турнир 2024', '2024-07-15', 'Спортивный комплекс "Олимп"', 'Летний турнир для 8 команд с 3 раундами', 'single-elimination', 8, 0, 'created', NULL, '2024-12-19 14:32:31'),
('2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7', 'Кубок чемпионов', '2024-08-20', 'Центральный стадион', 'Престижный турнир на 16 команд', 'single-elimination', 16, 0, 'created', NULL, '2024-12-19 14:32:31'),
('3c4d5e6f-7g8h-9i0j-1k2l-m3n4o5p6q7r8', 'Осенний кубок', '2024-09-10', 'Городской парк', 'Небольшой турнир на 4 команды', 'single-elimination', 4, 0, 'created', NULL, '2024-12-19 14:32:31');

-- Sample data for teams
INSERT INTO `teams` (`id`, `name`, `tournamentId`, `createdAt`) VALUES
('team1-uuid-1234-5678-abcdefghijkl', 'Команда А', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team2-uuid-1234-5678-abcdefghijkl', 'Команда Б', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team3-uuid-1234-5678-abcdefghijkl', 'Команда В', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team4-uuid-1234-5678-abcdefghijkl', 'Команда Г', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team5-uuid-1234-5678-abcdefghijkl', 'Команда Д', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team6-uuid-1234-5678-abcdefghijkl', 'Команда Е', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team7-uuid-1234-5678-abcdefghijkl', 'Команда Ж', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31'),
('team8-uuid-1234-5678-abcdefghijkl', 'Команда З', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', '2024-12-19 14:32:31');

-- Sample data for matches
INSERT INTO `matches` (`id`, `tournamentId`, `round`, `position`, `team1Id`, `team2Id`, `team1Score`, `team2Score`, `winnerId`, `status`, `createdAt`) VALUES
('match1-uuid-1234-5678-abcdefghijk', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 1, 1, 'team1-uuid-1234-5678-abcdefghijkl', 'team2-uuid-1234-5678-abcdefghijkl', 0, 0, NULL, 'pending', '2024-12-19 14:32:31'),
('match2-uuid-1234-5678-abcdefghijk', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 1, 2, 'team3-uuid-1234-5678-abcdefghijkl', 'team4-uuid-1234-5678-abcdefghijkl', 0, 0, NULL, 'pending', '2024-12-19 14:32:31'),
('match3-uuid-1234-5678-abcdefghijk', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 1, 3, 'team5-uuid-1234-5678-abcdefghijkl', 'team6-uuid-1234-5678-abcdefghijkl', 0, 0, NULL, 'pending', '2024-12-19 14:32:31'),
('match4-uuid-1234-5678-abcdefghijk', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 1, 4, 'team7-uuid-1234-5678-abcdefghijkl', 'team8-uuid-1234-5678-abcdefghijkl', 0, 0, NULL, 'pending', '2024-12-19 14:32:31');

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;