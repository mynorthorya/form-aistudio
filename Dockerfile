# NORTHORYA FORMS STUDIO - DOCKERFILE
# Using Debian slim for full glibc compatibility with native bindings (Vite/Rolldown/esbuild)
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies (supports glibc native bindings without npm musl bugs)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production Runner
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

# Copy built application and required runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src

# Create persistent data volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]

