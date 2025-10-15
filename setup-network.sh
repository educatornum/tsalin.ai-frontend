#!/bin/bash

# Create a custom network for frontend and backend to communicate
NETWORK_NAME="tsalin-network"

echo "🌐 Setting up Docker network..."

# Create network if it doesn't exist
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    echo "Creating network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
else
    echo "Network $NETWORK_NAME already exists"
fi

# Connect backend container to the network
echo "Connecting backend container (tsalin-api) to $NETWORK_NAME..."
docker network connect $NETWORK_NAME tsalin-api 2>/dev/null || echo "Backend already connected or not running"

echo "✅ Network setup complete!"
echo "Now run: ./deploy.sh"

