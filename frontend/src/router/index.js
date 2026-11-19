import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/index/index.vue")
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
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
