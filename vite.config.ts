import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "/api/news": {
          target: "https://newsapi.org",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/news/, "/v2"),
          headers: { "X-Api-Key": env.VITE_NEWSAPI_KEY ?? "" },
        },
      },
    },
  };
});
