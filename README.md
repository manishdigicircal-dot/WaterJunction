# 💧 WaterJunction - E-Commerce Platform

A complete, production-grade full-stack e-commerce platform for water purification solutions built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### User Features
- ✅ Multiple Authentication Methods (Email/Password, Phone/OTP, Google, Facebook)
- ✅ Product Catalog with Advanced Filtering & Search
- ✅ Shopping Cart & Wishlist
- ✅ Razorpay Payment Integration
- ✅ Order Tracking & Management
- ✅ Product Reviews & Ratings
- ✅ Multi-language Support (English + Hindi)
- ✅ Responsive Design
- ✅ PWA Support (Offline capability)

### Admin Features
- ✅ Complete Admin Dashboard with Analytics
- ✅ Product Management (CRUD, Bulk Import/Export)
- ✅ Category Management
- ✅ Order Management & Status Updates
- ✅ User Management & Blocking
- ✅ Coupon & Flash Sale Management
- ✅ Review Moderation
- ✅ Q&A Moderation

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Redux Toolkit
- React Router
- Axios
- Razorpay SDK
- Firebase (Google Auth)
- Recharts (Analytics)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (File Uploads)
- Razorpay API
- Twilio (OTP)
- Nodemailer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Waterjuctionproject
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/water

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_change_this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_Roi8KojaRm22b6
RAZORPAY_KEY_SECRET=VmANPPsMGQhkrGQQUKX4CZ74

# Twilio Configuration (for OTP - optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyBssmvBibhMS089T2TgvZGawbguoc4scr8
VITE_FIREBASE_AUTH_DOMAIN=digi-72be4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=digi-72be4
VITE_FIREBASE_STORAGE_BUCKET=digi-72be4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=632012280788
VITE_FIREBASE_APP_ID=1:632012280788:web:0646afe4249002eaaebc41
VITE_FIREBASE_MEASUREMENT_ID=G-NYSEBRJKWY
VITE_RAZORPAY_KEY_ID=rzp_test_Roi8KojaRm22b6
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

This will create:
- Admin user: `admin@waterjunction.com` / `admin123`
- Test user: `user@waterjunction.com` / `user123`
- Sample categories and products

### 5. Run the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

#### Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📱 Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser

2. **Login as Admin**:
   - Email: `admin@waterjunction.com`
   - Password: `admin123`
   - Access admin panel at `/admin`

3. **Login as User**:
   - Email: `user@waterjunction.com`
   - Password: `user123`
   - Or register a new account

## 🗂️ Project Structure

```
Waterjuctionproject/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error middleware
│   ├── utils/           # Utilities (upload, OTP, tokens)
│   ├── seeders/         # Database seeders
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store & slices
│   │   ├── utils/       # Utilities
│   │   └── App.jsx      # Main app component
│   └── vite.config.js
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/phone/send-otp` - Send OTP
- `POST /api/auth/phone/verify-otp` - Verify OTP
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/facebook` - Facebook OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `POST /api/orders/verify-payment` - Verify Razorpay payment

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/block` - Block/unblock user

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. Push code to GitHub
2. Connect to Render/Heroku
3. Set environment variables
4. Deploy

### Frontend Deployment (Netlify/Vercel)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables

## 📝 Notes

- For production, change all secrets and keys
- Configure Cloudinary for image/video uploads
- Set up Twilio for OTP (or use mock OTP in development)
- Configure email service for password reset
- Set up Google/Facebook OAuth credentials
- Enable Razorpay production keys

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

WaterJunction Development Team

---

**Built with ❤️ for clean water solutions**







