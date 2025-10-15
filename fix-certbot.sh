#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Fixing Certbot installation...${NC}"

# Remove old certbot
echo -e "${YELLOW}Removing old Certbot...${NC}"
sudo apt remove -y certbot
sudo apt autoremove -y

# Install certbot using snap (recommended method)
echo -e "${YELLOW}Installing Certbot via snap...${NC}"
sudo apt update
sudo apt install -y snapd
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot

# Create symlink
echo -e "${YELLOW}Creating certbot symlink...${NC}"
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Verify installation
echo -e "${YELLOW}Verifying Certbot installation...${NC}"
certbot --version

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certbot installed successfully!${NC}"
    echo -e "${GREEN}Now you can run: sudo sh ./deploy-ssl-complete.sh${NC}"
else
    echo -e "${RED}❌ Certbot installation failed${NC}"
    exit 1
fi

