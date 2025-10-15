#!/bin/bash

# Configuration
IMAGE_NAME="tsalin-frontend"
CONTAINER_NAME="tsalin-frontend"
HTTP_PORT=80
HTTPS_PORT=443

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment with SSL...${NC}"

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

# Run new container with SSL
echo -e "${YELLOW}🚀 Starting new container with SSL...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $HTTP_PORT:80 \
    -p $HTTPS_PORT:443 \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Container start failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running on:${NC}"
echo -e "${GREEN}   HTTP:  http://beta.tsalin.ai${NC}"
echo -e "${GREEN}   HTTPS: https://beta.tsalin.ai${NC}"

