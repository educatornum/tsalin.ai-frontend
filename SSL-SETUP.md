# 🔒 SSL Setup Guide for beta.tsalin.ai

## 📋 Prerequisites
- ✅ DNS A record pointing to your server IP (35.198.155.219)
- ✅ Domain propagated (wait 30 minutes after DNS setup)
- ✅ Server accessible via HTTP on port 80

## 🚀 Step-by-Step SSL Setup

### 1. Connect to your server
```bash
ssh root@35.198.155.219
```

### 2. Stop the current frontend container
```bash
docker stop tsalin-frontend
```

### 3. Install Certbot
```bash
sudo apt update
sudo apt install -y certbot
```

### 4. Get SSL Certificate
```bash
sudo certbot certonly --standalone \
  -d beta.tsalin.ai \
  --email amartuvshin@tsalin.ai \
  --agree-tos \
  --no-eff-email
```

### 5. Update nginx configuration
```bash
# Copy the SSL config
cp nginx-ssl.conf nginx.conf
```

### 6. Redeploy with SSL
```bash
# Stop and remove old container
docker stop tsalin-frontend
docker rm tsalin-frontend

# Build new image with SSL config
docker build -t tsalin-frontend .

# Run with SSL certificates mounted
docker run -d \
  --name tsalin-frontend \
  -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  --restart unless-stopped \
  tsalin-frontend
```

### 7. Test SSL
```bash
# Check if certificate is valid
sudo certbot certificates

# Test HTTPS
curl -I https://beta.tsalin.ai
```

## 🔄 Auto-renewal Setup

### 1. Test renewal
```bash
sudo certbot renew --dry-run
```

### 2. Add to crontab for auto-renewal
```bash
sudo crontab -e
```

Add this line:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 Troubleshooting

### If certificate fails:
1. Check DNS propagation:
   ```bash
   nslookup beta.tsalin.ai
   ```

2. Check if port 80 is open:
   ```bash
   sudo netstat -tlnp | grep :80
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 80
   sudo ufw allow 443
   ```

### If nginx fails to start:
1. Check SSL certificate paths:
   ```bash
   sudo ls -la /etc/letsencrypt/live/beta.tsalin.ai/
   ```

2. Check nginx config:
   ```bash
   sudo nginx -t
   ```

## ✅ Expected Results

After successful setup:
- 🌐 `https://beta.tsalin.ai` - Should work with green lock
- 🔄 `http://beta.tsalin.ai` - Should redirect to HTTPS
- 📱 Mobile browsers should show secure connection

## 🔧 Manual Commands (if script fails)

If the automated script doesn't work, run these commands manually:

```bash
# 1. Stop containers
docker stop tsalin-frontend tsalin-api

# 2. Get certificate
sudo certbot certonly --standalone -d beta.tsalin.ai --email amartuvshin@tsalin.ai --agree-tos --no-eff-email

# 3. Update nginx config
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name beta.tsalin.ai;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name beta.tsalin.ai;
    root /usr/share/nginx/html;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/beta.tsalin.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beta.tsalin.ai/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://tsalin-api:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# 4. Rebuild and restart
docker build -t tsalin-frontend .
docker run -d --name tsalin-frontend -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro --network tsalin-network --restart unless-stopped tsalin-frontend
docker start tsalin-api
```

## 📞 Support

If you encounter issues:
1. Check server logs: `docker logs tsalin-frontend`
2. Check nginx logs: `docker exec tsalin-frontend tail -f /var/log/nginx/error.log`
3. Verify DNS: `dig beta.tsalin.ai`
