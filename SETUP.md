# 🚀 Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configure MongoDB

Make sure MongoDB is running on your system:
```bash
# On Windows (if installed as service, it should auto-start)
# Or start manually:
mongod
```

### 3. Set Environment Variables

#### Backend `.env` File
Copy `backend/.env.example` to `backend/.env` and fill in your values:
- MongoDB URI (already set to `mongodb://localhost:27017/water`)
- JWT secrets (generate strong random strings)
- Cloudinary credentials (get from cloudinary.com)
- Razorpay keys (already provided for testing)
- Email credentials (for password reset)
- Twilio credentials (optional for OTP)

#### Frontend `.env` File
Copy `frontend/.env.example` to `frontend/.env` and fill in:
- API URL: `http://localhost:5000/api`
- Firebase config (already provided)
- Razorpay Key ID (already provided)

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@waterjunction.com` / `admin123`
- User: `user@waterjunction.com` / `user123`
- Sample products and categories

### 5. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 6. Access the Application

1. Open browser: `http://localhost:5173`
2. Login as admin: `admin@waterjunction.com` / `admin123`
3. Access admin panel: Click "Admin" in navbar or go to `/admin`

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/water`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.js`

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Razorpay Not Working
- Check if Razorpay script is loaded (check browser console)
- Verify Razorpay key in `.env`
- Use test mode keys provided

## 📝 Notes

- **OTP**: Without Twilio, OTPs are logged to console in development
- **Cloudinary**: Required for image/video uploads. Sign up at cloudinary.com
- **Email**: Gmail requires App Password for SMTP
- **Social Login**: Google/Facebook OAuth requires app setup in their consoles

## ✅ Next Steps

1. Configure Cloudinary for image uploads
2. Set up Twilio for SMS OTP (or continue with console logs)
3. Configure email service for password reset
4. Set up Google/Facebook OAuth (optional)
5. Customize products and categories
6. Deploy to production

---

**Happy Coding! 🎉**










## Step-by-Step Setup Instructions

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configure MongoDB

Make sure MongoDB is running on your system:
```bash
# On Windows (if installed as service, it should auto-start)
# Or start manually:
mongod
```

### 3. Set Environment Variables

#### Backend `.env` File
Copy `backend/.env.example` to `backend/.env` and fill in your values:
- MongoDB URI (already set to `mongodb://localhost:27017/water`)
- JWT secrets (generate strong random strings)
- Cloudinary credentials (get from cloudinary.com)
- Razorpay keys (already provided for testing)
- Email credentials (for password reset)
- Twilio credentials (optional for OTP)

#### Frontend `.env` File
Copy `frontend/.env.example` to `frontend/.env` and fill in:
- API URL: `http://localhost:5000/api`
- Firebase config (already provided)
- Razorpay Key ID (already provided)

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@waterjunction.com` / `admin123`
- User: `user@waterjunction.com` / `user123`
- Sample products and categories

### 5. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 6. Access the Application

1. Open browser: `http://localhost:5173`
2. Login as admin: `admin@waterjunction.com` / `admin123`
3. Access admin panel: Click "Admin" in navbar or go to `/admin`

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/water`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.js`

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Razorpay Not Working
- Check if Razorpay script is loaded (check browser console)
- Verify Razorpay key in `.env`
- Use test mode keys provided

## 📝 Notes

- **OTP**: Without Twilio, OTPs are logged to console in development
- **Cloudinary**: Required for image/video uploads. Sign up at cloudinary.com
- **Email**: Gmail requires App Password for SMTP
- **Social Login**: Google/Facebook OAuth requires app setup in their consoles

## ✅ Next Steps

1. Configure Cloudinary for image uploads
2. Set up Twilio for SMS OTP (or continue with console logs)
3. Configure email service for password reset
4. Set up Google/Facebook OAuth (optional)
5. Customize products and categories
6. Deploy to production

---

**Happy Coding! 🎉**










