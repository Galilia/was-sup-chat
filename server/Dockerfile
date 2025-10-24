# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
# установим только то, что нужно чтобы собрать
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build   # -> tsc в dist

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Создадим небезопасного root-пользователя не нужно, но можно перейти на node
USER node

# скопируем только то, что нужно для запуска
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
