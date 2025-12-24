# 🚀 Hostinger VPS Deployment Guide

Complete step-by-step guide to deploy WaterJunction on Hostinger VPS.

## 📋 Prerequisites

- Hostinger VPS (Ubuntu 24.04 LTS)
- Domain name (optional, but recommended)
- MongoDB Atlas account (or local MongoDB)
- GitHub repository access

## 🔧 Step 1: Initial VPS Setup

### 1.1 Connect to VPS via SSH

```bash
ssh root@72.60.209.196
# Or with your username if configured
ssh username@72.60.209.196
```

### 1.2 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Node.js (v20 LTS recommended)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.5 Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.6 Install Git (if not already installed)

```bash
sudo apt install -y git
```

## 🔧 Step 2: Clone and Setup Project

### 2.1 Clone Repository

```bash
cd ~
git clone https://github.com/manishdigicircal-dot/WaterJunction.git
cd WaterJunction
```

### 2.2 Install Backend Dependencies

```bash
cd backend
npm install
```

### 2.3 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🔧 Step 3: Environment Variables Setup

### 3.1 Backend `.env` File

```bash
cd ~/WaterJunction/backend
nano .env
```

Add the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/water
# Replace with your actual MongoDB Atlas connection string

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_minimum_32_characters_long
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend URL (Your domain or VPS IP)
FRONTEND_URL=http://72.60.209.196
# Or if using domain: FRONTEND_URL=https://yourdomain.com

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration (Live Keys)
RAZORPAY_KEY_ID=rzp_live_RtlA2dF0qpGDAo
RAZORPAY_KEY_SECRET=8kENMBS3uj7K1ggyfNs1KlSs

# Twilio Configuration (for OTP - optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Nodemailer - optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Save file:** `Ctrl+X`, then `Y`, then `Enter`

### 3.2 Frontend `.env` File

```bash
cd ~/WaterJunction/frontend
nano .env
```

Add the following configuration:

```env
# API URL - Use your VPS IP or domain
VITE_API_URL=http://72.60.209.196:5000/api
# Or if using domain with reverse proxy: VITE_API_URL=/api

# Razorpay Key (Live)
VITE_RAZORPAY_KEY_ID=rzp_live_RtlA2dF0qpGDAo

# Firebase Configuration (for Google Auth - if using)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

**Save file:** `Ctrl+X`, then `Y`, then `Enter`

## 🔧 Step 4: Build Frontend

```bash
cd ~/WaterJunction/frontend
npm run build
```

This will create a `dist` folder with production-ready files.

## 🔧 Step 5: Configure Nginx Reverse Proxy

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/waterjunction
```

Add the following configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name 72.60.209.196;  # Or your domain name

    # Backend API routes
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

    # Frontend static files
    location / {
        root /root/WaterJunction/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Increase body size for file uploads
    client_max_body_size 20M;
}
```

**Save file:** `Ctrl+X`, then `Y`, then `Enter`

### 5.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/waterjunction /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## 🔧 Step 6: Start Backend with PM2

### 6.1 Start Backend

```bash
cd ~/WaterJunction/backend
pm2 start server.js --name waterjunction-backend
```

### 6.2 Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Follow the command it shows to enable PM2 on system startup
```

### 6.3 Check PM2 Status

```bash
pm2 status
pm2 logs waterjunction-backend
```

## 🔧 Step 7: Configure Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if using SSL)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 🔧 Step 8: Test Deployment

1. **Backend API Test:**
   ```bash
   curl http://localhost:5000/api/categories
   ```

2. **Frontend Test:**
   Open browser and visit: `http://72.60.209.196`

3. **Check PM2 Logs:**
   ```bash
   pm2 logs waterjunction-backend --lines 50
   ```

## 🔧 Step 9: SSL Certificate (Optional but Recommended)

If you have a domain name, install SSL certificate using Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

This will automatically configure HTTPS and update Nginx configuration.

## 📝 Common Commands

### PM2 Commands

