# 🚀 WaterJunction E-commerce Deployment Guide

## 📋 Pre-Deployment Checklist

- [x] Backend API working locally
- [x] Frontend builds successfully
- [x] Database connection tested
- [x] Environment variables configured
- [x] CORS properly configured
- [x] All routes responding

## 🖥️ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with your MongoDB URI
npm run seed  # Seed sample data
npm start     # Start development server
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev   # Start development server
```

### 3. Test Everything Locally
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test products API
curl "http://localhost:5000/api/products?limit=5"

# Test categories
curl http://localhost:5000/api/categories

# Frontend should be accessible at http://localhost:5173
```

## 🌐 Production Deployment

### Option 1: VPS Deployment (Recommended)

#### 1. Server Requirements
- Ubuntu 20.04+ / CentOS 7+
- Node.js 18+
- Nginx
- PM2
- MongoDB Atlas account

#### 2. Upload Files to VPS
```bash
# On your local machine
scp -r . root@your-vps-ip:/var/www/waterjunction

# On VPS
cd /var/www/waterjunction
```

#### 3. Run Deployment Script
```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

#### 4. Manual Setup (if script fails)
```bash
# Install dependencies
sudo apt update
sudo apt install -y curl wget gnupg2 software-properties-common

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Setup backend
cd /var/www/waterjunction/backend
npm install --production
cp .env.example .env
# Edit .env with production values

# Setup frontend
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo cp ../nginx.conf /etc/nginx/sites-available/waterjunction
sudo ln -sf /etc/nginx/sites-available/waterjunction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start backend
cd ../backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

#### 1. Using Docker Compose
```bash
# Make sure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 2. Manual Docker Build
```bash
# Build backend
docker build -f Dockerfile.backend -t waterjunction-backend .

# Build frontend
docker build -f Dockerfile.frontend -t waterjunction-frontend .

# Run containers
docker run -d -p 5000:5000 --name backend waterjunction-backend
docker run -d -p 80:80 --name frontend waterjunction-frontend
```

## 🔧 Configuration Files

### Environment Variables (.env)

#### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Shipmozo Shipping Integration
SHIPMOZO_PUBLIC_KEY=your-shipmozo-public-key
SHIPMOZO_PRIVATE_KEY=your-shipmozo-private-key
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

#### Frontend (.env)
```bash
VITE_API_URL=https://yourdomain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
```

### Nginx Configuration (nginx.conf)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend (React SPA)
    location / {
        root /var/www/waterjunction/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🧪 Testing Production Deployment

### 1. Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"OK","message":"WaterJunction API v2"}
```

### 2. Products API
```bash
curl "https://yourdomain.com/api/products?limit=5"
# Expected: {"success":true,"products":[...]}
```

### 3. Categories API
```bash
curl https://yourdomain.com/api/categories
# Expected: {"success":true,"categories":[...]}
```

### 4. Frontend Load
- Open https://yourdomain.com in browser
- Should load React app
- No console errors
- API calls should work

## 🔒 Security Checklist

- [ ] Environment variables not committed to Git
- [ ] MongoDB IP whitelist configured
- [ ] JWT secrets are strong and unique
- [ ] HTTPS enabled (Let's Encrypt)
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Security headers enabled
- [ ] File permissions correct (644 for files, 755 for dirs)

## 📊 Performance Optimization

### Database Indexes
```javascript
// Run in MongoDB Atlas
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1 });
db.products.createIndex({ isActive: 1, isFeatured: 1 });
db.products.createIndex({ price: 1 });
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'waterjunction-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
```

### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_types text/css application/javascript application/json;
```

## 🚨 Troubleshooting

### Backend Not Starting
```bash
# Check PM2 logs
pm2 logs waterjunction-backend

# Check MongoDB connection
mongosh "mongodb+srv://..." --eval "db.products.countDocuments()"

# Manual test
cd backend && node server.js
```

### Frontend Not Loading
```bash
# Check build
cd frontend && npm run build

# Check nginx config
sudo nginx -t
sudo systemctl reload nginx

# Check file permissions
ls -la /var/www/waterjunction/frontend/dist/
```

### API Timeout Issues
```bash
# Check backend response time
time curl http://localhost:5000/api/products

# Check MongoDB performance
mongosh --eval "db.serverStatus().connections"
```

### CORS Issues
```bash
# Check CORS headers
curl -I http://localhost:5000/api/products

# Check frontend API URL
cat frontend/.env
```

## 📞 Support

If you encounter any issues:

1. Check the logs: `pm2 logs waterjunction-backend`
2. Test API endpoints manually with curl
3. Verify environment variables
4. Check MongoDB Atlas dashboard
5. Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

## 🎉 Success Checklist

- [ ] Website loads at https://yourdomain.com
- [ ] Products display correctly
- [ ] Categories work
- [ ] Search functionality
- [ ] Cart operations
- [ ] User authentication
- [ ] Admin panel accessible
- [ ] Payment integration working
- [ ] SSL certificate active
- [ ] Performance optimized
- [ ] Monitoring set up

---

**🚀 Your WaterJunction E-commerce platform is now ready for production!**
