#!/bin/bash
# Production Start Script

echo "Starting SACCO Management System..."

# Load environment variables
source .env

# Start with PM2 if available, otherwise use node
if command -v pm2 &> /dev/null; then
    echo "Starting with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
else
    echo "Starting with node..."
    node server.js
fi

