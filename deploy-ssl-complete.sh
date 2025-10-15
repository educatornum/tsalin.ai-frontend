#!/bin/bash

# Configuration
IMAGE_NAME="tsalin-frontend"
CONTAINER_NAME="tsalin-frontend"
DOMAIN="beta.tsalin.ai"
EMAIL="bayar@lambda.global"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting SSL deployment for $DOMAIN...${NC}"

# Step 1: Fix nginx config first
echo -e "${YELLOW}🔧 Fixing nginx configuration...${NC}"
cp nginx-fix.conf nginx.conf

# Step 2: Install Certbot if not installed
echo -e "${YELLOW}📦 Checking Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot via snap...${NC}"
    sudo apt update
    sudo apt install -y snapd
    sudo snap install core
    sudo snap refresh core
    sudo snap install --classic certbot
    sudo ln -sf /snap/bin/certbot /usr/bin/certbot
fi
certbot --version

# Step 3: Stop ALL containers using port 80
echo -e "${YELLOW}🛑 Stopping all containers on port 80...${NC}"
sudo docker ps -q --filter "publish=80" | xargs -r sudo docker stop
sudo docker ps -aq --filter "publish=80" | xargs -r sudo docker rm
sudo docker stop $CONTAINER_NAME 2>/dev/null || true
sudo docker rm $CONTAINER_NAME 2>/dev/null || true

# Wait a moment for ports to free up
sleep 2

# Verify port 80 is free
echo -e "${YELLOW}🔍 Checking if port 80 is free...${NC}"
if sudo netstat -tuln | grep ':80 ' > /dev/null; then
    echo -e "${RED}❌ Port 80 is still in use!${NC}"
    echo -e "${YELLOW}Processes using port 80:${NC}"
    sudo netstat -tuln | grep ':80 '
    exit 1
fi

echo -e "${GREEN}✅ Port 80 is free!${NC}"

# Step 4: Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
sudo docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 5: Get SSL certificate
echo -e "${YELLOW}🔒 Getting SSL certificate for $DOMAIN...${NC}"
sudo certbot certonly --standalone \
  -d $DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --non-interactive

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ SSL certificate failed!${NC}"
    echo -e "${YELLOW}Make sure:${NC}"
    echo -e "${YELLOW}1. DNS A record points to this server (34.107.5.242)${NC}"
    echo -e "${YELLOW}2. Port 80 is accessible from the internet${NC}"
    echo -e "${YELLOW}3. Domain beta.tsalin.ai resolves correctly${NC}"
    echo -e "${YELLOW}${NC}"
    echo -e "${YELLOW}Check DNS:${NC}"
    nslookup $DOMAIN
    echo -e "${YELLOW}${NC}"
    echo -e "${YELLOW}Deploying without SSL for now...${NC}"
    
    # Deploy without SSL
    sudo docker run -d \
        --name $CONTAINER_NAME \
        -p 80:80 \
        --restart unless-stopped \
        $IMAGE_NAME
    
    echo -e "${YELLOW}⚠️  Site is running on HTTP only${NC}"
    echo -e "${YELLOW}   http://$DOMAIN${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SSL certificate obtained!${NC}"

# Step 6: Update nginx config for SSL
echo -e "${YELLOW}🔧 Creating SSL nginx configuration...${NC}"
cat > nginx.conf << 'EOF'
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name beta.tsalin.ai 34.107.5.242;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name beta.tsalin.ai 34.107.5.242;
    root /usr/share/nginx/html;
    index index.html;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/beta.tsalin.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beta.tsalin.ai/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Proxy API requests to backend using server IP
    location /api/ {
        proxy_pass http://34.107.5.242:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for slow backend
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Handle client-side routing for frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# Step 7: Rebuild with SSL config
echo -e "${YELLOW}📦 Rebuilding with SSL configuration...${NC}"
sudo docker build -t $IMAGE_NAME .

# Step 8: Run container with SSL
echo -e "${YELLOW}🚀 Starting container with SSL...${NC}"
sudo docker run -d \
    --name $CONTAINER_NAME \
    -p 80:80 \
    -p 443:443 \
    -v /etc/letsencrypt:/etc/letsencrypt:ro \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Container start failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SSL deployment successful!${NC}"
echo -e "${GREEN}🌐 Application is running on:${NC}"
echo -e "${GREEN}   HTTP:  http://$DOMAIN (redirects to HTTPS)${NC}"
echo -e "${GREEN}   HTTPS: https://$DOMAIN${NC}"

# Step 9: Setup auto-renewal
echo -e "${YELLOW}🔄 Setting up SSL auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker restart $CONTAINER_NAME") | crontab -

echo -e "${GREEN}✅ SSL auto-renewal configured!${NC}"

# Show status
echo -e "${YELLOW}📋 Container status:${NC}"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "${YELLOW}🔒 SSL certificate info:${NC}"
sudo certbot certificates
