# Backend API Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package manifest files first (better layer caching)
COPY package*.json ./

# Set production environment and install dependencies (fallback to npm install to avoid ci lock issues)
ENV NODE_ENV=production
# Upgrade npm minor if desired (optional) then install production deps only
RUN npm install -g npm@10 && npm install --production --no-audit --no-fund

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Health check (align with docker-compose /health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
