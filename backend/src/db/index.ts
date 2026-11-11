import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Cloudflare 边缘运行绑定环境类型
 */
export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
};

/**
 * 获取 Drizzle ORM 实例（基于 Cloudflare D1 驱动）
 */
export const getDb = (d1: D1Database) => {
  return drizzle(d1, { schema, casing: "snake_case" });
};

export { schema };
