# NORTHORYA FORMS STUDIO - DOCKERFILE
FROM node:22-slim AS builder

WORKDIR /app

# Install dependencies (suporte nativo glibc para Vite/Rolldown)
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
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/assets ./src/assets 2>/dev/null || true

# Create persistent data volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
