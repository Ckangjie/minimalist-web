-- Cloudflare D1 初始数据表结构与种子数据
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 插入或更新默认用户
INSERT OR REPLACE INTO users (id, username, email) 
VALUES (1, 'cloudflare', 'kj@du1.ccwu.cc');
