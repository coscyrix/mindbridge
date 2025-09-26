# Multi-stage build for better optimization
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Verify node-cron installation
RUN npm list node-cron

# Copy source code
COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod +x /app/start.sh

# Switch to non-root user
USER nextjs

# Expose port (corrected from 3000 to 5000 based on server.js)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["./start.sh"] 