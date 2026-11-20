import { eq, ne, and, or, like, asc, sql, inArray } from "drizzle-orm";
import { schema } from "../db";

const { navCategory, navItem } = schema;

const formatDateTime = (date = new Date()): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 默认自研导航工具预设数据
 */
export const DEFAULT_TOOL_NAV = [
  {
    id: "nav-tools",
    slug: "nav-tools",
    name: "导航工具",
    icon: "🧰",
    description: "自研工具资源包与开源项目集合，支持离线包直接下载与 GitHub 仓库直达",
    items: [
      {
        id: "tool-uni-offline-pack",
        slug: "tool-uni-offline-pack",
        title: "UniOfflinePack",
        url: "https://github.com/Ckangjie/uni-packer",
        repoUrl: "https://github.com/Ckangjie/uni-packer",
        desc: "零 Android Studio 依赖的 uni-app 本地离线打包工作台，支持环境一键自愈、证书自动嗅探与极速 APK 编译交付",
        tag: "开源工具",
        icon: "📦"
      },
      {
        id: "tool-bookmark-desk",
        slug: "tool-bookmark-desk",
        title: "BookmarkDesk",
        url: "https://github.com/Ckangjie/bookmark-desk",
        downloadUrl: "/resources/BookmarkDesk.zip",
        downloadName: "BookmarkDesk.zip",
        repoUrl: "https://github.com/Ckangjie/bookmark-desk",
        desc: "书签管家 BookmarkDesk 是一个本地书签工作台。打开扩展即可在独立标签页里查看、搜索和整理导入的浏览器书签",
        tag: "ZIP",
        isZip: true,
        icon: "📑"
      }
    ]
  }
];

/**
 * 前台：获取所有可见系统分类及其可见条目（排除自研工具分类）
 */
export const getPublicNavCategories = async (db: any) => {
  const categories = await db
    .select({
      id: navCategory.id,
      slug: navCategory.slug,
      name: navCategory.name,
      description: navCategory.description,
      sortOrder: navCategory.sortOrder
    })
    .from(navCategory)
    .where(and(eq(navCategory.isVisible, true), ne(navCategory.slug, "nav-tools")))
    .orderBy(asc(navCategory.sortOrder), asc(navCategory.id));

  if (categories.length === 0) return [];

  const categoryIds = categories.map((c: any) => c.id);

  const items = await db
    .select({
      id: navItem.id,
      categoryId: navItem.categoryId,
      slug: navItem.slug,
      title: navItem.title,
      url: navItem.url,
      desc: navItem.desc,
      tag: navItem.tag,
      sortOrder: navItem.sortOrder
    })
    .from(navItem)
    .where(eq(navItem.isVisible, true))
    .orderBy(asc(navItem.sortOrder), asc(navItem.id));

  const itemMap = new Map<number, any[]>();
  for (const item of items) {
    if (!categoryIds.includes(item.categoryId)) continue;
    if (!itemMap.has(item.categoryId)) itemMap.set(item.categoryId, []);
    itemMap.get(item.categoryId)!.push({
      id: item.slug || String(item.id),
      dbId: item.id,
      slug: item.slug,
      title: item.title,
      url: item.url,
      desc: item.desc,
      tag: item.tag,
      sortOrder: item.sortOrder
    });
  }

  return categories.map((c: any) => ({
    ...c,
    id: c.slug || String(c.id),
    dbId: c.id,
    items: itemMap.get(c.id) ?? []
  }));
};

/**
 * 前台：获取自研工具分类及其可见条目
 */
export const getPublicToolCategories = async (db: any) => {
  const categories = await db
    .select({
      id: navCategory.id,
      slug: navCategory.slug,
      name: navCategory.name,
      description: navCategory.description,
      sortOrder: navCategory.sortOrder
    })
    .from(navCategory)
    .where(and(eq(navCategory.isVisible, true), eq(navCategory.slug, "nav-tools")))
    .orderBy(asc(navCategory.sortOrder), asc(navCategory.id));

  if (categories.length === 0) {
    return DEFAULT_TOOL_NAV;
  }

  const categoryIds = categories.map((c: any) => c.id);

  const items = await db
    .select({
      id: navItem.id,
      categoryId: navItem.categoryId,
      slug: navItem.slug,
      title: navItem.title,
      url: navItem.url,
      desc: navItem.desc,
      tag: navItem.tag,
      sortOrder: navItem.sortOrder
    })
    .from(navItem)
    .where(eq(navItem.isVisible, true))
    .orderBy(asc(navItem.sortOrder), asc(navItem.id));

  const itemMap = new Map<number, any[]>();
  for (const item of items) {
    if (!categoryIds.includes(item.categoryId)) continue;
    if (!itemMap.has(item.categoryId)) itemMap.set(item.categoryId, []);

    const isGithub = item.url?.includes("github.com");
    const isZip = item.tag?.toUpperCase() === "ZIP";

    itemMap.get(item.categoryId)!.push({
      id: item.slug || String(item.id),
      dbId: item.id,
      slug: item.slug,
      title: item.title,
      url: item.url,
      repoUrl: isGithub ? item.url : undefined,
      downloadUrl: isZip ? (item.url.endsWith(".zip") ? item.url : `/resources/${item.title}.zip`) : undefined,
      downloadName: isZip ? `${item.title}.zip` : undefined,
      isZip,
      desc: item.desc,
      tag: item.tag,
      sortOrder: item.sortOrder
    });
  }

  const result = categories.map((c: any) => ({
    ...c,
    id: c.slug || String(c.id),
    dbId: c.id,
    items: itemMap.get(c.id) ?? []
  }));

  if (result.length > 0 && result[0].items.length === 0) {
    return DEFAULT_TOOL_NAV;
  }

  return result;
};

