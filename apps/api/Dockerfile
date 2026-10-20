# Stage 1: Build
FROM node:24-bookworm-slim AS builder

WORKDIR /workspace

RUN npm install -g pnpm@12.8.1

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN pnpm --filter api build


# Stage 2: Runtime
FROM node:24-bookworm-slim AS runner

WORKDIR /workspace

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /workspace/apps/api/dist ./apps/api/dist
COPY --from=builder /workspace/apps/api/package.json ./apps/api/package.json

WORKDIR /workspace/apps/api

USER node

EXPOSE 3001

CMD ["node", "dist/main.js"]