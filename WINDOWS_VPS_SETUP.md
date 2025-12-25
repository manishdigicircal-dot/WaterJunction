# 🪟 Windows se Hostinger VPS Setup Guide

## Windows PowerShell se VPS par kaise connect karein

### Step 1: PowerShell kholen

1. **Windows Key + X** press karein
2. **Windows PowerShell** ya **Terminal** select karein
3. Ya **Start Menu** → Search "PowerShell" → Open

### Step 2: VPS par SSH connect karein

```powershell
ssh root@72.60.209.196
```

**Pehli baar connect karne par:**
- "The authenticity of host..." message aayega
- Type `yes` aur Enter press karein
- Password enter karein: `Digicircal@2026`
- Note: Password type karte waqt screen par kuch nahi dikhega (normal hai)

### Step 3: Jab VPS par connected ho jayein

Aapka prompt change ho jayega, kuch aisa dikhega:
```
root@srv1215683:~#
```

Ab aap VPS par hain! 🎉

---

## 🚀 Step-by-Step Commands (VPS par run karein)

### Step 1: System Update

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Node.js Install (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Verify Installation

```bash
node --version
npm --version
```

**Expected output:** Node.js v20.x.x aur npm v10.x.x

### Step 4: PM2 Install (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 5: Nginx Install (Web Server)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Git Install (if needed)

```bash
sudo apt install -y git
```

---

## 📝 Important Notes

1. **Password copy-paste:** Windows me Ctrl+V se password paste nahi hoga, manually type karna hoga
2. **SSH disconnect:** Agar connection disconnect ho jaye, dobara `ssh root@72.60.209.196` run karein
3. **Commands:** Sab commands VPS (Linux) par run karni hai, Windows PowerShell me sirf SSH command

---

## ✅ Checklist

- [ ] PowerShell me SSH command run ki
- [ ] Password enter ki aur VPS par connected ho gaye
- [ ] System update complete
- [ ] Node.js install ho gaya
- [ ] PM2 aur Nginx install ho gaye

---

## 🆘 Troubleshooting

### SSH connection error

Agar "ssh: command not found" aaye:
- Windows 10/11 me PowerShell me SSH built-in hota hai
- Agar nahi hai to: **Settings → Apps → Optional Features → Add Feature → OpenSSH Client**

### Connection timeout

```powershell
# Try with verbose mode
ssh -v root@72.60.209.196
```

### Password issues

- Password me special characters hain (@), manually type karein
- Caps Lock check karein
- Password type karte waqt screen par kuch nahi dikhega (normal hai)



## Windows PowerShell se VPS par kaise connect karein

### Step 1: PowerShell kholen

1. **Windows Key + X** press karein
2. **Windows PowerShell** ya **Terminal** select karein
3. Ya **Start Menu** → Search "PowerShell" → Open

### Step 2: VPS par SSH connect karein

```powershell
ssh root@72.60.209.196
```

**Pehli baar connect karne par:**
- "The authenticity of host..." message aayega
- Type `yes` aur Enter press karein
- Password enter karein: `Digicircal@2026`
- Note: Password type karte waqt screen par kuch nahi dikhega (normal hai)

### Step 3: Jab VPS par connected ho jayein

Aapka prompt change ho jayega, kuch aisa dikhega:
```
root@srv1215683:~#
```

Ab aap VPS par hain! 🎉

---

## 🚀 Step-by-Step Commands (VPS par run karein)

### Step 1: System Update

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Node.js Install (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Verify Installation

```bash
node --version
npm --version
```

**Expected output:** Node.js v20.x.x aur npm v10.x.x

### Step 4: PM2 Install (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 5: Nginx Install (Web Server)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Git Install (if needed)

```bash
sudo apt install -y git
```

---

## 📝 Important Notes

1. **Password copy-paste:** Windows me Ctrl+V se password paste nahi hoga, manually type karna hoga
2. **SSH disconnect:** Agar connection disconnect ho jaye, dobara `ssh root@72.60.209.196` run karein
3. **Commands:** Sab commands VPS (Linux) par run karni hai, Windows PowerShell me sirf SSH command

---

## ✅ Checklist

- [ ] PowerShell me SSH command run ki
- [ ] Password enter ki aur VPS par connected ho gaye
- [ ] System update complete
- [ ] Node.js install ho gaya
- [ ] PM2 aur Nginx install ho gaye

---

## 🆘 Troubleshooting

### SSH connection error

Agar "ssh: command not found" aaye:
- Windows 10/11 me PowerShell me SSH built-in hota hai
- Agar nahi hai to: **Settings → Apps → Optional Features → Add Feature → OpenSSH Client**

### Connection timeout

```powershell
# Try with verbose mode
ssh -v root@72.60.209.196
```

### Password issues

- Password me special characters hain (@), manually type karein
- Caps Lock check karein
- Password type karte waqt screen par kuch nahi dikhega (normal hai)





