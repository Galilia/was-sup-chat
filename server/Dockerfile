# ---------- build stage ----------
FROM node:20-alpine AS build

# Рабочая директория всего проекта
WORKDIR /app

# Кладём server/package*.json и tsconfig.json в /app/server
COPY server/package*.json server/tsconfig.json ./server/

# Устанавливаем зависимости и собираем именно из /app/server
WORKDIR /app/server
RUN npm ci

# Копируем исходники
COPY server/src ./src

# Сборка в /app/server/dist
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime

# Запускаемся в /app/server
WORKDIR /app/server

ENV NODE_ENV=production

# Только prod-зависимости
COPY --from=build /app/server/package*.json ./
RUN npm ci --omit=dev

# Готовый dist
COPY --from=build /app/server/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
