import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * 用户表定义（兼容 Cloudflare D1 与 SQLite）
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull()
});

/**
 * 留言表定义
 */
export const guestbookComment = sqliteTable("guestbook_comment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rootId: integer("root_id"),
  replyToId: integer("reply_to_id"),
  level: integer("level").notNull(),
  nickname: text("nickname").notNull(),
  content: text("content").notNull(),
  authorType: text("author_type").notNull(), // visitor | admin
  adminId: integer("admin_id"),
  email: text("email"),
  avatar: text("avatar"),
  status: text("status").notNull(), // pending | approved | rejected | hidden
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
  reviewedAt: text("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
  deletedAt: text("deleted_at"),
  sourceHash: text("source_hash")
});

/**
 * 审核操作日志表定义
 */
export const guestbookAuditLog = sqliteTable("guestbook_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  commentId: integer("comment_id").notNull(),
  operatorId: integer("operator_id").notNull(),
  action: text("action").notNull(), // approve | reject | hide | restore | delete
  beforeStatus: text("before_status"),
  afterStatus: text("after_status"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  remark: text("remark")
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type GuestbookComment = typeof guestbookComment.$inferSelect;
export type NewGuestbookComment = typeof guestbookComment.$inferInsert;
export type GuestbookAuditLog = typeof guestbookAuditLog.$inferSelect;
export type NewGuestbookAuditLog = typeof guestbookAuditLog.$inferInsert;

/**
 * 游客用户表定义（每个浏览器对应的唯一 UUID 与专属固定昵称、通知邮箱）
 */
export const guestbookVisitor = sqliteTable("guestbook_visitor", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  nickname: text("nickname").notNull(),
  avatar: text("avatar"),
  email: text("email"),
  clientIp: text("client_ip"),
  userAgent: text("user_agent"),
  status: text("status").default("active").notNull(), // active | disabled
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull()
});

export type GuestbookVisitor = typeof guestbookVisitor.$inferSelect;
export type NewGuestbookVisitor = typeof guestbookVisitor.$inferInsert;

/**
 * 友情链接表定义
 */
export const friendLink = sqliteTable("friend_link", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  logo: text("logo"),
  description: text("description"),
  email: text("email"),
  status: text("status").default("pending").notNull(), // pending | approved | rejected | hidden
  sortOrder: integer("sort_order").default(0).notNull(),
  rejectReason: text("reject_reason"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  reviewedAt: text("reviewed_at")
});

export type FriendLink = typeof friendLink.$inferSelect;
export type NewFriendLink = typeof friendLink.$inferInsert;

/**
 * 导航分类表
 */
export const navCategory = sqliteTable("nav_category", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: integer("is_visible", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull()
});

/**
 * 导航条目表
 */
export const navItem = sqliteTable("nav_item", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  desc: text("desc"),
  tag: text("tag"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: integer("is_visible", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull()
});

export type NavCategory = typeof navCategory.$inferSelect;
export type NewNavCategory = typeof navCategory.$inferInsert;
export type NavItem = typeof navItem.$inferSelect;
export type NewNavItem = typeof navItem.$inferInsert;
