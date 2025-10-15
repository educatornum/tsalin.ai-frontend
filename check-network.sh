#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Checking Docker network configuration...${NC}"
echo ""

# 1. List all containers
echo -e "${YELLOW}1. Docker containers:${NC}"
sudo docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Check tsalin-frontend network
echo -e "${YELLOW}2. tsalin-frontend network:${NC}"
sudo docker inspect tsalin-frontend --format='{{range .NetworkSettings.Networks}}{{.NetworkMode}} - {{.IPAddress}}{{end}}' 2>/dev/null || echo "Container not found"
echo ""

# 3. Check tsalin-api network
echo -e "${YELLOW}3. tsalin-api network:${NC}"
sudo docker inspect tsalin-api --format='{{range .NetworkSettings.Networks}}{{.NetworkMode}} - {{.IPAddress}}{{end}}' 2>/dev/null || echo "Container not found"
echo ""

# 4. List all networks
echo -e "${YELLOW}4. Docker networks:${NC}"
sudo docker network ls
echo ""

# 5. Test if frontend can reach backend via container name
echo -e "${YELLOW}5. Testing connectivity from frontend to backend:${NC}"
echo -e "${YELLOW}   Testing: wget http://tsalin-api:3000${NC}"
sudo docker exec tsalin-frontend wget -qO- http://tsalin-api:3000 2>&1 | head -5 || echo "Cannot resolve tsalin-api"
echo ""

# 6. Test if frontend can reach backend via IP
echo -e "${YELLOW}6. Testing connectivity to backend IP:${NC}"
echo -e "${YELLOW}   Testing: wget http://34.107.5.242:3000${NC}"
sudo docker exec tsalin-frontend wget -qO- http://34.107.5.242:3000 2>&1 | head -5 || echo "Cannot reach backend IP"
echo ""

# 7. Check nginx config in container
echo -e "${YELLOW}7. Nginx config in container (proxy_pass line):${NC}"
sudo docker exec tsalin-frontend grep -A2 "location /api/" /etc/nginx/conf.d/default.conf || echo "Config not found"
echo ""

echo -e "${YELLOW}📋 Summary:${NC}"
echo -e "${YELLOW}If containers are on different networks, you need to:${NC}"
echo -e "${YELLOW}1. Create a shared network: docker network create tsalin-network${NC}"
echo -e "${YELLOW}2. Connect both containers to it${NC}"
echo -e "${YELLOW}OR${NC}"
echo -e "${YELLOW}Use server IP (34.107.5.242:3000) in nginx config instead of tsalin-api:3000${NC}"

