# 1. Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Paketlarni o'rnatish
COPY package*.json ./
RUN npm install

# Barcha kodlarni nusxalash va build qilish
COPY . .
RUN npm run build

# 2. Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Faqat kerakli fayllarni ko'chirish
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public 2>/dev/null || true

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
