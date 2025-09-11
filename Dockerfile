# ---------- 1) deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# ---------- 2) build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 👇 garante que o Vite leia suas VITE_* do host
COPY .env ./.env
RUN npm run build

# ---------- 3) runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=UTC
ENV NODE_OPTIONS=--max-old-space-size=512
COPY --from=builder /app/dist ./dist
COPY server.cjs ./server.cjs
USER node
EXPOSE 3000
CMD ["node", "server.cjs"]
