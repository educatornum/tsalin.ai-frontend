#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Creating Google Cloud Firewall Rules...${NC}"
echo ""

# 1. Allow SSH (port 22)
echo -e "${YELLOW}Creating SSH firewall rule...${NC}"
gcloud compute firewall-rules create allow-ssh \
    --allow tcp:22 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow SSH access" \
    --direction INGRESS 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSH firewall rule created${NC}"
else
    echo -e "${YELLOW}⚠️  SSH rule may already exist${NC}"
fi
echo ""

# 2. Allow HTTP and HTTPS (ports 80, 443)
echo -e "${YELLOW}Creating HTTP/HTTPS firewall rule...${NC}"
gcloud compute firewall-rules create allow-http-https \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP and HTTPS traffic" \
    --direction INGRESS 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ HTTP/HTTPS firewall rule created${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP/HTTPS rule may already exist${NC}"
fi
echo ""

# 3. Allow backend port 3000 (optional, for direct API access)
echo -e "${YELLOW}Creating backend API firewall rule (port 3000)...${NC}"
gcloud compute firewall-rules create allow-backend-api \
    --allow tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow backend API access" \
    --direction INGRESS 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend API firewall rule created${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API rule may already exist${NC}"
fi
echo ""

# List all firewall rules
echo -e "${YELLOW}📋 Current firewall rules:${NC}"
gcloud compute firewall-rules list --format="table(name,allowed[].map().firewall_rule().list():label=ALLOW,sourceRanges.list():label=SRC_RANGES)"

echo ""
echo -e "${GREEN}✅ Firewall configuration complete!${NC}"
echo -e "${GREEN}You can now:${NC}"
echo -e "${GREEN}  - SSH to the server: ssh user@34.107.5.242${NC}"
echo -e "${GREEN}  - Access HTTP: http://beta.tsalin.ai${NC}"
echo -e "${GREEN}  - Run SSL deployment: sudo sh ./deploy-ssl-complete.sh${NC}"

