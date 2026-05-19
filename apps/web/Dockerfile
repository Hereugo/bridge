FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci -w apps/web 2>/dev/null || npm install -w apps/web

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build -w apps/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
