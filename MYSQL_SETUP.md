# MySQL数据库配置指南

## 数据库选择说明

本项目支持两种数据库配置：

- **H2数据库**：内存数据库，适用于开发和测试
- **MySQL数据库**：持久化存储，适用于生产环境和历史交易记录存储

## 为什么需要MySQL？

**Feature 3**: Store Historical Exchange（存储历史交易记录）需要持久化存储：

1. **数据持久性**：历史交易记录需要永久保存
2. **数据安全**：生产环境需要可靠的数据存储
3. **性能优化**：MySQL提供更好的索引和查询性能
4. **并发支持**：支持多用户同时访问
5. **数据备份**：支持定期备份和恢复

## 环境配置

### 1. 开发环境（默认H2）

```bash
# 启动应用（使用H2内存数据库）
mvn spring-boot:run
```

### 2. 本地MySQL测试

```bash
# 启动应用（使用本地MySQL）
mvn spring-boot:run -Dspring.profiles.active=mysql
```

### 3. 生产环境

```bash
# 启动应用（使用生产环境配置）
mvn spring-boot:run -Dspring.profiles.active=production
```

## MySQL安装和配置

### 1. 安装MySQL

**Windows:**
```bash
# 下载MySQL Community Server
# https://dev.mysql.com/downloads/mysql/

# 或使用Chocolatey
choco install mysql

# 或使用XAMPP
choco install xampp
```

**macOS:**
```bash
# 使用Homebrew
brew install mysql

# 启动MySQL服务
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. 初始化数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source backend/src/main/resources/db/mysql_init.sql

# 或者
mysql -u root -p < backend/src/main/resources/db/mysql_init.sql
```

### 3. 验证数据库

```sql
-- 查看数据库
SHOW DATABASES;

-- 使用数据库
USE currency_exchange;

-- 查看表
SHOW TABLES;

-- 查看表结构
DESCRIBE currencies;
DESCRIBE exchange_transactions;
```

## 应用配置

### 配置文件说明

项目中有3套数据库配置：

#### 1. 默认配置（H2）
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:currencyexchange
    driverClassName: org.h2.Driver
    username: sa
    password:
```

#### 2. MySQL本地测试配置
```yaml
spring:
  profiles: mysql
  datasource:
    url: jdbc:mysql://localhost:3306/currency_exchange
    driverClassName: com.mysql.cj.jdbc.Driver
    username: root
    password: 123456
```

#### 3. 生产环境配置
```yaml
spring:
  profiles: production
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### 环境变量配置

生产环境通过环境变量配置：

```bash
export DB_HOST=your-mysql-host
export DB_PORT=3306
export DB_NAME=currency_exchange
export DB_USERNAME=currency_user
export DB_PASSWORD=your_secure_password
```

## 数据库表结构

### 核心表

1. **currencies** - 货币信息
2. **exchange_rates** - 汇率数据
3. **users** - 用户信息
4. **exchange_transactions** - 交易记录（历史存储）
5. **watchlists** - 用户关注列表

### 索引优化

重要索引包括：
- 货币代码索引
- 交易记录时间索引
- 用户ID索引
- 货币对索引

## 性能优化

### 连接池配置

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20      # 最大连接数
      minimum-idle: 5           # 最小空闲连接
      connection-timeout: 20000  # 连接超时
      idle-timeout: 300000      # 空闲超时
      max-lifetime: 1200000     # 连接最大生命周期
```

### 分页查询

```java
// 分页查询历史交易记录
Pageable pageable = PageRequest.of(0, 20);
Page<ExchangeTransaction> transactions = 
    exchangeTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
```

## 数据备份

### 自动备份脚本

```bash
#!/bin/bash
# backup_db.sh

DB_NAME="currency_exchange"
BACKUP_DIR="/path/to/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/currency_exchange_$DATE.sql"

# 创建备份
mysqldump -u backup_user -p$BACKUP_PASSWORD $DB_NAME > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "currency_exchange_*.sql.gz" -mtime +7 -delete
```

### 定期备份

```bash
# 添加到crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/backup_db.sh
```

## 监控和维护

### 性能监控

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看连接状态
SHOW PROCESSLIST;

-- 查看表状态
SHOW TABLE STATUS FROM currency_exchange;
```

### 数据清理

```sql
-- 清理老旧的汇率数据（保留30天）
DELETE FROM exchange_rates 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 清理失败的交易记录（保留90天）
DELETE FROM exchange_transactions 
WHERE status = 'FAILED' 
AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

## 常见问题

### 1. 连接失败

```
Error: Access denied for user 'root'@'localhost'
```

**解决方案：**
```bash
# 重置MySQL密码
sudo mysql_secure_installation

# 或创建新用户
mysql -u root -p
CREATE USER 'currency_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON currency_exchange.* TO 'currency_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 时区问题

```
Error: The server time zone value 'CST' is unrecognized
```

**解决方案：**
```sql
-- 设置时区
SET GLOBAL time_zone = '+8:00';

-- 或在连接URL中指定
jdbc:mysql://localhost:3306/currency_exchange?serverTimezone=Asia/Shanghai
```

### 3. 字符编码问题

**解决方案：**
```sql
-- 检查字符集
SHOW VARIABLES LIKE 'character_set_%';

-- 修改为UTF8MB4
ALTER DATABASE currency_exchange CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 部署清单

### 开发环境
- [x] H2数据库配置
- [x] 基本CRUD功能
- [x] API接口测试

### 测试环境
- [ ] MySQL数据库安装
- [ ] 数据库初始化
- [ ] 数据迁移测试
- [ ] 性能测试

### 生产环境
- [ ] MySQL集群配置
- [ ] 数据备份策略
- [ ] 监控告警设置
- [ ] 安全审计配置 