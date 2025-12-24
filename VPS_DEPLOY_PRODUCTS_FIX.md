# VPS Deployment - Products Loading Fix

## Step-by-Step Instructions for VPS

### 1. SSH into VPS
```bash
ssh root@72.60.209.196
```

### 2. Navigate to Project Directory
```bash
cd ~/WaterJunction
```

### 3. Pull Latest Code from GitHub
```bash
git pull origin main
```

### 4. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies (if needed)
npm install

# Check if backend is running
pm2 list

# Restart backend
pm2 restart waterjunction-backend

# Check logs for errors
pm2 logs waterjunction-backend --lines 50
```

### 5. Frontend Setup
```bash
# Navigate to frontend (from project root)
cd ~/WaterJunction/frontend

# Install dependencies (if needed)
npm install

# Build frontend
npm run build

# Copy build files to nginx directory
sudo cp -r dist/* /var/www/html/

# Or if you have a specific nginx directory, use that path
# sudo cp -r dist/* /var/www/waterjunction/
```

### 6. Check Backend Environment Variables
```bash
cd ~/WaterJunction/backend
cat .env | grep -E "MONGO|SHIPMOZO|RAZORPAY"
```

Make sure these are set:
- `MONGO_URI`
- `SHIPMOZO_PUBLIC_KEY`
- `SHIPMOZO_PRIVATE_KEY`
- `SHIPMOZO_BASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### 7. Test Backend API
```bash
# Test products API
curl http://localhost:5000/api/products?limit=8

# Or from your browser/VPS
curl http://localhost:5000/api/products?featured=true&limit=8
```

### 8. Check PM2 Status
```bash
pm2 status
pm2 logs waterjunction-backend --lines 30
```

### 9. Check Nginx (if using)
```bash
# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 10. Verify Everything is Working
- Open your website in browser
- Check browser console (F12) for errors
- Try accessing: `https://yourdomain.com` (or your VPS IP)

## Troubleshooting

### If Backend Not Starting:
```bash
cd ~/WaterJunction/backend
node server.js
# Check for errors in terminal
```

### If Products Still Not Loading:
1. Check MongoDB connection:
```bash
cd ~/WaterJunction/backend
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
```

2. Check if products exist in database (via MongoDB Compass or mongo shell)

3. Check backend logs:
```bash
pm2 logs waterjunction-backend --lines 100
```

### If Frontend Build Fails:
```bash
cd ~/WaterJunction/frontend
npm run build
# Check for errors
```

### Quick Restart Everything:
```bash
cd ~/WaterJunction
git pull origin main
cd backend
npm install
pm2 restart waterjunction-backend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```


