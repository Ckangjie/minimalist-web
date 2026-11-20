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
  avatar TEXT,
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
  avatar TEXT,
  email TEXT,
  client_ip TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_guestbook_visitor_uuid ON guestbook_visitor(uuid);

-- 友情链接表
CREATE TABLE IF NOT EXISTS friend_link (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sort_order INTEGER NOT NULL DEFAULT 0,
  reject_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_friend_link_status_sort ON friend_link (status, sort_order, created_at);

-- 导航分类表
CREATE TABLE IF NOT EXISTS nav_category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 导航条目表
CREATE TABLE IF NOT EXISTS nav_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  desc TEXT,
  tag TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_nav_item_category ON nav_item (category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_nav_category_sort ON nav_category (sort_order, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_nav_item_cat_slug ON nav_item (category_id, slug);

-- 默认自研导航工具初始分类与条目
INSERT OR IGNORE INTO nav_category (slug, name, description, sort_order, is_visible)
VALUES ('nav-tools', '导航工具', '自研工具资源包与开源项目集合，支持离线包直接下载与 GitHub 仓库直达', 99, 1);

INSERT OR IGNORE INTO nav_item (category_id, slug, title, url, desc, tag, sort_order, is_visible)
VALUES 
  ((SELECT id FROM nav_category WHERE slug = 'nav-tools'), 'tool-uni-offline-pack', 'UniOfflinePack', 'https://github.com/Ckangjie/uni-packer', '零 Android Studio 依赖的 uni-app 本地离线打包工作台，支持环境一键自愈、证书自动嗅探与极速 APK 编译交付', '开源工具', 1, 1),
  ((SELECT id FROM nav_category WHERE slug = 'nav-tools'), 'tool-bookmark-desk', 'BookmarkDesk', 'https://github.com/Ckangjie/bookmark-desk', '书签管家 BookmarkDesk 是一个本地书签工作台。打开扩展即可在独立标签页里查看、搜索和整理导入的浏览器书签', 'ZIP', 2, 1);
