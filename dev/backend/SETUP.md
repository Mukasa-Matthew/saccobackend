# Quick Setup Guide

## Port Configuration

- **Development:** Port 3000 (when running `npm run dev`)
- **Production:** Port 3001 (when running with PM2)

## To Change Port

Edit your `.env` file:
```env
PORT=3001  # Change this to any port you want
```

## Start Commands

### Development
```bash
npm run dev  # Starts on port 3000
```

### Production
```bash
npm run pm2:start  # Starts on port 3001
```

The port is automatically read from your `.env` file or the PM2 configuration.

## Firewall

If using port 3001:
```bash
sudo ufw allow 3001/tcp
```

