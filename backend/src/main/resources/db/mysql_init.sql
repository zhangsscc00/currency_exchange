-- =============================================
-- Currency Exchange MySQL数据库初始化脚本
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS currency_exchange 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE currency_exchange;

-- 创建用户（可选，生产环境推荐）
-- CREATE USER IF NOT EXISTS 'currency_user'@'localhost' IDENTIFIED BY 'your_password_here';
-- GRANT ALL PRIVILEGES ON currency_exchange.* TO 'currency_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================
-- 表结构将由Hibernate自动创建（ddl-auto: update）
-- 以下是手动创建的参考SQL（如需要）
-- =============================================

-- 货币表
CREATE TABLE IF NOT EXISTS currencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_currency_code (code),
    INDEX idx_currency_active (is_active)
);

-- 汇率表
CREATE TABLE IF NOT EXISTS exchange_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rate_from_to (from_currency, to_currency),
    INDEX idx_rate_created (created_at)
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    default_currency VARCHAR(3),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_active (is_active)
);

-- 交易记录表（历史存储）
CREATE TABLE IF NOT EXISTS exchange_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    reference_number VARCHAR(255) UNIQUE,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    from_amount DECIMAL(15,2) NOT NULL,
    to_amount DECIMAL(15,2) NOT NULL,
    exchange_rate DECIMAL(15,6) NOT NULL,
    fee_amount DECIMAL(15,2),
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_transaction_user (user_id),
    INDEX idx_transaction_reference (reference_number),
    INDEX idx_transaction_status (status),
    INDEX idx_transaction_created (created_at),
    INDEX idx_transaction_currency_pair (from_currency, to_currency),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 用户关注列表
CREATE TABLE IF NOT EXISTS watchlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_watchlist_user (user_id),
    INDEX idx_watchlist_currency_pair (from_currency, to_currency),
    UNIQUE KEY unique_user_currency_pair (user_id, from_currency, to_currency),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 插入基础数据
-- =============================================

-- 插入常用货币
INSERT IGNORE INTO currencies (code, name, symbol) VALUES
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('JPY', 'Japanese Yen', '¥'),
('CNY', 'Chinese Yuan', '¥'),
('CAD', 'Canadian Dollar', 'C$'),
('AUD', 'Australian Dollar', 'A$'),
('CHF', 'Swiss Franc', 'CHF'),
('HKD', 'Hong Kong Dollar', 'HK$'),
('SGD', 'Singapore Dollar', 'S$'),
('KRW', 'South Korean Won', '₩'),
('MXN', 'Mexican Peso', '$'),
('NOK', 'Norwegian Krone', 'kr'),
('SEK', 'Swedish Krona', 'kr'),
('DKK', 'Danish Krone', 'kr'),
('INR', 'Indian Rupee', '₹'),
('BRL', 'Brazilian Real', 'R$'),
('RUB', 'Russian Ruble', '₽'),
('PLN', 'Polish Zloty', 'zł'),
('TRY', 'Turkish Lira', '₺');

-- 插入测试用户
INSERT IGNORE INTO users (name, email, default_currency) VALUES
('Test User', 'test@example.com', 'USD'),
('Admin User', 'admin@example.com', 'USD');

-- 创建数据库备份用户（可选）
-- CREATE USER IF NOT EXISTS 'backup_user'@'localhost' IDENTIFIED BY 'backup_password';
-- GRANT SELECT, LOCK TABLES ON currency_exchange.* TO 'backup_user'@'localhost';

-- 显示创建的表
SHOW TABLES;

-- 显示表状态
SELECT 
    table_name as '表名',
    table_rows as '行数',
    ROUND((data_length + index_length) / 1024 / 1024, 2) as '大小(MB)'
FROM information_schema.tables 
WHERE table_schema = 'currency_exchange'
ORDER BY table_name; 