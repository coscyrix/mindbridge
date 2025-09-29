# Docker Setup for MindBridge Server

This document provides instructions for running the MindBridge server application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for multi-container setup)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f server
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t mindbridge-server .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name mindbridge-server \
     -p 5000:5000 \
     --env-file "#Environment Configuration.env" \
     -v mindbridge-uploads:/app/uploads \
     mindbridge-server
   ```

## Environment Configuration

The application uses environment variables for configuration. Make sure to:

1. **Copy the environment file:**
   ```bash
   cp "#Environment Configuration.env" .env
   ```

2. **Update the environment variables** in the `.env` file with your specific values:
   - Database connection details
   - JWT secrets
   - Email configuration
   - SSL certificates (if using HTTPS)

## Available Dockerfiles

### Development (Dockerfile)
- Includes all dependencies
- Optimized for development
- Includes dev dependencies

### Production (Dockerfile.prod)
- Multi-stage build
- Only production dependencies
- Optimized for production deployment
- Smaller image size

## Docker Compose Services

### Server Service
- **Port:** 3001:5000 (development)
- **Environment:** Development
- **Health Check:** Available at `/health` endpoint

### Server Production Service
- **Port:** 3002:5000 (production)
- **Environment:** Production
- **Profile:** production (use `--profile production` to start)

### Client Service
- **Port:** 3000:3000
- **Depends on:** Server service
- **Health Check:** Available at `/api/hello` endpoint

## Volumes

- **uploads_data:** Persistent storage for uploaded files
- **logs:** Application logs (mounted to host)

## Health Checks

The application includes health checks that verify:
- Server is responding on port 5000
- Health endpoint is accessible
- Application is ready to accept requests

## Networking

All services are connected via the `mindbridge-network` bridge network, allowing:
- Inter-service communication
- Service discovery by name
- Isolated network environment

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :5000
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Database connection issues:**
   - Verify database credentials in environment file
   - Ensure database server is accessible
   - Check network connectivity

3. **File upload issues:**
   - Verify uploads directory permissions
   - Check volume mount configuration
   - Ensure sufficient disk space

### Logs and Debugging

1. **View application logs:**
   ```bash
   docker-compose logs -f server
   ```

2. **Access container shell:**
   ```bash
   docker-compose exec server sh
   ```

3. **Check container status:**
   ```bash
   docker-compose ps
   ```

## Production Deployment

For production deployment:

1. **Use production Dockerfile:**
   ```bash
   docker-compose --profile production up -d
   ```

2. **Set production environment variables:**
   - Update database credentials
   - Set secure JWT secrets
   - Configure SSL certificates
   - Set proper CORS origins

3. **Use external database:**
   - Configure external MySQL/PostgreSQL
   - Update connection strings
   - Ensure database is accessible

4. **Configure reverse proxy:**
   - Use Nginx or Apache
   - Set up SSL termination
   - Configure load balancing if needed

## Security Considerations

- The application runs as non-root user (`nodejs`)
- Uses `dumb-init` for proper signal handling
- Includes health checks for monitoring
- Volumes are properly mounted for data persistence
- Environment variables are used for sensitive configuration

## Monitoring

- Health checks are configured for all services
- Logs are available via Docker Compose
- Application includes Winston logging
- Error tracking and monitoring can be added

## Scaling

To scale the application:

1. **Horizontal scaling:**
   ```bash
   docker-compose up --scale server=3
   ```

2. **Load balancing:**
   - Use Nginx or HAProxy
   - Configure upstream servers
   - Set up health checks

3. **Database scaling:**
   - Use external database cluster
   - Configure read replicas
   - Set up connection pooling
