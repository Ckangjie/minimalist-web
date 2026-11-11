import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"]
      }),
      {
        name: "html-title-transform",
        transformIndexHtml(html) {
          const title = env.VITE_APP_TITLE || "cloudflare";
          return html.replace(/%VITE_APP_TITLE%/g, title);
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sass:color"; @use "@/assets/styles/variables.scss" as *;',
          api: "modern-compiler",
          silenceDeprecations: ["legacy-js-api", "color-functions", "global-builtin", "import"]
        }
      }
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
      open: false,
      cors: true,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true
        }
      }
    }
  };
});
