# Fix 502 Bad Gateway Error

## Problem
502 Bad Gateway error means nginx can't connect to the backend server.

## Quick Diagnosis Steps

### 1. Check if Backend is Running
```bash
pm2 list
pm2 status waterjunction-backend
```

### 2. Check Backend Logs
```bash
pm2 logs waterjunction-backend --lines 50
```

### 3. Check if Backend is Listening on Port 5000
```bash
# Check if port 5000 is in use
sudo netstat -tlnp | grep 5000
# Or
sudo ss -tlnp | grep 5000
# Or
sudo lsof -i :5000
```

### 4. Test Backend Directly
```bash
# From VPS, test if backend responds
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products?limit=8
```

### 5. Check Nginx Configuration
```bash
# Find nginx config file
sudo find /etc/nginx -name "*.conf" | grep -E "(sites|conf.d)"
# Usually:
sudo cat /etc/nginx/sites-available/default
# Or
sudo cat /etc/nginx/nginx.conf
```

### 6. Check Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

## Common Fixes

### Fix 1: Restart Backend
```bash
cd ~/WaterJunction/backend
pm2 restart waterjunction-backend
pm2 logs waterjunction-backend --lines 30
```

### Fix 2: Check Nginx Proxy Configuration
Nginx should have something like this:

```nginx
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
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

### Fix 3: If Using PM2, Ensure Process is Running
```bash
# If backend not running, start it
cd ~/WaterJunction/backend
pm2 start server.js --name waterjunction-backend
pm2 save
pm2 startup
```

### Fix 4: Check Environment Variables
```bash
cd ~/WaterJunction/backend
cat .env | grep -E "PORT|MONGO"
# PORT should be 5000 or match nginx proxy_pass
```

### Fix 5: Test MongoDB Connection
```bash
cd ~/WaterJunction/backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ Connected'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); })"
```

### Fix 6: Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Fix 7: Check Firewall
```bash
# Allow port 5000 if needed
sudo ufw status
sudo ufw allow 5000/tcp
```

## Complete Restart Procedure

```bash
# 1. Stop everything
pm2 stop waterjunction-backend
sudo systemctl stop nginx

# 2. Check processes
ps aux | grep node
ps aux | grep nginx

# 3. Start backend
cd ~/WaterJunction/backend
pm2 start server.js --name waterjunction-backend
pm2 logs waterjunction-backend --lines 20

# 4. Test backend
curl http://localhost:5000/api/health

# 5. Start nginx
sudo systemctl start nginx
sudo systemctl status nginx

# 6. Test through nginx
curl http://localhost/api/health
# Or from browser: http://72.60.209.196/api/health
```

## Expected Results

✅ Backend running: `pm2 list` shows `waterjunction-backend` as `online`
✅ Port 5000 listening: `netstat` shows process on port 5000
✅ Backend responds: `curl http://localhost:5000/api/health` returns JSON
✅ Nginx proxying: `curl http://localhost/api/health` returns JSON


## Problem
502 Bad Gateway error means nginx can't connect to the backend server.

## Quick Diagnosis Steps

### 1. Check if Backend is Running
```bash
pm2 list
pm2 status waterjunction-backend
```

### 2. Check Backend Logs
```bash
pm2 logs waterjunction-backend --lines 50
```

### 3. Check if Backend is Listening on Port 5000
```bash
# Check if port 5000 is in use
sudo netstat -tlnp | grep 5000
# Or
sudo ss -tlnp | grep 5000
# Or
sudo lsof -i :5000
```

### 4. Test Backend Directly
```bash
# From VPS, test if backend responds
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products?limit=8
```

### 5. Check Nginx Configuration
```bash
# Find nginx config file
sudo find /etc/nginx -name "*.conf" | grep -E "(sites|conf.d)"
# Usually:
sudo cat /etc/nginx/sites-available/default
# Or
sudo cat /etc/nginx/nginx.conf
```

### 6. Check Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

## Common Fixes

### Fix 1: Restart Backend
```bash
cd ~/WaterJunction/backend
pm2 restart waterjunction-backend
pm2 logs waterjunction-backend --lines 30
```

### Fix 2: Check Nginx Proxy Configuration
Nginx should have something like this:

```nginx
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
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

### Fix 3: If Using PM2, Ensure Process is Running
```bash
# If backend not running, start it
cd ~/WaterJunction/backend
pm2 start server.js --name waterjunction-backend
pm2 save
pm2 startup
```

### Fix 4: Check Environment Variables
```bash
cd ~/WaterJunction/backend
cat .env | grep -E "PORT|MONGO"
# PORT should be 5000 or match nginx proxy_pass
```

### Fix 5: Test MongoDB Connection
```bash
cd ~/WaterJunction/backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ Connected'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); })"
```

### Fix 6: Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Fix 7: Check Firewall
```bash
# Allow port 5000 if needed
sudo ufw status
sudo ufw allow 5000/tcp
```

## Complete Restart Procedure

```bash
# 1. Stop everything
pm2 stop waterjunction-backend
sudo systemctl stop nginx

# 2. Check processes
ps aux | grep node
ps aux | grep nginx

# 3. Start backend
cd ~/WaterJunction/backend
pm2 start server.js --name waterjunction-backend
pm2 logs waterjunction-backend --lines 20

# 4. Test backend
curl http://localhost:5000/api/health

# 5. Start nginx
sudo systemctl start nginx
sudo systemctl status nginx

# 6. Test through nginx
curl http://localhost/api/health
# Or from browser: http://72.60.209.196/api/health
```

## Expected Results

✅ Backend running: `pm2 list` shows `waterjunction-backend` as `online`
✅ Port 5000 listening: `netstat` shows process on port 5000
✅ Backend responds: `curl http://localhost:5000/api/health` returns JSON
✅ Nginx proxying: `curl http://localhost/api/health` returns JSON


