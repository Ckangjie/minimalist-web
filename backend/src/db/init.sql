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

-- 留言表
CREATE TABLE IF NOT EXISTS guestbook_comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  root_id INTEGER,
  reply_to_id INTEGER,
  level INTEGER NOT NULL,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  author_type TEXT NOT NULL,
  admin_id INTEGER,
  email TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewed_by INTEGER,
  deleted_at TEXT,
  source_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_root_status_time ON guestbook_comment (root_id, status, deleted_at, created_at, id);
CREATE INDEX IF NOT EXISTS idx_status_time ON guestbook_comment (status, deleted_at, created_at, id);
CREATE INDEX IF NOT EXISTS idx_source_time ON guestbook_comment (source_hash, created_at);

-- 审核操作日志表
CREATE TABLE IF NOT EXISTS guestbook_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  operator_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  before_status TEXT,
  after_status TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  remark TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_comment_time ON guestbook_audit_log (comment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_operator_time ON guestbook_audit_log (operator_id, created_at);

-- 游客用户表
CREATE TABLE IF NOT EXISTS guestbook_visitor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  email TEXT,
  client_ip TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_guestbook_visitor_uuid ON guestbook_visitor(uuid);