/**
 * 后台：分页查询分类列表（含每个分类的条目数）
 */
export const getManageCategories = async (db: any, query: Record<string, any>) => {
  const pageNum = Math.max(1, Number(query.pageNum ?? 1));
  const pageSize = Math.max(1, Math.min(2000, Number(query.pageSize ?? 10)));
  const offset = (pageNum - 1) * pageSize;
  const keyword = query.keyword ? query.keyword.toString().trim() : "";

  const whereClause = keyword
    ? like(navCategory.name, `%${keyword}%`)
    : undefined;

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(navCategory)
    .where(whereClause);
  const total = Number(totalRes?.[0]?.count ?? 0);

  const list = await db
    .select()
    .from(navCategory)
    .where(whereClause)
    .orderBy(asc(navCategory.sortOrder), asc(navCategory.id))
    .limit(pageSize)
    .offset(offset);

  // 查每个分类的条目数
  const countRes = await db
    .select({
      categoryId: navItem.categoryId,
      count: sql<number>`count(*)`
    })
    .from(navItem)
    .groupBy(navItem.categoryId);

  const countMap = new Map<number, number>();
  for (const row of countRes) {
    countMap.set(row.categoryId, Number(row.count));
  }

  return {
    list: list.map((c: any) => ({ ...c, itemCount: countMap.get(c.id) ?? 0 })),
    total,
    pageNum,
    pageSize
  };
};

/**
 * 后台：新建分类
 */
export const createCategory = async (db: any, body: any) => {
  const slug = (body.slug ?? "").toString().trim();
  const name = (body.name ?? "").toString().trim();
  if (!slug) throw new Error("slug 不能为空");
  if (!name) throw new Error("分类名称不能为空");

  const nowTime = formatDateTime();
  const insertRes = await db
    .insert(navCategory)
    .values({
      slug,
      name,
      description: body.description ?? null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      isVisible: body.isVisible !== false,
      createdAt: nowTime,
      updatedAt: nowTime
    })
    .returning({ id: navCategory.id });

  return { id: insertRes[0]?.id, slug, name };
};

/**
 * 后台：编辑分类
 */
export const updateCategory = async (db: any, id: number, body: any) => {
  const existing = await db
    .select()
    .from(navCategory)
    .where(eq(navCategory.id, id))
    .limit(1);
  if (existing.length === 0) throw new Error("分类不存在");

  const updates: any = { updatedAt: formatDateTime() };
  if (typeof body.slug === "string" && body.slug.trim()) updates.slug = body.slug.trim();
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.description !== "undefined") updates.description = body.description ?? null;
  if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;
  if (typeof body.isVisible === "boolean") updates.isVisible = body.isVisible;

  await db.update(navCategory).set(updates).where(eq(navCategory.id, id));
  return { id, ...updates };
};

/**
 * 后台：删除分类（同时删除下属条目）
 */
export const deleteCategory = async (db: any, id: number) => {
  await db.delete(navItem).where(eq(navItem.categoryId, id));
  await db.delete(navCategory).where(eq(navCategory.id, id));
  return { id };
};

/**
 * 后台：获取某分类下的条目（支持分页与关键词过滤）
 */
export const getItemsByCategory = async (db: any, categoryId: number, query: Record<string, any> = {}) => {
  const pageNum = Math.max(1, Number(query.pageNum ?? 1));
  const pageSize = Math.max(1, Math.min(2000, Number(query.pageSize ?? 10)));
  const offset = (pageNum - 1) * pageSize;
  const keyword = query.keyword ? query.keyword.toString().trim() : "";

  const conditions = [eq(navItem.categoryId, categoryId)];
  if (keyword) {
    conditions.push(
      or(
        like(navItem.title, `%${keyword}%`),
        like(navItem.url, `%${keyword}%`),
        like(navItem.slug, `%${keyword}%`)
      )!
    );
  }
  const whereClause = and(...conditions);

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(navItem)
    .where(whereClause);
  const total = Number(totalRes?.[0]?.count ?? 0);

  const list = await db
    .select()
    .from(navItem)
    .where(whereClause)
    .orderBy(asc(navItem.sortOrder), asc(navItem.id))
    .limit(pageSize)
    .offset(offset);

  return {
    list,
    total,
    pageNum,
    pageSize
  };
};

/**
 * 后台：新建条目
 */
