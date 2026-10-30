# NORTHORYA FORMS STUDIO - DOCKERFILE
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server 2>/dev/null || true
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/assets ./src/assets

# Create persistent data volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
