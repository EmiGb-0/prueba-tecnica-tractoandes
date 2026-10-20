# Build stage
FROM node:24-bookworm-slim AS builder

WORKDIR /workspace

RUN npm install -g pnpm@12.8.1

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web

RUN pnpm --filter web build

FROM node:24-bookworm-slim AS runner

WORKDIR /workspace

ENV NODE_ENV=production
ENV PORT=3000

COPY --chown=node:node --from=builder /workspace/node_modules ./node_modules
COPY --chown=node:node --from=builder /workspace/apps/web/node_modules ./apps/web/node_modules
COPY --chown=node:node --from=builder /workspace/apps/web/.next ./apps/web/.next
COPY --chown=node:node --from=builder /workspace/apps/web/public ./apps/web/public
COPY --chown=node:node --from=builder /workspace/apps/web/package.json ./apps/web/package.json

WORKDIR /workspace/apps/web

USER node

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]