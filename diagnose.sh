#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Diagnosing the issue...${NC}"
echo ""

# 1. Check if Docker containers are running
echo -e "${YELLOW}1. Docker containers:${NC}"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Check if port 80 is listening
echo -e "${YELLOW}2. Port 80 status:${NC}"
sudo netstat -tuln | grep ':80 ' || echo "Port 80 is NOT listening"
echo ""

# 3. Test localhost
echo -e "${YELLOW}3. Testing localhost:${NC}"
curl -I http://localhost 2>&1 | head -5
echo ""

# 4. Check nginx logs
echo -e "${YELLOW}4. Nginx container logs (last 20 lines):${NC}"
sudo docker logs --tail 20 tsalin-frontend 2>&1
echo ""

# 5. Check if tsalin-frontend container is running
echo -e "${YELLOW}5. Container details:${NC}"
sudo docker inspect tsalin-frontend --format='{{.State.Status}}: {{.State.Error}}' 2>&1
echo ""

# 6. List firewall rules
echo -e "${YELLOW}6. Google Cloud firewall rules:${NC}"
if command -v gcloud &> /dev/null; then
    gcloud compute firewall-rules list --format="table(name,allowed[].map().firewall_rule().list():label=ALLOW)" 2>&1 | grep -E 'NAME|80|443|default-allow'
else
    echo "gcloud not installed - check manually at: https://console.cloud.google.com/networking/firewalls/list"
fi
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "1. If container is running but localhost fails → nginx config issue"
echo -e "2. If localhost works but external fails → firewall issue"
echo -e "3. If container is not running → check docker logs"

