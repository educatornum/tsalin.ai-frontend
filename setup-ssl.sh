#!/bin/bash

# Setup SSL with Let's Encrypt for tsalin.ai
# Run this AFTER DNS has propagated (wait 30 minutes after setting up DNS)

DOMAIN="tsalin.ai"
WWW_DOMAIN="www.tsalin.ai"
EMAIL="your-email@example.com"  # Change this to your email

echo "🔒 Setting up SSL for $DOMAIN and $WWW_DOMAIN"

# Install certbot
sudo apt update
sudo apt install -y certbot

# Stop Docker container temporarily
docker stop tsalin-frontend

# Get SSL certificate
sudo certbot certonly --standalone \
  -d $DOMAIN \
  -d $WWW_DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email

# Create nginx SSL config
cat > nginx-ssl.conf << 'EOF'
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name tsalin.ai www.tsalin.ai;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name tsalin.ai www.tsalin.ai;
    root /usr/share/nginx/html;
    index index.html;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/tsalin.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tsalin.ai/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Handle client-side routing
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

echo "✅ SSL certificate obtained!"
echo "📝 Created nginx-ssl.conf"
echo ""
echo "Next steps:"
echo "1. Copy nginx-ssl.conf to your project: cp nginx-ssl.conf nginx.conf"
echo "2. Redeploy: ./deploy.sh"
echo "3. Mount SSL certificates in Docker:"
echo ""
echo "   docker run -d \\"
echo "     --name tsalin-frontend \\"
echo "     -p 80:80 -p 443:443 \\"
echo "     -v /etc/letsencrypt:/etc/letsencrypt:ro \\"
echo "     --restart unless-stopped \\"
echo "     tsalin-frontend"

