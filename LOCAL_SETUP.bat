@echo off
echo 🚀 WaterJunction Local Setup & Testing
echo ========================================

echo 🔧 Setting up Backend...
cd backend

echo 📦 Installing backend dependencies...
call npm install

echo 🌱 Seeding database...
call npm run seed

echo 🚀 Starting backend server...
start /B npm start
timeout /t 10 /nobreak > nul

echo 🏥 Testing backend health...
curl -s http://localhost:5000/api/health | find "OK" >nul
if %errorlevel% neq 0 (
    echo ❌ Backend health check failed!
    goto :error
) else (
    echo ✅ Backend health check passed!
)

echo 📦 Testing products API...
curl -s "http://localhost:5000/api/products?limit=5" | find "success" >nul
if %errorlevel% neq 0 (
    echo ❌ Products API failed!
    goto :error
) else (
    echo ✅ Products API working!
)

echo 🛑 Stopping backend...
taskkill /f /im node.exe >nul 2>&1

cd ..

echo ⚛️ Setting up Frontend...
cd frontend

echo 📦 Installing frontend dependencies...
call npm install

echo 🔨 Building frontend...
call npm run build

if not exist "dist" (
    echo ❌ Frontend build failed!
    goto :error
) else (
    echo ✅ Frontend build successful!
)

cd ..

echo 🎉 All tests passed! Ready for deployment!
echo.
echo 📦 Deployment files created:
echo - nginx.conf
echo - ecosystem.config.js
echo - Dockerfile.backend & Dockerfile.frontend
echo - docker-compose.yml
echo - deploy-to-vps.sh
echo.
echo 🚀 Ready for production deployment!
goto :end

:error
echo ❌ Setup failed! Please check errors above.
pause

:end
echo Setup complete!
pause
