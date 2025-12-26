#!/bin/sh

# Generate Prisma Client if not already generated
echo "🔧 Generating Prisma Client..."
npx prisma generate || {
  echo "⚠️  Warning: Prisma Client generation failed, continuing anyway..."
}

# Initialize uploads directory
echo "🔧 Initializing server..."
node init.js

# Start the server with proper signal handling
echo "🚀 Starting server..."
trap 'echo "Received signal, shutting down gracefully..."; exit 0' TERM INT
exec node app.js 