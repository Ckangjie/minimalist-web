/**
 * 默认导航数据预设配置
 * 覆盖：开发工具、AI 工具、设计素材、影视娱乐 四大分类
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
  }
];

export const SEARCH_ENGINES = [
  { id: "site", name: "站内直搜", icon: "🔍", placeholder: "输入关键词实时过滤导航书签..." },
  { id: "google", name: "Google", icon: "🌐", url: "https://www.google.com/search?q=" },
  { id: "github", name: "GitHub", icon: "🐙", url: "https://github.com/search?q=" },
  { id: "baidu", name: "百度", icon: "🐾", url: "https://www.baidu.com/s?wd=" },
  { id: "bing", name: "Bing", icon: "⚡", url: "https://www.bing.com/search?q=" }
];
