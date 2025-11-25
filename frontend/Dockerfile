# Frontend Dockerfile
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Accept API base URL at build-time and expose to build environment
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Install dependencies (use npm install to avoid ci lock issues on server)
RUN npm install -g npm@10 && npm install --no-audit --no-fund

# Copy application files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-config.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
