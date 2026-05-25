# Invoice Automation - Deployment Guide

## Architecture

- **Backend (Server):** Docker on your server (Flask + LibreOffice)
- **Frontend:** Vercel (Next.js + React)

## Server Deployment (Docker)

### Prerequisites
- Docker & Docker Compose installed
- SSH access to your server

### Steps

```bash
# 1. SSH to your server
ssh user@your-server.com

# 2. Clone repository
cd /app
git clone https://github.com/kiwabc123/document-text-replacing.git
cd document-text-replacing

# 3. Start Docker (server only)
docker-compose up -d

# 4. Check logs
docker-compose logs -f server
```

### Server will be available at:
```
http://your-server-ip:5000
```

### Health check:
```bash
curl http://localhost:5000/health
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Git repository access

### Steps

1. **Fork/Clone frontend code to separate repo** (optional)
   - Or use the main repo and configure Vercel to build from root

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import the GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Root Directory: `/` (or `.` if separate repo)

3. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-api-server.com:5000
     ```

4. **Deploy:**
   - Vercel will automatically deploy when you push to main branch

---

## Communication

- **Frontend (Vercel)** → **Backend API (Docker)**
  - Frontend requests go to `NEXT_PUBLIC_API_URL` (e.g., https://api.youromain.com:5000)
  - CORS should be enabled on backend

---

## SSL/HTTPS for Backend

For production, use nginx or Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Point your domain to server IP
# Then backend will be at: https://your-domain.com:5000
```

---

## Database/Persistent Storage

- Uploads stored in: `/server/uploads`
- Map volume in docker-compose.yml for persistence:
  ```yaml
  volumes:
    - /data/invoice-uploads:/app/uploads
  ```

---

## Monitoring

```bash
# View logs
docker-compose logs -f server

# Check status
docker-compose ps

# Restart
docker-compose restart server

# Stop
docker-compose down
```

---

## Troubleshooting

### Backend connection fails from Vercel
- Check firewall allows port 5000
- Verify CORS headers in Flask backend
- Check `NEXT_PUBLIC_API_URL` environment variable

### Docker build slow
- Builds should be fast now with optimization commits
- Use `docker-compose up -d` to avoid rebuild

### Server crashes
- Check logs: `docker-compose logs server`
- Verify disk space: `df -h`
- Check memory: `free -h`

