CREATE DATABASE `confessionsbot` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
CREATE TABLE `blocks` (
  `userId` varchar(20) NOT NULL,
  `guildId` varchar(20) NOT NULL,
  `modId` varchar(20) DEFAULT NULL,
  `reason` varchar(512) DEFAULT NULL,
  `type` enum('block','unblock') DEFAULT NULL,
  `count` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`guildId`,`userId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `botcommands` (
  `commandName` varchar(32) NOT NULL,
  `commandId` varchar(20) DEFAULT NULL,
  `type` tinyint DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`commandName`),
  KEY `idx_cmdname` (`commandName`),
  KEY `idx_cmdid` (`commandId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `confessions` (
  `messageId` varchar(256) NOT NULL,
  `guildId` varchar(20) DEFAULT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `channelId` varchar(20) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`messageId`),
  KEY `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `configs` (
  `guildId` varchar(20) NOT NULL,
  `confessChannelId` varchar(20) DEFAULT NULL,
  `loggingChannelId` varchar(20) DEFAULT NULL,
  `helpChannelId` varchar(20) DEFAULT NULL,
  `staffRoleId` varchar(20) DEFAULT NULL,
  `confessRoleId` varchar(20) DEFAULT NULL,
  `requireConfessRole` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`guildId`),
  KEY `idx_cnfsId` (`confessChannelId`),
  KEY `idx_cnfsrolerqrd` (`requireConfessRole`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
