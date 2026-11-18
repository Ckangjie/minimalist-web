import router from "./router";

const whiteList = ["/login"];

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("admin_token");

  if (token) {
    if (to.path === "/login") {
      next({ path: "/dashboard" });
    } else {
      next();
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next({ path: `/login?redirect=${encodeURIComponent(to.fullPath)}` });
    }
  }
});
