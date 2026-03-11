-- JMB Task Manager sql

CREATE DATABASE IF NOT EXISTS jmb_taskmanager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jmb_taskmanager;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  priority    ENUM('low','medium','high','urgent') DEFAULT 'medium',
  tag         VARCHAR(100),
  is_done     BOOLEAN DEFAULT FALSE,
  category    ENUM('semaine','urgent','aujourd_hui') DEFAULT 'semaine',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