```bash
# View logs
pm2 logs waterjunction-backend

# Restart application
pm2 restart waterjunction-backend

# Stop application
pm2 stop waterjunction-backend

# View status
pm2 status

# Monitor resources
pm2 monit
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Update Application

```bash
cd ~/WaterJunction
git pull origin main
cd backend
npm install
cd ../frontend
npm install
npm run build
pm2 restart waterjunction-backend
sudo systemctl reload nginx
```

## ⚠️ Troubleshooting

### Backend not starting
- Check `.env` file exists and has correct values
- Check MongoDB connection string is correct
- Check logs: `pm2 logs waterjunction-backend`

### Frontend not loading
- Verify `dist` folder exists: `ls -la ~/WaterJunction/frontend/dist`
- Check Nginx configuration: `sudo nginx -t`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### MongoDB connection error
- Verify MongoDB Atlas network access includes your VPS IP
- Check connection string format
- Test connection: `mongosh "your_connection_string"`

### Port already in use
```bash
# Check what's using port 5000
sudo lsof -i :5000
# Kill process if needed
sudo kill -9 <PID>
```

## 🔒 Security Recommendations

1. **Change default SSH port** (optional but recommended)
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable firewall** (UFW)
4. **Use SSL/HTTPS** (Let's Encrypt)
5. **Regular updates:** `sudo apt update && sudo apt upgrade`
6. **Monitor logs:** `pm2 logs` and `/var/log/nginx/`

## 📞 Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs waterjunction-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas network access and connection string



Complete step-by-step guide to deploy WaterJunction on Hostinger VPS.

## 📋 Prerequisites

- Hostinger VPS (Ubuntu 24.04 LTS)
- Domain name (optional, but recommended)
- MongoDB Atlas account (or local MongoDB)
- GitHub repository access

## 🔧 Step 1: Initial VPS Setup

### 1.1 Connect to VPS via SSH

```bash
ssh root@72.60.209.196
# Or with your username if configured
ssh username@72.60.209.196
```

### 1.2 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Node.js (v20 LTS recommended)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.5 Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.6 Install Git (if not already installed)

```bash
sudo apt install -y git
```

## 🔧 Step 2: Clone and Setup Project

### 2.1 Clone Repository

```bash
cd ~
git clone https://github.com/manishdigicircal-dot/WaterJunction.git
cd WaterJunction
```

### 2.2 Install Backend Dependencies

```bash
cd backend
npm install
```

### 2.3 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🔧 Step 3: Environment Variables Setup

### 3.1 Backend `.env` File

```bash
cd ~/WaterJunction/backend
nano .env
```

Add the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/water
# Replace with your actual MongoDB Atlas connection string

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_minimum_32_characters_long
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend URL (Your domain or VPS IP)
FRONTEND_URL=http://72.60.209.196
# Or if using domain: FRONTEND_URL=https://yourdomain.com

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration (Live Keys)
RAZORPAY_KEY_ID=rzp_live_RtlA2dF0qpGDAo
RAZORPAY_KEY_SECRET=8kENMBS3uj7K1ggyfNs1KlSs

# Twilio Configuration (for OTP - optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Nodemailer - optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Save file:** `Ctrl+X`, then `Y`, then `Enter`

### 3.2 Frontend `.env` File

```bash
cd ~/WaterJunction/frontend
nano .env
```

Add the following configuration:

```env
# API URL - Use your VPS IP or domain
VITE_API_URL=http://72.60.209.196:5000/api
# Or if using domain with reverse proxy: VITE_API_URL=/api

# Razorpay Key (Live)
VITE_RAZORPAY_KEY_ID=rzp_live_RtlA2dF0qpGDAo

# Firebase Configuration (for Google Auth - if using)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

**Save file:** `Ctrl+X`, then `Y`, then `Enter`

## 🔧 Step 4: Build Frontend

```bash
cd ~/WaterJunction/frontend
npm run build
```

This will create a `dist` folder with production-ready files.

## 🔧 Step 5: Configure Nginx Reverse Proxy

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/waterjunction
```

Add the following configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name 72.60.209.196;  # Or your domain name

    # Backend API routes
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

    # Frontend static files
    location / {
        root /root/WaterJunction/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Increase body size for file uploads
    client_max_body_size 20M;
}
```

**Save file:** `Ctrl+X`, then `Y`, then `Enter`

### 5.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/waterjunction /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## 🔧 Step 6: Start Backend with PM2

### 6.1 Start Backend

```bash
cd ~/WaterJunction/backend
pm2 start server.js --name waterjunction-backend
```

### 6.2 Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Follow the command it shows to enable PM2 on system startup
```

### 6.3 Check PM2 Status

```bash
pm2 status
pm2 logs waterjunction-backend
```

## 🔧 Step 7: Configure Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if using SSL)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 🔧 Step 8: Test Deployment

1. **Backend API Test:**
   ```bash
   curl http://localhost:5000/api/categories
   ```

2. **Frontend Test:**
   Open browser and visit: `http://72.60.209.196`

3. **Check PM2 Logs:**
   ```bash
   pm2 logs waterjunction-backend --lines 50
   ```

## 🔧 Step 9: SSL Certificate (Optional but Recommended)

If you have a domain name, install SSL certificate using Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

This will automatically configure HTTPS and update Nginx configuration.

## 📝 Common Commands

### PM2 Commands

```bash
# View logs
pm2 logs waterjunction-backend

# Restart application
pm2 restart waterjunction-backend

# Stop application
pm2 stop waterjunction-backend

# View status
pm2 status

# Monitor resources
pm2 monit
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Update Application

```bash
cd ~/WaterJunction
git pull origin main
cd backend
npm install
cd ../frontend
npm install
npm run build
pm2 restart waterjunction-backend
sudo systemctl reload nginx
```

## ⚠️ Troubleshooting

### Backend not starting
- Check `.env` file exists and has correct values
- Check MongoDB connection string is correct
- Check logs: `pm2 logs waterjunction-backend`

### Frontend not loading
- Verify `dist` folder exists: `ls -la ~/WaterJunction/frontend/dist`
- Check Nginx configuration: `sudo nginx -t`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### MongoDB connection error
- Verify MongoDB Atlas network access includes your VPS IP
- Check connection string format
- Test connection: `mongosh "your_connection_string"`

### Port already in use
```bash
# Check what's using port 5000
sudo lsof -i :5000
# Kill process if needed
sudo kill -9 <PID>
```

## 🔒 Security Recommendations

1. **Change default SSH port** (optional but recommended)
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable firewall** (UFW)
4. **Use SSL/HTTPS** (Let's Encrypt)
5. **Regular updates:** `sudo apt update && sudo apt upgrade`
6. **Monitor logs:** `pm2 logs` and `/var/log/nginx/`

## 📞 Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs waterjunction-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas network access and connection string



