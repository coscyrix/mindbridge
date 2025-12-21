# Multi-stage build for better optimization
FROM node:18-slim AS base

# Install system dependencies for Puppeteer and Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install all dependencies as root first
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create a non-root user
RUN groupadd -r nodejs -g 1001 && \
    useradd -r -g nodejs -u 1001 -s /bin/bash nextjs

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && \
    chown -R nextjs:nodejs /app && \
    chmod 755 /app/uploads && \
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