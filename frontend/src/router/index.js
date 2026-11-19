import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/index/index.vue"),
        meta: { navMode: "system" }
      },
      {
        path: "system",
        name: "SystemNav",
        component: () => import("@/views/index/index.vue"),
        meta: { navMode: "system" }
      },
      {
        path: "bookmarks",
        name: "Bookmarks",
        component: () => import("@/views/index/index.vue"),
        meta: { navMode: "bookmarks" }
      },
      {
        path: "tools",
        name: "Tools",
        component: () => import("@/views/index/index.vue"),
        meta: { navMode: "tools" }
      },
      {
        path: "guestbook",
        name: "Guestbook",
        component: () => import("@/views/guestbook/index.vue")
      },
      {
        path: "explore",
        name: "Explore",
        component: () => import("@/views/explore/index.vue")
      }
    ]
  },
  {
    path: "/404",
    name: "NotFound",
    component: () => import("@/views/error/404.vue")
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404"
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
