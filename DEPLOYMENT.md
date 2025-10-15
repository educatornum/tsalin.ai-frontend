# 🚀 Deployment Guide

This guide will help you deploy the Tsalin.ai frontend to your server.

## Prerequisites

- Docker installed on your server
- SSH access to your server
- Git installed

## 🐳 Method 1: Deploy to Server (Recommended)

### Step 1: Connect to your server
```bash
ssh user@SERVER_IP
```

### Step 2: Clone the repository
```bash
git clone <your-repo-url>
cd tsalin.ai-frontend
```

### Step 3: Run the deployment script
```bash
./deploy.sh
```

That's it! The application will be available at `http://SERVER_IP`

## 🛠️ Method 2: Manual Docker Commands

### Build the image
```bash
docker build -t tsalin-frontend .
```

### Run the container
```bash
docker run -d \
  --name tsalin-frontend \
  -p 80:80 \
  --restart unless-stopped \
  tsalin-frontend
```

## 🔄 Update Deployment

To update the application after code changes:

```bash
cd tsalin.ai-frontend
git pull
./deploy.sh
```

## 📋 Useful Docker Commands

### View logs
```bash
docker logs tsalin-frontend
```

### View running containers
```bash
docker ps
```

### Stop the container
```bash
docker stop tsalin-frontend
```

### Start the container
```bash
docker start tsalin-frontend
```

### Remove the container
```bash
docker stop tsalin-frontend
docker rm tsalin-frontend
```

### Remove the image
```bash
docker rmi tsalin-frontend
```

## 🌐 Custom Port

If you want to run on a different port, edit `deploy.sh` and change:
```bash
PORT=80
```
to
```bash
PORT=3001  # or any port you want
```

## 🔧 Environment Variables

If you need to add environment variables, modify the `docker run` command in `deploy.sh`:

```bash
docker run -d \
  --name tsalin-frontend \
  -p 80:80 \
  -e VITE_API_URL=http://your-api-url \
  --restart unless-stopped \
  tsalin-frontend
```

## 🔒 HTTPS Setup

For production, you should set up HTTPS using:
- **Nginx reverse proxy** with Let's Encrypt
- **Traefik** as a reverse proxy
- **Cloudflare** in front of your server

## 📊 Health Check

Check if the application is running:
```bash
curl http://localhost
```

Or visit in your browser:
```
http://SERVER_IP
```

## 🆘 Troubleshooting

### Container won't start
```bash
docker logs tsalin-frontend
```

### Port already in use
```bash
# Find what's using port 80
sudo lsof -i :80

# Or change the port in deploy.sh
```

### Build fails
```bash
# Clean Docker cache
docker system prune -a
```

## 📝 Notes

- The application uses **nginx:alpine** for a lightweight production server
- Static assets are cached for 1 year
- Gzip compression is enabled
- The app supports client-side routing (React Router)

