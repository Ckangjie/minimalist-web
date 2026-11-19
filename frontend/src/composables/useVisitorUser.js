import { ref, computed } from "vue";
import request from "@/utils/request";

const UUID_KEY = "jie_hub_visitor_uuid";
const USER_CACHE_KEY = "jie_hub_visitor_user";

// 随机昵称前缀词库
const PREFIXES = [
  "旅行者", "漫游者", "探索者", "极客", "筑梦师",
  "观星者", "知心客", "极客少年", "数码匠", "时光旅人",
  "代码诗人", "追光者", "云游侠", "守夜人", "星际漫步"
];

// 头像渐变配色方案（作为兜底底色）
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #0ea5e9, #3b82f6)",
  "linear-gradient(135deg, #84cc16, #10b981)"
];

// DiceBear 在线头像风格池：支持卡通、插画、真实人物肖像、抽象、几何等风格
export const DICEBEAR_STYLES = [
  // 卡通 (Cartoon)
  "adventurer", "bottts", "fun-emoji",
  // 插画 (Illustration)
  "lorelei", "notionists", "open-peeps", "avataaars",
  // 真实人物/肖像 (Real person / Portrait)
  "personas", "micah",
  // 抽象 (Abstract)
  "shapes", "glass",
  // 几何 (Geometric)
  "identicon", "rings"
];

export const generateDiceBearAvatar = (seed) => {
  const style = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)];
  const safeSeed = encodeURIComponent(seed || Math.random().toString(36).slice(2));
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${safeSeed}`;
};

// 生成标准 UUID
const getOrCreateUUID = () => {
  let uuid = "";
  try {
    uuid = localStorage.getItem(UUID_KEY) || "";
  } catch (e) {
    console.warn("读取 localStorage UUID 失败", e);
  }

  if (!uuid) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      uuid = crypto.randomUUID();
    } else {
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    try {
      localStorage.setItem(UUID_KEY, uuid);
    } catch (e) {
      console.warn("保存 localStorage UUID 失败", e);
    }
  }

  return uuid;
};

// 单例响应式状态
const visitorState = ref(null);
const isSyncing = ref(false);

const initVisitorState = () => {
  if (visitorState.value) return;

  const uuid = getOrCreateUUID();
  let cachedUser = null;

  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (raw) {
      cachedUser = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("读取游客缓存失败", e);
  }

  // 计算一个固定梯度颜色
  const hash = uuid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarBg = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];

  if (cachedUser && cachedUser.uuid === uuid && cachedUser.nickname) {
    visitorState.value = {
      uuid,
      nickname: cachedUser.nickname,
      email: cachedUser.email || "",
      avatar: cachedUser.avatar || generateDiceBearAvatar(uuid),
      avatarBg
    };
  } else {
    // 默认生成初始昵称与随机 DiceBear 头像供初次注册使用
    const prefix = PREFIXES[hash % PREFIXES.length];
    const suffix = 1000 + (hash % 9000);
    const initialNick = `${prefix}_${suffix}`;
    const initialAvatar = generateDiceBearAvatar(uuid);

    visitorState.value = {
      uuid,
      nickname: initialNick,
      email: "",
      avatar: initialAvatar,
      avatarBg
    };
  }

  // 异步与后端数据库表保持一致，锁定服务端永久分配的固定昵称与专属头像
  syncWithServer();
};

const syncWithServer = async () => {
  if (!visitorState.value || isSyncing.value) return;
  isSyncing.value = true;

  try {
    const res = await request("/api/guestbook/visitor/sync", {
      method: "POST",
      body: {
        uuid: visitorState.value.uuid,
        defaultNickname: visitorState.value.nickname,
        avatar: visitorState.value.avatar || "",
        email: visitorState.value.email || ""
      }
    });

    if (res && res.nickname) {
      visitorState.value.nickname = res.nickname;
      visitorState.value.email = res.email || "";
      if (res.avatar) {
        visitorState.value.avatar = res.avatar;
      }
      try {
        localStorage.setItem(
          USER_CACHE_KEY,
          JSON.stringify({
            uuid: visitorState.value.uuid,
            nickname: res.nickname,
            email: res.email || "",
            avatar: visitorState.value.avatar
          })
        );
      } catch (e) {
        console.warn("写入本地游客缓存失败", e);
      }
    }
  } catch (err) {
    console.warn("同步游客信息至服务器失败，使用本地缓存:", err);
  } finally {
    isSyncing.value = false;
  }
};

export const useVisitorUser = () => {
  initVisitorState();

  // 仅允许更新通知邮箱（昵称全局固定，不允许前台修改）
  const updateEmail = async (email) => {
    if (!visitorState.value) return;
    const cleanEmail = typeof email === "string" ? email.trim().slice(0, 100) : "";
    visitorState.value.email = cleanEmail;

    try {
      localStorage.setItem(
        USER_CACHE_KEY,
        JSON.stringify({
          uuid: visitorState.value.uuid,
          nickname: visitorState.value.nickname,
          email: cleanEmail,
          avatar: visitorState.value.avatar
        })
      );
    } catch (e) {
      console.warn("写入本地游客缓存失败", e);
    }

    // 同步到后端
    try {
      await request("/api/guestbook/visitor/sync", {
        method: "POST",
        body: {
          uuid: visitorState.value.uuid,
          defaultNickname: visitorState.value.nickname,
          avatar: visitorState.value.avatar || "",
          email: cleanEmail
        }
      });
    } catch (e) {
      console.error("同步邮箱到服务器失败:", e);
    }
  };

  const avatarText = computed(() => {
    const nick = visitorState.value?.nickname || "游";
    return nick.charAt(0).toUpperCase();
  });

  return {
    visitorUser: visitorState,
    avatarText,
    updateEmail,
    syncWithServer
  };
};
