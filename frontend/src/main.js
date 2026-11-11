import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// UnoCSS 核心样式注入
import "virtual:uno.css";

// Element Plus 基础样式与暗色模式变量
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

// 全局 SCSS 样式
import "@/assets/styles/global.scss";

const app = createApp(App);

app.use(router);

app.mount("#app");
