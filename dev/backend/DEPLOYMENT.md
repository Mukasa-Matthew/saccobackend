# Deployment Guide - Home Server

## Production Setup

### 1. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 2. Configure Environment
Create `.env` with production settings:
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sacco_db
DB_USER=postgres
DB_PASSWORD=your_production_password

JWT_SECRET=your_very_secure_production_secret_here
JWT_EXPIRE=7d

PORT=3001

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@sacco.com
FRONTEND_URL=http://your-server-ip:5173
```

### 3. Start Application
```bash
pm2 start ecosystem.config.js
```

### 4. Save PM2 Configuration
```bash
pm2 save
pm2 startup  # Follow the displayed command
```

### 5. Useful PM2 Commands
```bash
pm2 list                # View processes
pm2 logs sacco-backend  # View logs
pm2 restart sacco-backend
pm2 stop sacco-backend
pm2 delete sacco-backend
```

## Auto-Start on Boot
PM2 will automatically start the app on server reboot after running `pm2 startup`.

## Health Check
```bash
curl http://localhost:3000/health
```

## Production Checklist

- [ ] Update `.env` with production credentials
- [ ] Set secure `JWT_SECRET`
- [ ] Configure database
- [ ] Set up email (optional)
- [ ] Configure firewall (port 3000)
- [ ] Set up reverse proxy (nginx recommended)
- [ ] Set up SSL

## Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Firewall Setup
```bash
# Allow port 3001
sudo ufw allow 3001/tcp
sudo ufw allow 5432/tcp  # PostgreSQL
```

## Database Backup
```bash
# Backup
pg_dump -U postgres sacco_db > backup.sql

# Restore
psql -U postgres sacco_db < backup.sql
```

