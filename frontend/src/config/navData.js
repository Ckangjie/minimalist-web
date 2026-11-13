/**
 * 默认系统导航数据预设配置
 * 覆盖：开发工具、编程技术、组件库、JavaScript 库、AI 工具、设计素材、影视娱乐、直播平台 八大分类
 */
export const DEFAULT_NAV_CATEGORIES = [
  {
    id: "dev-tools",
    name: "开发工具",
    icon: "🛠️",
    description: "代码托管、边缘云、研发调试与文档规范",
    items: [
      {
        id: "github",
        title: "GitHub",
        url: "https://github.com",
        desc: "全球最大的开源代码托管与协作平台",
        tag: "代码"
      },
      {
        id: "cloudflare",
        title: "Cloudflare",
        url: "https://dash.cloudflare.com",
        desc: "全球 Anycast 边缘云、Workers、D1 及域名管理",
        tag: "云服务"
      },
      {
        id: "vercel",
        title: "Vercel",
        url: "https://vercel.com",
        desc: "现代化前端构建、无服务器与自动化部署平台",
        tag: "部署"
      },
      {
        id: "devv",
        title: "Devv.ai",
        url: "https://devv.ai",
        desc: "面向开发者的新一代智能 AI 编程搜索引擎",
        tag: "搜索"
      },
      {
        id: "npm",
        title: "NPM Registry",
        url: "https://www.npmjs.com",
        desc: "全球最大的 JavaScript/Node.js 开源生态包仓库",
        tag: "生态"
      },
      {
        id: "regex101",
        title: "Regex101",
        url: "https://regex101.com",
        desc: "在线正则表达式实时调试、生成与语法全解析",
        tag: "效率"
      },
      {
        id: "codepen",
        title: "CodePen",
        url: "https://codepen.io",
        desc: "前端 HTML/CSS/JS 在线轻量级演练与灵感社区",
        tag: "演练"
      },
      {
        id: "mdn",
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/zh-CN",
        desc: "权威的前端标准规范、JavaScript/CSS API 核心文档",
        tag: "文档"
      },
      {
        id: "caniuse",
        title: "Can I use",
        url: "https://caniuse.com",
        desc: "主流浏览器对 HTML5/CSS3/JS 新特性兼容性查询",
        tag: "兼容"
      },
      {
        id: "jsoncrack",
        title: "JSON Crack",
        url: "https://jsoncrack.com/editor",
        desc: "可视化图表生成器，将复杂 JSON 结构图形化展现",
        tag: "工具"
      },
      {
        id: "dnshe",
        title: "电脑社",
        url: "https://www.dnshe.com/",
        desc: "精选优质实用软件、电脑装机必备与技术效率工具分享",
        tag: "工具"
      },
      {
        id: "msdn-aihao",
        title: "MSDN 我告诉你",
        url: "https://msdn.aihao.cc/",
        desc: "微软官方原版 Windows 系统、开发工具与 Office 镜像资源库",
        tag: "镜像"
      },
      {
        id: "apifox",
        title: "Apifox",
        url: "https://apifox.com",
        desc: "API 文档、API 调试、API Mock、API 自动化测试一体化协作平台",
        tag: "接口"
      },
      {
        id: "postman",
        title: "Postman",
        url: "https://www.postman.com",
        desc: "全球领先的 API 接口设计、调试与自动化测试开发平台",
        tag: "接口"
      },
      {
        id: "bundlephobia",
        title: "Bundlephobia",
        url: "https://bundlephobia.com",
        desc: "查询分析 NPM 包的打包体积大小与浏览器端加载耗时",
        tag: "性能"
      },
      {
        id: "transform-tools",
        title: "Transform.tools",
        url: "https://transform.tools",
        desc: "多语言代码转换神器，支持 JSON转TS、HTML转JSX 等",
        tag: "转换"
      },
      {
        id: "svgomg",
        title: "SVGOMG",
        url: "https://jakearchibald.github.io/svgomg/",
        desc: "在线 SVG 矢量图极速无损压缩与冗余属性清理利器",
        tag: "压缩"
      },
      {
        id: "stackblitz",
        title: "StackBlitz",
        url: "https://stackblitz.com",
        desc: "基于 WebContainer 的在线全栈 IDE，秒级启动前端与后端工程",
        tag: "IDE"
      },
      {
        id: "docker-hub",
        title: "Docker Hub",
        url: "https://hub.docker.com",
        desc: "全球官方容器镜像中心，后端微服务与基础运行环境仓库",
        tag: "容器"
      },
      {
        id: "crontab-guru",
        title: "Crontab Guru",
        url: "https://crontab.guru",
        desc: "后端定时任务 Cron 表达式可视化在线编辑器与执行时间解析",
        tag: "定时"
      },
      {
        id: "linux-command",
        title: "Linux 命令速查",
        url: "https://wangchujiang.com/linux-command/",
        desc: "最全的 Linux 常用命令全中文速查手册与实用参数详解",
        tag: "运维"
      },
      {
        id: "cyberchef",
        title: "CyberChef",
        url: "https://gchq.github.io/CyberChef/",
        desc: "瑞士军刀级万能数据编解码、加密解密与哈希计算套件",
        tag: "安全"
      }
    ]
  },
  {
    id: "programming",
    name: "编程技术",
    icon: "💻",
    description: "算法刷题、技术社区、开发者问答与极客资讯",
    items: [
      {
        id: "leetcode",
        title: "LeetCode 力扣",
        url: "https://leetcode.cn",
        desc: "全球顶尖程序员技术成长与经典算法面试平台",
        tag: "刷题"
      },
      {
        id: "juejin",
        title: "稀土掘金",
        url: "https://juejin.cn",
        desc: "高质量原创技术分享与前端/后端开发者交流社区",
        tag: "社区"
      },
      {
        id: "stackoverflow",
        title: "Stack Overflow",
        url: "https://stackoverflow.com",
        desc: "全球最大的程序员技术问答与编程疑难解答平台",
        tag: "问答"
      },
      {
        id: "v2ex",
        title: "V2EX",
        url: "https://www.v2ex.com",
        desc: "创意工作者、极客与互联网从业者的纯粹交流讨论区",
        tag: "极客"
      },
      {
        id: "github-trending",
        title: "GitHub Trending",
        url: "https://github.com/trending",
        desc: "探索全球每日与每周最新热门开源项目趋势",
        tag: "趋势"
      },
      {
        id: "nowcoder",
        title: "牛客网",
        url: "https://www.nowcoder.com",
        desc: "互联网名企真题笔试面经与技术工程师求职交流平台",
        tag: "求职"
      },
      {
        id: "segmentfault",
        title: "SegmentFault 思否",
        url: "https://segmentfault.com",
        desc: "中文领先的开发者技术交流平台，技术沉淀与问答社区",
        tag: "社区"
      },
      {
        id: "runoob",
        title: "菜鸟教程",
        url: "https://www.runoob.com",
        desc: "全面丰富的编程基础教程与多语言语法速查手册",
        tag: "教程"
      }
    ]
  },
  {
    id: "ui-components",
    name: "组件库",
    icon: "🧩",
    description: "Vue、React 及跨端现代化前端界面组件库与设计系统",
    items: [
      {
        id: "element-plus",
        title: "Element Plus",
        url: "https://element-plus.org/zh-CN/",
        desc: "基于 Vue 3 的面向设计师和开发者的桌面端组件库",
        tag: "Vue3"
      },
      {
        id: "ant-design",
        title: "Ant Design",
        url: "https://ant.design/index-cn",
        desc: "企业级产品设计体系与高质量 React UI 组件库",
        tag: "React"
      },
      {
        id: "shadcn-ui",
        title: "Shadcn UI",
        url: "https://ui.shadcn.com",
        desc: "精美设计、无头化且源码完全受控的现代组件套件",
        tag: "Tailwind"
      },
      {
        id: "arco-design",
        title: "Arco Design",
        url: "https://arco.design",
        desc: "字节跳动企业级开源设计系统与现代化组件库",
        tag: "企业级"
      },
      {
        id: "naive-ui",
        title: "Naive UI",
        url: "https://www.naiveui.com/zh-CN/os-theme",
        desc: "基于 Vue 3 的现代化 UI 组件库，全量 TypeScript 支持",
        tag: "Vue3"
      },
      {
        id: "tailwind-css",
        title: "Tailwind CSS",
        url: "https://tailwindcss.com",
        desc: "实用优先的原子化 CSS 框架，无需脱离 HTML 即可构建现代 UI",
        tag: "CSS"
      },
      {
        id: "vant",
        title: "Vant",
        url: "https://vant-ui.github.io/vant/",
        desc: "轻量、可靠的移动端 Vue 3 组件库，支持多种移动场景",
        tag: "移动端"
      },
      {
        id: "uniapp",
        title: "Uni-app",
        url: "https://uniapp.dcloud.net.cn",
        desc: "编写一套代码，发布至微信小程序、App 及 H5 的跨端框架",
        tag: "跨端"
      }
    ]
  },
  {
    id: "js-libraries",
    name: "JavaScript 库",
    icon: "⚡",
    description: "前端框架、状态管理、数据图表与高频实用工具库",
    items: [
      {
        id: "vuejs",
        title: "Vue.js",
        url: "https://cn.vuejs.org",
        desc: "渐进式 JavaScript 框架，易学易用、性能出色且生态繁荣",
        tag: "框架"
      },
      {
        id: "react",
        title: "React",
        url: "https://react.dev",
        desc: "用于构建现代化 Web 和原生交互界面的主流前端框架",
        tag: "框架"
      },
      {
        id: "vite",
        title: "Vite",
        url: "https://cn.vitejs.dev",
        desc: "下一代前端开发与构建工具，极速冷启动与毫秒级热更新",
        tag: "构建"
      },
      {
        id: "pinia",
        title: "Pinia",
        url: "https://pinia.vuejs.org/zh/",
        desc: "Vue 官方推荐的新一代直观、类型安全的状态管理库",
        tag: "状态"
      },
      {
        id: "axios",
        title: "Axios",
        url: "https://axios-http.com",
        desc: "轻量易用、基于 Promise 的现代浏览器与 Node.js HTTP 客户端",
        tag: "网络"
      },
      {
        id: "echarts",
        title: "Apache ECharts",
        url: "https://echarts.apache.org/zh/index.html",
        desc: "基于 JavaScript 的开源可视化图表库，涵盖海量商业图表",
        tag: "图表"
      },
      {
        id: "lodash",
        title: "Lodash",
        url: "https://lodash.com",
        desc: "现代化 JavaScript 实用工具库，提供模块化与高性能函数",
        tag: "工具"
      },
      {
        id: "dayjs",
        title: "Day.js",
        url: "https://day.js.org/zh-CN/",
        desc: "仅 2KB 大小的轻量级时间与日期解析处理库",
        tag: "工具"
      }
    ]
  },
  {
    id: "ai-hub",
    name: "AI 工具",
    icon: "🤖",
    description: "大语言模型、智能编程、AI 绘画与多模态生产力",
    items: [
      {
        id: "chatgpt",
        title: "ChatGPT",
        url: "https://chatgpt.com",
        desc: "OpenAI 旗舰对话助手，全能任务协作与深度逻辑推理",
        tag: "LLM"
      },
      {
        id: "claude",
        title: "Claude",
        url: "https://claude.ai",
        desc: "Anthropic 长文本理解与高质量编程代码生成助手",
        tag: "编程"
      },
      {
        id: "gemini",
        title: "Google Gemini",
        url: "https://gemini.google.com",
        desc: "谷歌原生多模态大模型，超长上下文与实时搜索整合",
        tag: "多模态"
      },
      {
        id: "deepseek",
        title: "DeepSeek",
        url: "https://chat.deepseek.com",
        desc: "深度求索高推理模型，理科计算与开源生态表现强劲",
        tag: "推理"
      },
      {
        id: "cursor",
        title: "Cursor",
        url: "https://www.cursor.com",
        desc: "新一代 AI 辅助代码编辑器，全库上下文深度融合",
        tag: "IDE"
      },
      {
        id: "kimi",
        title: "Kimi 智能助手",
        url: "https://kimi.moonshot.cn",
        desc: "月之暗面长文本分析神器，支持百万字文献快速提炼",
        tag: "长文本"
      },
      {
        id: "perplexity",
        title: "Perplexity",
        url: "https://www.perplexity.ai",
        desc: "带权威引用源的 AI 问答搜索引擎，告别虚假幻觉",
        tag: "搜索"
      },
      {
        id: "v0",
        title: "v0 by Vercel",
        url: "https://v0.dev",
        desc: "输入自然语言即可生成现代化 Tailwind/React/Vue UI",
        tag: "前端"
      },
      {
        id: "midjourney",
        title: "Midjourney",
        url: "https://www.midjourney.com",
        desc: "工业级 AI 艺术图像生成与视觉创意工具",
        tag: "图像"
      },
      {
        id: "huggingface",
        title: "Hugging Face",
        url: "https://huggingface.co",
        desc: "全球开源机器学习模型、数据集与 Spaces 应用社区",
        tag: "开源"
      },
      {
        id: "google-stitch",
        title: "Google Stitch",
        url: "https://stitch.google.com/",
        desc: "Google 出品的 AI 原生界面与原型设计画布，自然语言生成高保真 UI",
        tag: "设计"
      }
    ]
  },
  {
    id: "design-assets",
    name: "设计素材",
    icon: "🎨",
    description: "UI/UX 原型、高清图库、矢量图标与配色方案",
    items: [
      {
        id: "figma",
        title: "Figma",
        url: "https://www.figma.com",
        desc: "业内标准级协同界面设计与交互原型设计利器",
        tag: "原型"
      },
      {
        id: "mobbin",
        title: "Mobbin",
        url: "https://mobbin.com",
        desc: "精选全球 60 万+ 顶级 App 与 Web 端界面流程灵感库",
        tag: "灵感"
      },
      {
        id: "dribbble",
        title: "Dribbble",
        url: "https://dribbble.com",
        desc: "全球顶尖视觉设计师与插画师作品交流社区",
        tag: "作品"
      },
      {
        id: "unsplash",
        title: "Unsplash",
        url: "https://unsplash.com",
        desc: "高清无版权摄影图库，支持个人与商业免费使用",
        tag: "图库"
      },
      {
        id: "iconfont",
        title: "Iconfont",
        url: "https://www.iconfont.cn",
        desc: "阿里巴巴矢量图标库，丰富国内技术栈与海量图标",
        tag: "图标"
      },
      {
        id: "lucide",
        title: "Lucide Icons",
        url: "https://lucide.dev",
        desc: "精美、统一、超轻量的现代化开源 SVG 图标套件",
        tag: "图标"
      },
      {
        id: "coolors",
        title: "Coolors",
        url: "https://coolors.co",
        desc: "极速配色方案生成器，一键探索与调校完美调色板",
        tag: "配色"
      },
      {
        id: "realtimecolors",
        title: "Realtime Colors",
        url: "https://www.realtimecolors.com",
        desc: "在真实网页布局中实时预览字体与色彩搭配效果",
        tag: "配色"
      },
      {
        id: "pixso",
        title: "Pixso",
        url: "https://pixso.cn",
        desc: "新一代国产协同设计与代码交付平台，全平台支持",
        tag: "国产"
      },
      {
        id: "behance",
        title: "Behance",
        url: "https://www.behance.net",
        desc: "Adobe 旗下全球创意作品与品牌设计展示网络",
        tag: "展示"
      }
    ]
  },
  {
    id: "media-leisure",
    name: "影视娱乐",
    icon: "🎬",
    description: "影评社区、高品质音视频、流媒体与休闲放松",
    items: [
      {
        id: "douban-movie",
        title: "豆瓣电影",
        url: "https://movie.douban.com",
        desc: "权威中文影视评分、影迷真实长短评与排行榜单",
        tag: "评分"
      },
      {
        id: "bilibili",
        title: "哔哩哔哩 (Bilibili)",
        url: "https://www.bilibili.com",
        desc: "年轻人的高质量文化社区，优质泛知识与动画视频",
        tag: "视频"
      },
      {
        id: "youtube",
        title: "YouTube",
        url: "https://www.youtube.com",
        desc: "全球最大视频流媒体平台，全球视听盛宴与技术分享",
        tag: "视频"
      },
      {
        id: "spotify",
        title: "Spotify Web",
        url: "https://open.spotify.com",
        desc: "全球流行音乐流媒体，智能歌单推荐与优质播客",
        tag: "音乐"
      },
      {
        id: "netease-music",
        title: "网易云音乐",
        url: "https://music.163.com",
        desc: "专注于发现与分享的音乐产品，共鸣评论与云村氛围",
        tag: "音乐"
      },
      {
        id: "xiaoyuzhou",
        title: "小宇宙播客",
        url: "https://www.xiaoyuzhoufm.com",
        desc: "中文中文精品播客音频社区，深度对话与思维启发",
        tag: "播客"
      },
      {
        id: "imdb",
        title: "IMDb",
        url: "https://www.imdb.com",
        desc: "全球最大的互联网电影数据库与全球影人资料库",
        tag: "资讯"
      },
      {
        id: "yingshishenlin",
        title: "影视森林",
        url: "https://549.tv",
        desc: "一站式影视导航聚合，快速定位主流影视与解析站点",
        tag: "导航"
      }
    ]
  },
  {
    id: "live-stream",
    name: "直播平台",
    icon: "📺",
    description: "游戏电竞、互动直播、全球赛事与综合娱乐流媒体",
    items: [
      {
        id: "douyu",
        title: "斗鱼直播",
        url: "https://www.douyu.com",
        desc: "头部游戏与电竞直播平台，高清互动与海量游戏主播",
        tag: "游戏"
      },
      {
        id: "huya",
        title: "虎牙直播",
        url: "https://www.huya.com",
        desc: "热门游戏赛事、电竞独家直播与综合泛娱乐互动平台",
        tag: "电竞"
      },
      {
        id: "twitch",
        title: "Twitch",
        url: "https://www.twitch.tv",
        desc: "全球顶尖的游戏互动直播社区与全球电竞赛事转播平台",
        tag: "海外"
      },
      {
        id: "douyin-live",
        title: "抖音直播",
        url: "https://live.douyin.com",
        desc: "抖音网页版直播专区，泛娱乐、知识生活与优质创作者",
        tag: "综合"
      },
      {
        id: "cc-live",
        title: "CC 直播",
        url: "https://cc.163.com",
        desc: "网易旗下电竞赛事、MMO 与精品游戏直播互动社区",
        tag: "游戏"
      },
      {
        id: "kuaishou-live",
        title: "快手直播",
        url: "https://live.kuaishou.com",
        desc: "多元化的泛娱乐、生活记录与才艺达人互动直播",
        tag: "生活"
      }
    ]
  }
];

