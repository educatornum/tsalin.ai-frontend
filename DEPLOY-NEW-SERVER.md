# 🚀 Deploy to New Server (34.107.5.242)

## ✅ Pre-requisites

1. **Update DNS A Record on GoDaddy:**
   - Go to GoDaddy DNS settings for `tsalin.ai`
   - Update the A record for `beta.tsalin.ai` to point to: `34.107.5.242`
   - Wait 5-10 minutes for DNS propagation

2. **Make sure backend is running:**
   ```bash
   sudo docker ps | grep tsalin-api
   # Should show tsalin-api running on port 3000
   ```

## 🎯 Deployment Steps

### Step 1: Upload files to server
```bash
# From your local machine, upload these files to the server:
scp nginx-fix.conf deploy-ssl-complete.sh your-user@34.107.5.242:~/
```

Or if you're already on the server, just make sure you have:
- `nginx-fix.conf`
- `deploy-ssl-complete.sh`

### Step 2: Run the SSL deployment script
```bash
# On the server:
chmod +x deploy-ssl-complete.sh
sudo sh ./deploy-ssl-complete.sh
```

This script will:
1. ✅ Fix nginx config (use server IP for API proxy)
2. ✅ Install Certbot
3. ✅ Stop all containers on port 80
4. ✅ Build Docker image
5. ✅ Get SSL certificate for beta.tsalin.ai
6. ✅ Deploy with HTTPS
7. ✅ Setup auto-renewal

## 🔍 Troubleshooting

### If SSL certificate fails:

**Check DNS first:**
```bash
nslookup beta.tsalin.ai
# Should return: 34.107.5.242
```

**Check if port 80 is accessible:**
```bash
# On server:
sudo netstat -tuln | grep ':80 '

# From another machine:
telnet 34.107.5.242 80
```

**Check firewall rules:**
```bash
# Make sure ports 80 and 443 are open
sudo ufw status
# or
sudo iptables -L -n | grep -E '80|443'
```

### If SSL fails but you need the site up:

The script will automatically deploy HTTP-only version if SSL fails.
You can access it at: `http://beta.tsalin.ai` or `http://34.107.5.242`

## 🎉 Success Indicators

After successful deployment, you should see:
```
✅ SSL deployment successful!
🌐 Application is running on:
   HTTP:  http://beta.tsalin.ai (redirects to HTTPS)
   HTTPS: https://beta.tsalin.ai
```

## 📋 Verify Deployment

1. **Check containers:**
   ```bash
   sudo docker ps
   # Should show tsalin-frontend on ports 80 and 443
   ```

2. **Check logs:**
   ```bash
   sudo docker logs tsalin-frontend
   # Should NOT show any errors
   ```

3. **Test the site:**
   - Open browser: `https://beta.tsalin.ai`
   - Check if HTTPS works (green lock icon)
   - Test API calls (salary posts should load)

## 🔐 SSL Certificate Info

View certificate details:
```bash
sudo certbot certificates
```

Renew manually (if needed):
```bash
sudo certbot renew
sudo docker restart tsalin-frontend
```

Auto-renewal is configured via cron job (runs daily at 12 PM).

## 🆘 Emergency Rollback

If something goes wrong:
```bash
# Stop the new container
sudo docker stop tsalin-frontend
sudo docker rm tsalin-frontend

# Deploy with HTTP only
cp nginx-fix.conf nginx.conf
sudo docker build -t tsalin-frontend .
sudo docker run -d --name tsalin-frontend -p 80:80 --restart unless-stopped tsalin-frontend
```

