#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Opening ports 80 and 443 for HTTP/HTTPS...${NC}"
echo ""

# Check if UFW is active
if sudo ufw status | grep -q "Status: active"; then
    echo -e "${YELLOW}UFW is active, adding rules...${NC}"
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw reload
    echo -e "${GREEN}✅ UFW rules added${NC}"
else
    echo -e "${YELLOW}UFW is not active${NC}"
fi

# Also add iptables rules as backup
echo -e "${YELLOW}Adding iptables rules...${NC}"
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT

# Save iptables rules
if command -v iptables-save &> /dev/null; then
    sudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null
fi

echo -e "${GREEN}✅ Local firewall rules added${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT: Google Cloud Firewall${NC}"
echo -e "${YELLOW}You also need to configure Google Cloud firewall rules:${NC}"
echo ""
echo -e "${GREEN}Option 1: Using gcloud command (if gcloud is installed):${NC}"
echo -e "${YELLOW}gcloud compute firewall-rules create allow-http-https --allow tcp:80,tcp:443 --source-ranges 0.0.0.0/0${NC}"
echo ""
echo -e "${GREEN}Option 2: Using Google Cloud Console:${NC}"
echo -e "${YELLOW}1. Go to: https://console.cloud.google.com/networking/firewalls/list${NC}"
echo -e "${YELLOW}2. Click 'CREATE FIREWALL RULE'${NC}"
echo -e "${YELLOW}3. Name: allow-http-https${NC}"
echo -e "${YELLOW}4. Direction: Ingress${NC}"
echo -e "${YELLOW}5. Targets: All instances in the network (or specific tags)${NC}"
echo -e "${YELLOW}6. Source IP ranges: 0.0.0.0/0${NC}"
echo -e "${YELLOW}7. Protocols and ports: tcp:80,443${NC}"
echo -e "${YELLOW}8. Click CREATE${NC}"
echo ""

# Test if ports are now accessible locally
echo -e "${YELLOW}Testing local port access...${NC}"
if curl -I http://localhost 2>&1 | head -1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Port 80 is accessible locally${NC}"
else
    echo -e "${RED}❌ Port 80 is NOT accessible locally${NC}"
fi

