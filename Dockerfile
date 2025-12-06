# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app
ENV CI=true
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY prisma ./prisma
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate \
  && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 4000
CMD ["node", "dist/bootstrap/server.js"]

