
FROM node:24-bookworm-slim AS builder

WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@12.8.1

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN pnpm --filter api exec prisma generate

RUN rm -rf apps/api/dist \
    && find apps/api -maxdepth 1 -name '*.tsbuildinfo' -delete \
    && pnpm --filter api build \
    && test -f apps/api/dist/main.js \
    && test -f apps/api/dist/database/seed.js


FROM node:24-bookworm-slim AS runner

WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

COPY --chown=node:node --from=builder /workspace/node_modules ./node_modules
COPY --chown=node:node --from=builder /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --chown=node:node --from=builder /workspace/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /workspace/apps/api/prisma ./apps/api/prisma
COPY --chown=node:node --from=builder /workspace/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --chown=node:node --from=builder /workspace/apps/api/package.json ./apps/api/package.json

WORKDIR /workspace/apps/api

USER node

EXPOSE 3001

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/prisma db seed && exec node dist/main.js"]