# Multi-stage build for production deployment
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm ci --only=production && npm cache clean --force
RUN cd client && npm ci --only=production && npm cache clean --force

# Build the frontend
FROM base AS frontend-builder
WORKDIR /app
COPY client/ ./client/
COPY --from=deps /app/client/node_modules ./client/node_modules

# Build frontend
RUN cd client && npm run build

# Production image for backend
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy backend files
COPY server/ ./server/
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy built frontend (optional, for serving static files)
COPY --from=frontend-builder /app/client/dist ./server/public

# Create necessary directories
RUN mkdir -p ./server/sessions ./server/uploads ./server/logs
RUN chown -R nodejs:nodejs ./server

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server/src/index.js"]
