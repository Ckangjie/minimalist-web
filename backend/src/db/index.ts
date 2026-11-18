import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

/**
 * Cloudflare 边缘运行绑定环境类型
 */
export type Bindings = {
  DB?: D1Database;
  minimalist_db?: D1Database;
  KV?: KVNamespace;
  minimalist_kv?: KVNamespace;
};

let localDbInstance: any = null;

/**
 * 获取 Drizzle ORM 实例
 * 优先绑定 Cloudflare D1 驱动；在 Bun 本地直接运行时自动降级使用 local SQLite
 */
export const getDb = (d1?: D1Database): any => {
  if (d1 && typeof (d1 as any).prepare === "function") {
    return drizzleD1(d1, { schema, casing: "snake_case" });
  }

  // Bun 本地开发运行支持
  if (typeof (globalThis as any).Bun !== "undefined") {
    if (!localDbInstance) {
      const bunRequire = (import.meta as any).require;
      if (!bunRequire) {
        throw new Error("Bun 运行时未找到 import.meta.require");
      }
      const { Database } = bunRequire("bun:sqlite");
      const { drizzle } = bunRequire("drizzle-orm/bun-sqlite");
      const dataDir = path.resolve(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const sqlite = new Database(path.resolve(dataDir, "local.db"));
      sqlite.run("PRAGMA journal_mode = WAL;");

      // 自动确保表结构初始化
      const initSqlPath = path.resolve(process.cwd(), "src/db/init.sql");
      if (fs.existsSync(initSqlPath)) {
        const sqlContent = fs.readFileSync(initSqlPath, "utf-8");
        const statements = sqlContent
          .split(";")
          .map((s: string) => s.trim())
          .filter(Boolean);
        for (const stmt of statements) {
          sqlite.run(stmt);
        }
      }
      localDbInstance = drizzle(sqlite, { schema, casing: "snake_case" });
    }
    return localDbInstance;
  }

  throw new Error("无法获取数据库连接：未检测到 Cloudflare D1 绑定或本地 SQLite 运行环境");
};

export { schema };
