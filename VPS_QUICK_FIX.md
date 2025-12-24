# 🚀 VPS Quick Fix - Copy Paste Commands

## Step 1: Latest Code Pull & Backend Restart

VPS par SSH karein aur ye commands ek-ek karke run karein:

```bash
cd ~/WaterJunction
git pull origin main
cd backend
npm install
pm2 restart waterjunction-backend --update-env
pm2 logs waterjunction-backend --lines 20
```

---

## Step 2: MongoDB Connection String Check & Fix

```bash
# Check current MONGO_URI
cat ~/WaterJunction/backend/.env | grep MONGO_URI

# Edit .env file (agar MongoDB connection string nahi hai ya galat hai)
nano ~/WaterJunction/backend/.env
```

**`.env` file me `MONGO_URI` line check/update karein:**

Agar line aisi hai:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/water
```

To apna **actual MongoDB Atlas connection string** paste karein.

**MongoDB Atlas se connection string kaise milega:**
1. MongoDB Atlas Dashboard → Clusters
2. "Connect" button click karein
3. "Connect your application" select karein
4. Connection string copy karein
5. Username aur password replace karein
6. Database name add karein (end me `/water`)

**Example:**
```
MONGO_URI=mongodb+srv://myuser:MyPass123@cluster0.abc123.mongodb.net/water?retryWrites=true&w=majority
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Backend Restart After MongoDB URI Update

```bash
pm2 restart waterjunction-backend --update-env
pm2 logs waterjunction-backend --lines 30
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

---

## Step 4: MongoDB Atlas Network Access (Important!)

MongoDB Atlas dashboard me:
1. **Network Access** section me jayein
2. **Add IP Address** button click karein
3. VPS ka IP add karein: `72.60.209.196`
   - Ya "Allow Access from Anywhere" select karein (development ke liye): `0.0.0.0/0`

---

## ✅ Checklist

- [ ] Latest code pulled (`git pull origin main`)
- [ ] Backend dependencies updated (`npm install`)
- [ ] MongoDB connection string set in `.env` file
- [ ] MongoDB Atlas me VPS IP whitelisted
- [ ] Backend restarted with PM2
- [ ] Logs me "✅ MongoDB Connected Successfully" dikh raha hai

---

## 🆘 Troubleshooting

### MongoDB Connection Still Failing?

1. **Connection string format check karein:**
   ```bash
   cat ~/WaterJunction/backend/.env | grep MONGO_URI
   ```
   - Must start with `mongodb+srv://`
   - Must have username:password
   - Must have cluster URL
   - Must have database name

2. **Password me special characters ho to URL-encode karein:**
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - etc.

3. **MongoDB Atlas me IP whitelist check karein**

4. **Test connection manually:**
   ```bash
   # Install MongoDB shell (optional)
   # Then test: mongosh "your_connection_string"
   ```



## Step 1: Latest Code Pull & Backend Restart

VPS par SSH karein aur ye commands ek-ek karke run karein:

```bash
cd ~/WaterJunction
git pull origin main
cd backend
npm install
pm2 restart waterjunction-backend --update-env
pm2 logs waterjunction-backend --lines 20
```

---

## Step 2: MongoDB Connection String Check & Fix

```bash
# Check current MONGO_URI
cat ~/WaterJunction/backend/.env | grep MONGO_URI

# Edit .env file (agar MongoDB connection string nahi hai ya galat hai)
nano ~/WaterJunction/backend/.env
```

**`.env` file me `MONGO_URI` line check/update karein:**

Agar line aisi hai:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/water
```

To apna **actual MongoDB Atlas connection string** paste karein.

**MongoDB Atlas se connection string kaise milega:**
1. MongoDB Atlas Dashboard → Clusters
2. "Connect" button click karein
3. "Connect your application" select karein
4. Connection string copy karein
5. Username aur password replace karein
6. Database name add karein (end me `/water`)

**Example:**
```
MONGO_URI=mongodb+srv://myuser:MyPass123@cluster0.abc123.mongodb.net/water?retryWrites=true&w=majority
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Backend Restart After MongoDB URI Update

```bash
pm2 restart waterjunction-backend --update-env
pm2 logs waterjunction-backend --lines 30
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

---

## Step 4: MongoDB Atlas Network Access (Important!)

MongoDB Atlas dashboard me:
1. **Network Access** section me jayein
2. **Add IP Address** button click karein
3. VPS ka IP add karein: `72.60.209.196`
   - Ya "Allow Access from Anywhere" select karein (development ke liye): `0.0.0.0/0`

---

## ✅ Checklist

- [ ] Latest code pulled (`git pull origin main`)
- [ ] Backend dependencies updated (`npm install`)
- [ ] MongoDB connection string set in `.env` file
- [ ] MongoDB Atlas me VPS IP whitelisted
- [ ] Backend restarted with PM2
- [ ] Logs me "✅ MongoDB Connected Successfully" dikh raha hai

---

## 🆘 Troubleshooting

### MongoDB Connection Still Failing?

1. **Connection string format check karein:**
   ```bash
   cat ~/WaterJunction/backend/.env | grep MONGO_URI
   ```
   - Must start with `mongodb+srv://`
   - Must have username:password
   - Must have cluster URL
   - Must have database name

2. **Password me special characters ho to URL-encode karein:**
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - etc.

3. **MongoDB Atlas me IP whitelist check karein**

4. **Test connection manually:**
   ```bash
   # Install MongoDB shell (optional)
   # Then test: mongosh "your_connection_string"
   ```



