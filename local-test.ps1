# WaterJunction Local Testing & Deployment Prep Script
# Run this script to test everything locally before deployment

Write-Host "🚀 WaterJunction Local Testing & Deployment Preparation" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Yellow

# Function to test backend
function Test-Backend {
    Write-Host "`n🔧 Testing Backend..." -ForegroundColor Cyan

    # Check if backend directory exists
    if (!(Test-Path "backend")) {
        Write-Host "❌ Backend directory not found!" -ForegroundColor Red
        return $false
    }

    # Navigate to backend
    Set-Location backend

    # Install dependencies
    Write-Host "📦 Installing backend dependencies..."
    npm install

    # Check if .env exists
    if (!(Test-Path ".env")) {
        Write-Host "📝 Creating .env file..."
        @"
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb+srv://water:Digicircal@clustermanish.8pot9on.mongodb.net/myproject?retryWrites=true&w=majority&appName=ClusterManish

# JWT Configuration
JWT_SECRET=waterjunction_prod_jwt_9x82#@!
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_RtlA2dF0qpGDAo
RAZORPAY_KEY_SECRET=8kENMBS3uj7K1ggyfNs1KlSs

# Shipmozo Shipping Integration
SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
SHIPMOZO_BASE_URL=https://api.shipmozo.com
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ .env file created" -ForegroundColor Green
    }

    # Seed database
    Write-Host "🌱 Seeding database..."
    npm run seed

    # Test server startup
    Write-Host "🚀 Starting backend server..."
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm start
    }

    # Wait for server to start
    Start-Sleep -Seconds 10

    # Test health endpoint
    Write-Host "🏥 Testing health endpoint..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 10
        if ($response.status -eq "OK") {
            Write-Host "✅ Backend health check passed!" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend health check failed!" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }

    # Test products API
    Write-Host "📦 Testing products API..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products?limit=5" -TimeoutSec 15
        if ($response.success) {
            Write-Host "✅ Products API working! Found $($response.products.Count) products" -ForegroundColor Green
        } else {
            Write-Host "❌ Products API failed!" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Products API failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }

    # Stop backend
    Write-Host "🛑 Stopping backend server..."
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob

    Set-Location ..
    return $true
}

# Function to test frontend
function Test-Frontend {
    Write-Host "`n⚛️ Testing Frontend..." -ForegroundColor Cyan

    if (!(Test-Path "frontend")) {
        Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
        return $false
    }

    Set-Location frontend

    # Install dependencies
    Write-Host "📦 Installing frontend dependencies..."
    npm install

    # Check .env
    if (!(Test-Path ".env")) {
        Write-Host "📝 Creating frontend .env file..."
        @"
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_live_RtlA2dF0qpGDAo
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Frontend .env file created" -ForegroundColor Green
    }

    # Test build
    Write-Host "🔨 Testing frontend build..."
    npm run build

    if (!(Test-Path "dist")) {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        return $false
    }

    Write-Host "✅ Frontend build successful!" -ForegroundColor Green

    Set-Location ..
    return $true
}