export const SEARCH_ENGINES = [
  { id: "site", name: "站内直搜", icon: "🔍", placeholder: "输入关键词实时过滤导航书签..." },
  { id: "google", name: "Google", icon: "🌐", url: "https://www.google.com/search?q=" },
  { id: "github", name: "GitHub", icon: "🐙", url: "https://github.com/search?q=" },
  { id: "baidu", name: "百度", icon: "🐾", url: "https://www.baidu.com/s?wd=" },
  { id: "bing", name: "Bing", icon: "⚡", url: "https://www.bing.com/search?q=" }
];

/**
 * 顶部「导航工具」专属分类数据
 * 每个工具/资源包对应一个卡片，支持离线包直接下载；附带仓库的显示 GitHub 图标直达源码
 */
export const TOOL_NAV_CATEGORIES = [
  {
    id: "nav-tools",
    name: "导航工具",
    icon: "🧰",
    description: "自研工具资源包与开源项目集合，支持离线包直接下载与 GitHub 仓库直达",
    items: [
      {
        id: "tool-uni-offline-pack",
        title: "UniOfflinePack.exe",
        url: "https://github.com/Ckangjie/uni-packer",
        downloadUrl: "/resources/UniOfflinePack.exe",
        downloadName: "UniOfflinePack.exe",
        repoUrl: "https://github.com/Ckangjie/uni-packer",
        desc: "零 Android Studio 依赖的 uni-app 本地离线打包工作台，支持环境一键自愈、证书自动嗅探与极速 APK 编译交付",
        tag: "EXE",
        icon: "📦"
      },
      {
        id: "tool-bookmark-desk",
        title: "BookmarkDesk",
        url: "https://github.com/Ckangjie/bookmark-desk",
        downloadUrl: "/resources/BookmarkDesk.zip",
        downloadName: "BookmarkDesk.zip",
        repoUrl: "https://github.com/Ckangjie/bookmark-desk",
        desc: "书签管家 BookmarkDesk 是一个本地书签工作台。打开扩展即可在独立标签页里查看、搜索和整理导入的浏览器书签",
        tag: "ZIP",
        isZip: true,
        icon: "📑"
      },
      {
        id: "tool-minimalist-web",
        title: "Jie Hub 导航项目源码",
        url: "https://github.com/Ckangjie/minimalist-web",
        repoUrl: "https://github.com/Ckangjie/minimalist-web",
        desc: "基于 Vue 3 + UnoCSS + Cloudflare Pages 构建的聚合导航中枢源码仓库",
        tag: "开源项目",
        icon: "🐙"
      }
    ]
  }
];
