# VPS par Shipmozo Keys Add Karne Ka Guide

## Step-by-Step Instructions

### Step 1: VPS par SSH Connect Karein

Windows PowerShell ya Command Prompt me ye command run karein:

```bash
ssh root@72.60.209.196
```

Ya agar aapka different username hai:

```bash
ssh username@72.60.209.196
```

Password: `Digicircal@2026` (jab prompt kare)

---

### Step 2: Backend Directory me Jao

```bash
cd ~/WaterJunction/backend
```

Ya agar different location hai:

```bash
cd ~/WaterJunction
cd backend
```

---

### Step 3: .env File Edit Karein

Nano editor use karein:

```bash
nano .env
```

---

### Step 4: Shipmozo Keys Add Karein

`.env` file me scroll karke neeche jao aur ye lines add karein:

```env
# Shipmozo Shipping Integration
SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

**Ya agar file ke end me already kuch lines hain, to unke neeche add karein.**

---

### Step 5: File Save Karein

1. **Ctrl + X** press karein (exit ke liye)
2. **Y** press karein (save confirm karne ke liye)
3. **Enter** press karein (filename confirm ke liye)

---

### Step 6: Verify Karein (Optional)

Check karein ki keys properly add ho gayi:

```bash
cat .env | grep SHIPMOZO
```

Ye output dikhna chahiye:

```
SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

---

### Step 7: Backend Restart Karein

PM2 use kar rahe hain, to:

```bash
pm2 restart waterjunction-backend
```

Ya agar different name hai process ka:

```bash
pm2 list
# Process name check karein, phir:
pm2 restart <process-name>
```

---

### Step 8: Logs Check Karein (Optional)

Check karein ki backend properly start ho gaya:

```bash
pm2 logs waterjunction-backend --lines 30
```

Agar koi error nahi hai, to sab theek hai!

---

## Complete Commands (Copy-Paste Ready)

```bash
# 1. SSH Connect
ssh root@72.60.209.196

# 2. Backend Directory
cd ~/WaterJunction/backend

# 3. Edit .env File
nano .env

# 4. File me ye lines add karein (nano editor me):
# SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
# SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
# SHIPMOZO_BASE_URL=https://api.shipmozo.com

# 5. Save: Ctrl+X, phir Y, phir Enter

# 6. Restart Backend
pm2 restart waterjunction-backend

# 7. Check Logs
pm2 logs waterjunction-backend --lines 20
```

---

## Troubleshooting

### Agar .env file nahi mil rahi:

```bash
# Check karein ki file exist karti hai ya nahi
ls -la .env

# Agar nahi hai, to create karein
touch .env
nano .env
```

### Agar PM2 process name different hai:

```bash
pm2 list
# List me process name check karein
pm2 restart <actual-process-name>
```

### Agar keys add nahi ho rahi:

```bash
# Check karein ki keys add hui ya nahi
cat .env | grep SHIPMOZO

# Agar output empty hai, to dobara nano se edit karein
```

---

## Important Notes

1. **Never commit .env file** - Ye file sensitive data contain karti hai
2. **Keys ko expose mat karein** - Frontend me never use karein
3. **Production me strong keys use karein** - Test keys ko replace karein
4. **Backup lelo** - `.env` file ka backup le lena better hai

---

## Quick Verification

Agar sab kuch theek hai, to ye command run karke check karein:

```bash
cd ~/WaterJunction/backend
node -e "require('dotenv').config(); console.log('Shipmozo Public Key:', process.env.SHIPMOZO_PUBLIC_KEY ? '✅ Set' : '❌ Not Set');"
```

Ye "✅ Set" dikhna chahiye.


## Step-by-Step Instructions

### Step 1: VPS par SSH Connect Karein

Windows PowerShell ya Command Prompt me ye command run karein:

```bash
ssh root@72.60.209.196
```

Ya agar aapka different username hai:

```bash
ssh username@72.60.209.196
```

Password: `Digicircal@2026` (jab prompt kare)

---

### Step 2: Backend Directory me Jao

```bash
cd ~/WaterJunction/backend
```

Ya agar different location hai:

```bash
cd ~/WaterJunction
cd backend
```

---

### Step 3: .env File Edit Karein

Nano editor use karein:

```bash
nano .env
```

---

### Step 4: Shipmozo Keys Add Karein

`.env` file me scroll karke neeche jao aur ye lines add karein:

```env
# Shipmozo Shipping Integration
SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

**Ya agar file ke end me already kuch lines hain, to unke neeche add karein.**

---

### Step 5: File Save Karein

1. **Ctrl + X** press karein (exit ke liye)
2. **Y** press karein (save confirm karne ke liye)
3. **Enter** press karein (filename confirm ke liye)

---

### Step 6: Verify Karein (Optional)

Check karein ki keys properly add ho gayi:

```bash
cat .env | grep SHIPMOZO
```

Ye output dikhna chahiye:

```
SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
SHIPMOZO_BASE_URL=https://api.shipmozo.com
```

---

### Step 7: Backend Restart Karein

PM2 use kar rahe hain, to:

```bash
pm2 restart waterjunction-backend
```

Ya agar different name hai process ka:

```bash
pm2 list
# Process name check karein, phir:
pm2 restart <process-name>
```

---

### Step 8: Logs Check Karein (Optional)

Check karein ki backend properly start ho gaya:

```bash
pm2 logs waterjunction-backend --lines 30
```

Agar koi error nahi hai, to sab theek hai!

---

## Complete Commands (Copy-Paste Ready)

```bash
# 1. SSH Connect
ssh root@72.60.209.196

# 2. Backend Directory
cd ~/WaterJunction/backend

# 3. Edit .env File
nano .env

# 4. File me ye lines add karein (nano editor me):
# SHIPMOZO_PUBLIC_KEY=g3PV78O2AR0rCiUNJuWs
# SHIPMOZO_PRIVATE_KEY=xgWiZnBYA3VKMJShuqN7
# SHIPMOZO_BASE_URL=https://api.shipmozo.com

# 5. Save: Ctrl+X, phir Y, phir Enter

# 6. Restart Backend
pm2 restart waterjunction-backend

# 7. Check Logs
pm2 logs waterjunction-backend --lines 20
```

---

## Troubleshooting

### Agar .env file nahi mil rahi:

```bash
# Check karein ki file exist karti hai ya nahi
ls -la .env

# Agar nahi hai, to create karein
touch .env
nano .env
```

### Agar PM2 process name different hai:

```bash
pm2 list
# List me process name check karein
pm2 restart <actual-process-name>
```

### Agar keys add nahi ho rahi:

```bash
# Check karein ki keys add hui ya nahi
cat .env | grep SHIPMOZO

# Agar output empty hai, to dobara nano se edit karein
```

---

## Important Notes

1. **Never commit .env file** - Ye file sensitive data contain karti hai
2. **Keys ko expose mat karein** - Frontend me never use karein
3. **Production me strong keys use karein** - Test keys ko replace karein
4. **Backup lelo** - `.env` file ka backup le lena better hai

---

## Quick Verification

Agar sab kuch theek hai, to ye command run karke check karein:

```bash
cd ~/WaterJunction/backend
node -e "require('dotenv').config(); console.log('Shipmozo Public Key:', process.env.SHIPMOZO_PUBLIC_KEY ? '✅ Set' : '❌ Not Set');"
```

Ye "✅ Set" dikhna chahiye.


