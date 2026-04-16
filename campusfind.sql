-- ============================================================
--  CampusFind — Lost & Found Registry
--  Database: campusfind
--  Import this file via phpMyAdmin or mysql CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS campusfind
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusfind;

-- ── ITEMS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('lost','found') NOT NULL,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  location    VARCHAR(255) NOT NULL,
  description TEXT,
  status      ENUM('pending','approved','rejected','claimed') NOT NULL DEFAULT 'pending',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── CLAIM REQUESTS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  item_id     INT NOT NULL,
  claimant_name VARCHAR(255) DEFAULT NULL,
  message     TEXT DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── SAMPLE DATA ──────────────────────────────────────────────
INSERT INTO items (type, name, category, location, description, status, created_at) VALUES
('lost',  'Black Leather Wallet',        'Accessories', 'Engineering Building Lobby',         'Contains ID cards and cash. Has a small scratch on the front cover.',       'approved', NOW() - INTERVAL 5 DAY),
('found', 'iPhone 15 Pro (Blue)',         'Electronics', 'Library 2nd Floor, near window',     'Found with cracked screen protector. Locked device.',                       'approved', NOW() - INTERVAL 4 DAY),
('lost',  'Yellow Umbrella',              'Other',        'Canteen Area',                       'Bright yellow with a floral handle.',                                       'approved', NOW() - INTERVAL 3 DAY),
('found', 'Student ID — Maria Santos',    'Documents',   'Admin Building restroom',            'Found on the sink counter. ID number visible.',                             'approved', NOW() - INTERVAL 3 DAY),
('found', 'Noise Cancelling Headphones',  'Electronics', 'Computer Lab 3',                     'Sony WH-1000XM5, black. Left on a desk chair.',                             'approved', NOW() - INTERVAL 6 DAY),
('lost',  'Blue Jansport Backpack',       'Bags',         'Gymnasium',                          'Has a keychain of a small bear. Contains notebooks.',                       'pending',  NOW() - INTERVAL 1 DAY),
('found', 'Dorm Room Keys (2 keys)',      'Keys',         'Corridor near Room 204',             'On a red keyring with a small star charm.',                                 'pending',  NOW() - INTERVAL 1 DAY),
('lost',  'Calculus Textbook',            'Books',        'Math Department Hallway',            'Fundamentals of Calculus, 3rd ed. Name written inside: "Reyes"',            'pending',  NOW());

INSERT INTO claim_requests (item_id, claimant_name, message, created_at) VALUES
(2, 'Juan dela Cruz',  'That is my phone. Screen lock is my birthday.', NOW() - INTERVAL 3 DAY),
(5, 'Anonymous',       'Those are mine. I left them before lunch.',       NOW() - INTERVAL 5 DAY);
