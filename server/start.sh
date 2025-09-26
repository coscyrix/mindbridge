#!/bin/sh

# Initialize uploads directory
echo "🔧 Initializing server..."
node init.js

# Start the server with proper signal handling
echo "🚀 Starting server..."
trap 'echo "Received signal, shutting down gracefully..."; exit 0' TERM INT
exec node server.js 