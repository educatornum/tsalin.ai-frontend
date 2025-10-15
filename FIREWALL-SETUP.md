# 🔒 Firewall & Security Setup

## Current Architecture (Secure)

```
Internet → Port 80 (nginx) → Proxies to → localhost:3000 (backend)
          ✅ Public          🔒 Internal   ✅ Not exposed
```

## 🛡️ Block Port 3000 from Public Access

Your backend should ONLY be accessible from localhost, not from the internet.

### On Ubuntu/Debian (UFW):

```bash
# Install UFW if not installed
sudo apt install ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL)
sudo ufw allow 443/tcp

# Block port 3000 from external access (only allow from localhost)
sudo ufw deny 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Using iptables (Alternative):

```bash
# Allow port 80
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow port 443
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Block port 3000 from external access
sudo iptables -A INPUT -p tcp --dport 3000 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j DROP

# Save rules
sudo netfilter-persistent save
```

### Using Google Cloud Platform (GCP):

If your server is on GCP, configure firewall rules:

1. Go to **VPC Network** → **Firewall rules**
2. Create new rule:
   - **Name:** `block-backend-port`
   - **Target:** All instances
   - **Source:** `0.0.0.0/0`
   - **Protocols and ports:** `tcp:3000`
   - **Action:** **Deny**
3. Ensure you have allow rules for:
   - `tcp:80` (HTTP)
   - `tcp:443` (HTTPS)
   - `tcp:22` (SSH)

## 🧪 Test Backend Security

```bash
# From outside the server (should FAIL):
curl http://35.198.155.219:3000/api/positions
# Expected: Connection refused or timeout

# From inside the server (should WORK):
ssh user@35.198.155.219
curl http://localhost:3000/api/positions
# Expected: {"success":true, ...}
```

## ✅ Benefits

1. **🔒 Backend protected** - Not exposed to internet
2. **🚀 Single entry point** - All traffic through nginx
3. **📊 Better logging** - All requests logged by nginx
4. **🛡️ CORS simplified** - Backend only needs to allow localhost
5. **🔐 Ready for SSL** - Easy to add HTTPS later

## 📝 Update Backend CORS

Your backend should now only allow requests from localhost:

```javascript
// In your backend (e.g., Express)
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'http://localhost:80'],
  credentials: true
}));
```

## 🚀 Deploy

```bash
cd tsalin.ai-frontend
git pull
./deploy.sh
```

Now all API calls go through nginx:
- Frontend: `https://beta.tsalin.ai`
- API: `https://beta.tsalin.ai/api/*` → proxied to `localhost:3000`

