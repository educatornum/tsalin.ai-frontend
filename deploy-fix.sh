#!/bin/bash

# Configuration
IMAGE_NAME="tsalin-frontend"
CONTAINER_NAME="tsalin-frontend"
PORT=80

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment with port conflict fix...${NC}"

# Check if port 80 is in use
if sudo netstat -tlnp | grep :80 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 80 is already in use. Stopping conflicting services...${NC}"
    
    # Try to stop nginx
    sudo systemctl stop nginx 2>/dev/null || true
    sudo systemctl disable nginx 2>/dev/null || true
    
    # Kill any processes using port 80
    sudo fuser -k 80/tcp 2>/dev/null || true
    
    # Wait a moment
    sleep 2
    
    # Check again
    if sudo netstat -tlnp | grep :80 > /dev/null 2>&1; then
        echo -e "${RED}❌ Port 80 is still in use. Please manually stop the service using port 80.${NC}"
        echo -e "${YELLOW}Run: sudo netstat -tlnp | grep :80${NC}"
        echo -e "${YELLOW}Then: sudo kill -9 <PID>${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Port 80 is available!${NC}"

# Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Stop and remove existing container if it exists
echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Create/ensure network exists
NETWORK_NAME="tsalin-network"
if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    echo -e "${YELLOW}📡 Creating Docker network: $NETWORK_NAME${NC}"
    docker network create $NETWORK_NAME
fi

# Connect backend to network if not already connected
echo -e "${YELLOW}🔗 Connecting backend to network...${NC}"
docker network connect $NETWORK_NAME tsalin-api 2>/dev/null || echo "Backend already on network"

# Run new container
echo -e "${YELLOW}🚀 Starting new container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --network $NETWORK_NAME \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Container start failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running on http://localhost:$PORT${NC}"

# Show running containers
echo -e "${YELLOW}📋 Running containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
