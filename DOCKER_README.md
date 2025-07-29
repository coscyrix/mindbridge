# MindBridge Docker Setup

This document provides instructions for running the MindBridge application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Project Structure

```
mindbridge/
├── client/          # Next.js frontend application
├── server/          # Node.js backend API
├── docker-compose.yml
└── DOCKER_README.md
```

## Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd mindbridge
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - Frontend (Next.js): http://localhost:3000
   - Backend API: http://localhost:3001

## Individual Service Commands

### Build and run server only:
```bash
docker-compose up --build server
```

### Build and run client only:
```bash
docker-compose up --build client
```

### Run in detached mode:
```bash
docker-compose up -d --build
```

### Stop all services:
```bash
docker-compose down
```

### View logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs server
docker-compose logs client
```

## Development Mode

For development, you can run the services individually:

### Server Development:
```bash
cd server
npm install
npm run dev
```

### Client Development:
```bash
cd client
npm install
npm run dev
```

## Environment Configuration

The server uses environment variables from `server/#Environment Configuration.env`. Make sure this file exists and contains the necessary configuration.

## Docker Images

### Server Image
- **Base**: Node.js 18 Alpine
- **Port**: 3000 (mapped to 3001 on host)
- **Health Check**: HTTP endpoint at `/health`

### Client Image
- **Base**: Node.js 18 Alpine
- **Port**: 3000
- **Build**: Multi-stage build with standalone output
- **Health Check**: HTTP endpoint at `/api/hello`

## Volume Mounts

- `./uploads` is mounted to `/app/uploads` in the server container for file storage

## Network

Both services communicate through a custom bridge network `mindbridge-network`.

## Troubleshooting

### Common Issues:

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Environment variables**: Ensure the environment file exists in the server directory
3. **Build failures**: Check that all dependencies are properly listed in package.json files

### Debug Commands:

```bash
# Check container status
docker-compose ps

# Execute commands in running containers
docker-compose exec server sh
docker-compose exec client sh

# View resource usage
docker stats
```

## Production Deployment

For production deployment, consider:

1. Using environment-specific docker-compose files
2. Setting up proper logging and monitoring
3. Configuring reverse proxy (nginx)
4. Setting up SSL certificates
5. Implementing proper backup strategies

## Cleanup

To remove all containers, networks, and volumes:
```bash
docker-compose down -v --rmi all
```

## Security Notes

- Both containers run as non-root users
- Health checks are implemented for monitoring
- Environment variables are properly isolated
- File permissions are set correctly 