# Function to create deployment files
function Create-DeploymentFiles {
    Write-Host "`n📦 Creating Deployment Files..." -ForegroundColor Cyan

    # Create nginx configuration
    Write-Host "🌐 Creating Nginx configuration..."
    @"
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Frontend (React SPA)
    location / {
        root /var/www/waterjunction/frontend/dist;
        index index.html index.htm;
        try_files `$uri `$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/waterjunction_access.log;
    error_log /var/log/nginx/waterjunction_error.log;
}
"@ | Out-File -FilePath "nginx.conf" -Encoding UTF8

    # Create PM2 ecosystem file
    Write-Host "🔄 Creating PM2 ecosystem file..."
    @"
module.exports = {
  apps: [{
    name: 'waterjunction-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    autorestart: true
  }]
};
"@ | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8

    # Create Docker files
    Write-Host "🐳 Creating Docker files..."

    # Dockerfile for backend
    @"
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
"@ | Out-File -FilePath "Dockerfile.backend" -Encoding UTF8

    # Dockerfile for frontend
    @"
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm ci

# Copy source
COPY frontend/ .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
"@ | Out-File -FilePath "Dockerfile.frontend" -Encoding UTF8

    # docker-compose.yml
    @"
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb+srv://water:Digicircal@clustermanish.8pot9on.mongodb.net/myproject?retryWrites=true&w=majority&appName=ClusterManish
      - JWT_SECRET=waterjunction_prod_jwt_9x82#@!
      - FRONTEND_URL=http://localhost
    depends_on:
      - mongodb
    networks:
      - waterjunction
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - waterjunction
    restart: unless-stopped

  mongodb:
    image: mongo:6-jammy
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - waterjunction
    restart: unless-stopped

networks:
  waterjunction:
    driver: bridge

volumes:
  mongodb_data:
"@ | Out-File -FilePath "docker-compose.yml" -Encoding UTF8

    Write-Host "✅ Deployment files created!" -ForegroundColor Green
}

# Function to create deployment script
function Create-DeployScript {
    Write-Host "`n🚀 Creating VPS Deployment Script..." -ForegroundColor Cyan

    @"
#!/bin/bash
# WaterJunction VPS Deployment Script

echo "🚀 Deploying WaterJunction to VPS..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone/update repository
cd /var/www
if [ -d "waterjunction" ]; then
    cd waterjunction
    git pull origin main
else
    git clone https://github.com/yourusername/waterjunction.git
    cd waterjunction
fi

# Setup backend
cd backend
npm install --production
cp .env.example .env
# Edit .env with your production values

# Setup frontend
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo cp ../nginx.conf /etc/nginx/sites-available/waterjunction
sudo ln -sf /etc/nginx/sites-available/waterjunction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start backend with PM2
cd ../backend
pm2 delete waterjunction-backend 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d yourdomain.com

echo "🎉 Deployment Complete!"
echo "🌐 Website: http://your-vps-ip"
echo "🔧 PM2: pm2 status"
echo "🌐 Nginx: sudo systemctl status nginx"
"@ | Out-File -FilePath "deploy-to-vps.sh" -Encoding UTF8

    Write-Host "✅ VPS deployment script created!" -ForegroundColor Green
}

# Main execution
$backendOK = Test-Backend
$frontendOK = Test-Frontend

if ($backendOK -and $frontendOK) {
    Write-Host "`n🎉 All Local Tests Passed!" -ForegroundColor Green
    Write-Host "✅ Backend API working" -ForegroundColor Green
    Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
    Write-Host "✅ Ready for deployment!" -ForegroundColor Green

    Create-DeploymentFiles
    Create-DeployScript

    Write-Host "`n📦 Deployment Files Created:" -ForegroundColor Yellow
    Write-Host "- nginx.conf (Nginx configuration)" -ForegroundColor White
    Write-Host "- ecosystem.config.js (PM2 configuration)" -ForegroundColor White
    Write-Host "- Dockerfile.backend & Dockerfile.frontend (Docker files)" -ForegroundColor White
    Write-Host "- docker-compose.yml (Docker Compose)" -ForegroundColor White
    Write-Host "- deploy-to-vps.sh (VPS deployment script)" -ForegroundColor White

    Write-Host "`n🚀 Ready for Production Deployment!" -ForegroundColor Green
    Write-Host "Run 'deploy-to-vps.sh' on your VPS to deploy" -ForegroundColor Cyan

} else {
    Write-Host "`n❌ Some tests failed. Please fix issues before deployment." -ForegroundColor Red

    if (!$backendOK) {
        Write-Host "- Backend issues detected" -ForegroundColor Red
    }

    if (!$frontendOK) {
        Write-Host "- Frontend issues detected" -ForegroundColor Red
    }
}
