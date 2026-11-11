# frontend

基于 Vue3 + Vite6 的轻量前端项目。

## 技术栈

- **Vue 3.4** - 渐进式 JavaScript 框架
- **Vite 6.4** - 前端构建工具
- **Vue Router 4** - 官方路由管理器
- **Sass/SCSS** - CSS 预处理器

## 功能特性

✅ Vue3 Composition API setup 语法  
✅ Vue API 自动导入  
✅ 路径别名配置（@）  
✅ 全局样式变量（主题色）  
✅ 基础路由和首页示例  
✅ 常用目录占位，按需添加业务代码  
✅ 环境变量配置  
✅ 支持指定运行环境模式  

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 资源文件
│   │   ├── icons/          # 图标
│   │   ├── images/         # 图片
│   │   └── styles/         # 全局样式和变量
│   ├── components/         # 公共组件
│   ├── composables/        # 组合式函数，按需添加
│   ├── layout/             # 布局组件
│   ├── views/              # 页面视图
│   │   └── index/
│   │       └── index.vue
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理，按需添加 Pinia
│   ├── api/                # API 接口，按需添加请求封装
│   ├── utils/              # 公共工具，按需添加
│   ├── App.vue
│   └── main.js
├── .env.development
├── .env.production
├── AGENTS.md
├── vite.config.js
└── package.json
```

## 开始使用

```bash
pnpm install
pnpm run dev
```

访问地址：

- http://localhost:3000
- http://[你的IP地址]:3000

## 目录怎么用

- 页面：放在 `src/views/` 下，并在 `src/router/index.js` 添加路由。
- 组件：可复用 UI 放在 `src/components/`。
- 组合式函数：复用状态逻辑放在 `src/composables/`。
- API：需要接口请求时，在 `src/api/` 新增模块；需要 axios 时再安装并封装。
- 状态管理：需要跨页面共享状态时，再安装 Pinia 并写到 `src/stores/`。
- 工具函数：确实有复用价值时，再写到 `src/utils/`。

## 路径别名

`@` 指向 `src/`：

```javascript
import NavBar from "@/layout/NavBar.vue";
```

## Vue API 自动导入

已配置 `unplugin-auto-import`，可以直接使用 Vue API：

```javascript
const count = ref(0);
const doubleCount = computed(() => count.value * 2);
```

## 全局样式变量

`src/assets/styles/variables.scss` 中定义了主题色变量，可在组件样式中直接使用：

```scss
.button {
  color: $primary-color;
}
```

## 按需扩展

```bash
# 状态管理
pnpm add pinia

# 请求库
pnpm add axios

# 事件总线
pnpm add mitt

# 代码检查和格式化
pnpm add -D eslint prettier eslint-plugin-vue eslint-config-prettier globals @eslint/js
```

## AI 协作

项目根目录包含 `AGENTS.md`，后续让 AI 协作修改项目时应优先遵循其中的项目规范。每次任务完成后都需要做自review，并在回复中简要说明检查结果。

## License

MIT
