#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Checking firewall and network configuration...${NC}"
echo ""

# Check if port 80 is listening
echo -e "${YELLOW}1. Checking if port 80 is listening:${NC}"
sudo netstat -tuln | grep ':80 ' || echo "Port 80 is NOT listening"
echo ""

# Check UFW firewall
echo -e "${YELLOW}2. Checking UFW firewall:${NC}"
sudo ufw status
echo ""

# Check iptables
echo -e "${YELLOW}3. Checking iptables:${NC}"
sudo iptables -L -n | grep -E '80|443' || echo "No rules for ports 80/443"
echo ""

# Check if we can access port 80 locally
echo -e "${YELLOW}4. Testing local access to port 80:${NC}"
curl -I http://localhost 2>&1 | head -3
echo ""

# Check DNS resolution
echo -e "${YELLOW}5. Checking DNS resolution:${NC}"
if command -v dig &> /dev/null; then
    dig +short beta.tsalin.ai
else
    host beta.tsalin.ai | grep 'has address'
fi
echo ""

echo -e "${YELLOW}📋 Summary:${NC}"
echo -e "${YELLOW}For Google Cloud, you need to:${NC}"
echo -e "${YELLOW}1. Go to: https://console.cloud.google.com/networking/firewalls${NC}"
echo -e "${YELLOW}2. Create/Edit firewall rule to allow TCP ports 80 and 443${NC}"
echo -e "${YELLOW}3. Apply to this VM instance${NC}"

