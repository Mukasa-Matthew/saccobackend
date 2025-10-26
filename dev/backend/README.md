# SACCO Management System - Backend API

Complete backend API for managing SACCO (Savings and Credit Cooperative Organizations) operations.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Database Setup
```bash
# Create database
createdb sacco_db

# Or in PostgreSQL:
# CREATE DATABASE sacco_db;
```

### Configuration
Copy and edit environment variables:
```bash
# Edit .env file with your settings
```

### Seed Database
```bash
npm run seed
```

### Start Development
```bash
npm run dev
```

## 📧 Default Credentials

**SuperAdmin:**
- Email: matthewmukasa0@gmail.com
- Password: 1100211Matt.

## 🏗️ Production Deployment

### Using PM2
```bash
npm install -g pm2
npm run pm2:start
```

See `DEPLOYMENT.md` for complete deployment guide.

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get profile

### Dashboard (SuperAdmin)
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/financial-summary` - Financial summary
- `GET /api/dashboard/sacco-analytics` - SACCO analytics

### SACCO Management
- `POST /api/admin/register-sacco` - Register SACCO
- `GET /api/admin/saccos` - List all SACCOs
- `GET /api/saccos/:id` - Get SACCO
- `PUT /api/saccos/:id` - Update SACCO
- `DELETE /api/saccos/:id` - Delete SACCO

See API documentation for complete endpoint list.

## 🔧 Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize
- JWT Authentication
- Email (Nodemailer)

## 📚 Documentation

- `README.md` - This file
- `DEPLOYMENT.md` - Production deployment guide

## 🏃 Scripts

```bash
npm start          # Start production server
npm run dev         # Start development server
npm run seed        # Seed database
npm run pm2:start   # Start with PM2
npm run pm2:stop    # Stop PM2
npm run pm2:logs    # View logs
```

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation
- Audit logging

## 📞 Support

Check logs for errors:
```bash
npm run pm2:logs
```

---

**Ready to deploy!** 🚀
