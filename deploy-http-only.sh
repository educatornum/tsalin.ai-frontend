#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Deploying with HTTP only...${NC}"

# Stop and remove old container
echo -e "${YELLOW}🛑 Stopping old container...${NC}"
sudo docker stop tsalin-frontend 2>/dev/null || true
sudo docker rm tsalin-frontend 2>/dev/null || true

# Make sure nginx.conf uses Docker bridge gateway
echo -e "${YELLOW}🔧 Verifying nginx.conf...${NC}"
if grep -q "172.17.0.1:3000" nginx.conf; then
    echo -e "${GREEN}✅ nginx.conf is correctly configured${NC}"
else
    echo -e "${RED}❌ nginx.conf needs to use 172.17.0.1:3000${NC}"
    echo -e "${YELLOW}Updating nginx.conf...${NC}"
    sed -i.bak 's|proxy_pass http://[^:]*:3000/api/|proxy_pass http://172.17.0.1:3000/api/|g' nginx.conf
fi

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

# Test backend connectivity from container
echo -e "${YELLOW}🔍 Testing backend connectivity:${NC}"
sudo docker exec tsalin-frontend wget -qO- http://172.17.0.1:3000 2>&1 | head -3

# Show status
echo -e "${YELLOW}📊 Container status:${NC}"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|tsalin"

