#!/bin/sh

# Docker entrypoint script for MindBridge Server

set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Wait for database to be ready (if using external database)
wait_for_db() {
    if [ -n "$MYSQL_URL" ] && [ -n "$MYSQL_PORT" ]; then
        log "Waiting for database to be ready..."
        until nc -z "$MYSQL_URL" "$MYSQL_PORT"; do
            log "Database is unavailable - sleeping"
            sleep 2
        done
        log "Database is ready!"
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p uploads logs
    chown -R nodejs:nodejs /app/uploads /app/logs
}

# Run database migrations (if needed)
run_migrations() {
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        log "Running database migrations..."
        # Add migration commands here if needed
        # node scripts/migrate.js
    fi
}

# Main execution
main() {
    log "Starting MindBridge Server..."
    
    # Wait for database if configured
    wait_for_db
    
    # Create directories
    create_directories
    
    # Run migrations if needed
    run_migrations
    
    # Start the application
    log "Starting Node.js application..."
    exec "$@"
}

# Run main function with all arguments
main "$@"
