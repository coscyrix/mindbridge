# MindBridge Docker Setup

This document describes the Docker configuration for the MindBridge application, which consists of a Node.js server and a Next.js client.

## Overview

The application is containerized using Docker with the following components:
- **Server**: Node.js Express API server (port 5000)
- **Client**: Next.js frontend application (port 3000)
- **Database**: MySQL (external)

## Docker Files

### Server Dockerfile
- **Location**: `server/Dockerfile`
- **Base Image**: Node.js 18 Alpine
- **Port**: 5000
- **Features**:
  - Multi-stage build for optimization
  - Non-root user for security
  - System dependencies for Puppeteer
  - Health checks
  - Proper file permissions

### Server Production Dockerfile
- **Location**: `server/Dockerfile.prod`
- **Features**:
  - Optimized for production
  - Smaller image size
  - Only production dependencies
  - Enhanced security

### Client Dockerfile
- **Location**: `client/Dockerfile`
- **Base Image**: Node.js 18 Alpine
- **Port**: 3000
- **Features**:
  - Multi-stage build
  - Next.js standalone output
  - Optimized for production

## Docker Compose Configuration

### Development Setup
```bash
# Start development environment
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Setup
```bash
# Start production environment
docker-compose --profile production up

# Start in background
docker-compose --profile production up -d
```

## Services

### Server Service
- **Container Name**: mindbridge-server
- **Port Mapping**: 3001:5000
- **Environment**: Development
- **Health Check**: `/health` endpoint

### Server Production Service
- **Container Name**: mindbridge-server-prod
- **Port Mapping**: 3002:5000
- **Environment**: Production
- **Profile**: production

### Client Service
- **Container Name**: mindbridge-client
- **Port Mapping**: 3000:3000
- **Dependencies**: Server service
- **Health Check**: `/api/hello` endpoint

## Environment Configuration

The server uses environment variables from `server/#Environment Configuration.env`:
- Database configuration
- JWT settings
- Email configuration
- CORS settings

## Volumes

- **uploads_data**: Persistent storage for file uploads

## Networks

- **mindbridge-network**: Bridge network for inter-service communication

## Health Checks

Both server and client services include health checks:
- **Server**: Checks `/health` endpoint
- **Client**: Checks `/api/hello` endpoint
- **Interval**: 30 seconds
- **Timeout**: 3-10 seconds
- **Retries**: 3

## Recent Improvements

### Dockerfile Updates
1. **Corrected Port**: Changed from 3000 to 5000 to match server configuration
2. **System Dependencies**: Added Chromium and related packages for Puppeteer
3. **Security**: Improved user permissions and non-root user setup
4. **Health Checks**: Updated to use correct port
5. **Multi-stage Build**: Added production-optimized Dockerfile

### Docker Compose Updates
1. **Production Profile**: Added separate production service
2. **Port Configuration**: Ensured consistent port mapping
3. **Health Checks**: Improved health check configurations

## Building and Running

### Development
```bash
# Build and start all services
docker-compose up --build

# Build specific service
docker-compose build server
docker-compose build client
```

### Production
```bash
# Build and start production services
docker-compose --profile production up --build

# Build production server
docker-compose --profile production build server-prod
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 3001, and 3002 are available
2. **Permission Issues**: Check file permissions in uploads directory
3. **Health Check Failures**: Verify services are running and accessible
4. **Environment Variables**: Ensure `.env` file is properly configured

### Debugging

```bash
# View service logs
docker-compose logs server
docker-compose logs client

# Access container shell
docker-compose exec server sh
docker-compose exec client sh

# Check container status
docker-compose ps
```

## Security Considerations

1. **Non-root User**: All containers run as non-root users
2. **File Permissions**: Proper permissions set on uploads directory
3. **Network Isolation**: Services communicate through internal network
4. **Environment Variables**: Sensitive data managed through env files

## Performance Optimization

1. **Multi-stage Builds**: Reduces final image size
2. **Alpine Linux**: Lightweight base images
3. **Production Dependencies**: Only necessary packages in production
4. **Health Checks**: Automatic service monitoring

## Monitoring

- Health checks run every 30 seconds
- Logs are available through Docker Compose
- Services restart automatically unless stopped manually 