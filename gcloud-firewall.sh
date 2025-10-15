#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Creating Google Cloud Firewall Rule...${NC}"
echo ""

# Create firewall rule to allow HTTP and HTTPS
gcloud compute firewall-rules create allow-http-https \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP and HTTPS traffic" \
    --direction INGRESS

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firewall rule created successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Listing firewall rules:${NC}"
    gcloud compute firewall-rules list --filter="name=allow-http-https"
    echo ""
    echo -e "${GREEN}Now you can run: sudo sh ./deploy-ssl-complete.sh${NC}"
else
    echo -e "${RED}❌ Failed to create firewall rule${NC}"
    echo -e "${YELLOW}You may need to create it manually in the console${NC}"
    echo -e "${YELLOW}Or the rule may already exist${NC}"
    echo ""
    echo -e "${YELLOW}Check existing rules:${NC}"
    gcloud compute firewall-rules list | grep -E 'http|443|80'
fi

