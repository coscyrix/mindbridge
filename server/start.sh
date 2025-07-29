#!/bin/sh

# Initialize uploads directory
echo "🔧 Initializing server..."
node init.js

# Start the server
echo "🚀 Starting server..."
exec node app.js 