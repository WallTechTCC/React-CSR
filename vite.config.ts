import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const filePath = path.join(process.cwd(), "metrics.jsonl");

  return {
    plugins: [
      react(),
      {
        name: "web-vitals-middleware",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/api/web-vitals" && req.method === "POST") {
              let body = "";
              req.on("data", (chunk) => { body += chunk; });
              req.on("end", async () => {
                const metric = JSON.parse(body || "{}");
                const doc = { ...metric, ts: new Date().toISOString() };
                await fs.appendFile(filePath, JSON.stringify(doc) + "\n", "utf8");
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: true, metric: doc }));
              });
              return;
            }
            next();
          });
        },
      },
    ],
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
