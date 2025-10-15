#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Redeploying frontend...${NC}"

# Stop and remove old container
echo -e "${YELLOW}🛑 Stopping old container...${NC}"
sudo docker stop tsalin-frontend 2>/dev/null || true
sudo docker rm tsalin-frontend 2>/dev/null || true

# Build new image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
sudo docker build -t tsalin-frontend .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Run new container
echo -e "${YELLOW}🚀 Starting container...${NC}"
sudo docker run -d \
    --name tsalin-frontend \
    -p 80:80 \
    --restart unless-stopped \
    tsalin-frontend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Container start failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running on:${NC}"
echo -e "${GREEN}   http://beta.tsalin.ai${NC}"
echo -e "${GREEN}   http://34.107.5.242${NC}"

# Show logs
echo -e "${YELLOW}📋 Container logs:${NC}"
sudo docker logs --tail 20 tsalin-frontend

# Show status
echo -e "${YELLOW}📊 Container status:${NC}"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|tsalin"

