import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import Layout from "@/layout/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录", hidden: true }
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "首页控制台", icon: "House" }
      },
      {
        path: "guestbook",
        name: "GuestbookManage",
        component: () => import("@/views/guestbook/index.vue"),
        meta: {
          title: "留言列表",
          parentTitle: "留言板管理",
          parentIcon: "ChatDotRound",
          icon: "Document"
        }
      },
      {
        path: "visitor",
        name: "VisitorManage",
        component: () => import("@/views/visitor/index.vue"),
        meta: {
          title: "访客用户",
          parentTitle: "留言板管理",
          parentIcon: "ChatDotRound",
          icon: "User"
        }
      },
      {
        path: "friend-link",
        name: "FriendLinkManage",
        component: () => import("@/views/friendLink/index.vue"),
        meta: {
          title: "友链管理",
          icon: "Link"
        }
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