export const createItem = async (db: any, body: any) => {
  const categoryId = Number(body.categoryId);
  const slug = (body.slug ?? "").toString().trim();
  const title = (body.title ?? "").toString().trim();
  const url = (body.url ?? "").toString().trim();
  if (!categoryId) throw new Error("categoryId 不能为空");
  if (!slug) throw new Error("slug 不能为空");
  if (!title) throw new Error("标题不能为空");
  if (!url) throw new Error("链接不能为空");

  const nowTime = formatDateTime();
  const insertRes = await db
    .insert(navItem)
    .values({
      categoryId,
      slug,
      title,
      url,
      desc: body.desc ?? null,
      tag: body.tag ?? null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      isVisible: body.isVisible !== false,
      createdAt: nowTime,
      updatedAt: nowTime
    })
    .returning({ id: navItem.id });

  return { id: insertRes[0]?.id, categoryId, slug, title, url };
};

/**
 * 后台：编辑条目
 */
export const updateItem = async (db: any, id: number, body: any) => {
  const existing = await db
    .select()
    .from(navItem)
    .where(eq(navItem.id, id))
    .limit(1);
  if (existing.length === 0) throw new Error("条目不存在");

  const updates: any = { updatedAt: formatDateTime() };
  if (typeof body.slug === "string" && body.slug.trim()) updates.slug = body.slug.trim();
  if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
  if (typeof body.url === "string" && body.url.trim()) updates.url = body.url.trim();
  if (typeof body.desc !== "undefined") updates.desc = body.desc ?? null;
  if (typeof body.tag !== "undefined") updates.tag = body.tag ?? null;
  if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;
  if (typeof body.isVisible === "boolean") updates.isVisible = body.isVisible;
  if (typeof body.categoryId === "number") updates.categoryId = body.categoryId;

  await db.update(navItem).set(updates).where(eq(navItem.id, id));
  return { id, ...updates };
};

/**
 * 后台：删除条目
 */
export const deleteItem = async (db: any, id: number) => {
  await db.delete(navItem).where(eq(navItem.id, id));
  return { id };
};

/**
 * 后台：批量删除条目
 */
export const batchDeleteItems = async (db: any, ids: number[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("请选择要删除的条目");
  }
  await db.delete(navItem).where(inArray(navItem.id, ids));
  return { message: `已成功删除 ${ids.length} 个条目` };
};

/**
 * 后台：批量导入导航数据（slug 匹配则更新，否则插入）
 */
export const batchImportNav = async (db: any, categories: any[]) => {
  const nowTime = formatDateTime();
  let importedCategories = 0;
  let importedItems = 0;

  for (let sortIdx = 0; sortIdx < categories.length; sortIdx++) {
    const cat = categories[sortIdx];
    const catSlug = (cat.slug ?? cat.id ?? "").toString().trim();
    const catName = (cat.name ?? "").toString().trim();
    if (!catSlug || !catName) continue;

    // 查找是否已存在该 slug 的分类
    const existing = await db
      .select()
      .from(navCategory)
      .where(eq(navCategory.slug, catSlug))
      .limit(1);

    let categoryId: number;

    if (existing.length > 0) {
      categoryId = existing[0].id;
      await db
        .update(navCategory)
        .set({
          name: catName,
          description: cat.description ?? existing[0].description,
          sortOrder: sortIdx,
          updatedAt: nowTime
        })
        .where(eq(navCategory.id, categoryId));
    } else {
      const insertRes = await db
        .insert(navCategory)
        .values({
          slug: catSlug,
          name: catName,
          description: cat.description ?? null,
          sortOrder: sortIdx,
          isVisible: true,
          createdAt: nowTime,
          updatedAt: nowTime
        })
        .returning({ id: navCategory.id });
      categoryId = insertRes[0]?.id;
    }
    importedCategories++;

    const items: any[] = Array.isArray(cat.items) ? cat.items : [];
    for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
      const item = items[itemIdx];
      const itemSlug = (item.slug ?? item.id ?? "").toString().trim();
      const itemTitle = (item.title ?? "").toString().trim();
      const itemUrl = (item.url ?? "").toString().trim();
      if (!itemSlug || !itemTitle || !itemUrl) continue;

      // 同分类内 slug 匹配
      const existingItem = await db
        .select()
        .from(navItem)
        .where(and(eq(navItem.categoryId, categoryId), eq(navItem.slug, itemSlug)))
        .limit(1);

      if (existingItem.length > 0) {
        await db
          .update(navItem)
          .set({
            title: itemTitle,
            url: itemUrl,
            desc: item.desc ?? existingItem[0].desc,
            tag: item.tag ?? existingItem[0].tag,
            sortOrder: itemIdx,
            updatedAt: nowTime
          })
          .where(eq(navItem.id, existingItem[0].id));
      } else {
        await db.insert(navItem).values({
          categoryId,
          slug: itemSlug,
          title: itemTitle,
          url: itemUrl,
          desc: item.desc ?? null,
          tag: item.tag ?? null,
          sortOrder: itemIdx,
          isVisible: true,
          createdAt: nowTime,
          updatedAt: nowTime
        });
      }
      importedItems++;
    }
  }

  return { importedCategories, importedItems };
};
