#!/bin/bash

# WaterJunction VPS Setup Script
# Run this script on your VPS after connecting via SSH

echo "🚀 Starting WaterJunction VPS Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Go to project directory
echo -e "${YELLOW}Step 1: Navigating to project directory...${NC}"
cd ~/WaterJunction || { echo -e "${RED}Error: Project directory not found. Please clone the repository first.${NC}"; exit 1; }

# Step 2: Pull latest code
echo -e "${YELLOW}Step 2: Pulling latest code from GitHub...${NC}"
git pull origin main

# Step 3: Update backend dependencies
echo -e "${YELLOW}Step 3: Updating backend dependencies...${NC}"
cd backend
npm install

# Step 4: Check if .env file exists
echo -e "${YELLOW}Step 4: Checking backend .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}Error: backend/.env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with required environment variables.${NC}"
    exit 1
fi

# Step 5: Check if MONGO_URI is set
if ! grep -q "MONGO_URI=mongodb+srv://" .env 2>/dev/null; then
    echo -e "${RED}Warning: MONGO_URI not set or invalid in .env file!${NC}"
    echo -e "${YELLOW}Please update MONGO_URI in backend/.env file with your MongoDB Atlas connection string.${NC}"
    echo -e "${YELLOW}Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/water${NC}"
fi

# Step 6: Restart backend with PM2
echo -e "${YELLOW}Step 6: Restarting backend with PM2...${NC}"
pm2 restart waterjunction-backend --update-env || pm2 start server.js --name waterjunction-backend

# Step 7: Check PM2 status
echo -e "${YELLOW}Step 7: Checking PM2 status...${NC}"
pm2 status

# Step 8: Show recent logs
echo -e "${YELLOW}Step 8: Recent backend logs:${NC}"
pm2 logs waterjunction-backend --lines 20 --nostream

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${YELLOW}If you see MongoDB connection errors, please update MONGO_URI in backend/.env file.${NC}"



# WaterJunction VPS Setup Script
# Run this script on your VPS after connecting via SSH

echo "🚀 Starting WaterJunction VPS Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Go to project directory
echo -e "${YELLOW}Step 1: Navigating to project directory...${NC}"
cd ~/WaterJunction || { echo -e "${RED}Error: Project directory not found. Please clone the repository first.${NC}"; exit 1; }

# Step 2: Pull latest code
echo -e "${YELLOW}Step 2: Pulling latest code from GitHub...${NC}"
git pull origin main

# Step 3: Update backend dependencies
echo -e "${YELLOW}Step 3: Updating backend dependencies...${NC}"
cd backend
npm install

# Step 4: Check if .env file exists
echo -e "${YELLOW}Step 4: Checking backend .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}Error: backend/.env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with required environment variables.${NC}"
    exit 1
fi

# Step 5: Check if MONGO_URI is set
if ! grep -q "MONGO_URI=mongodb+srv://" .env 2>/dev/null; then
    echo -e "${RED}Warning: MONGO_URI not set or invalid in .env file!${NC}"
    echo -e "${YELLOW}Please update MONGO_URI in backend/.env file with your MongoDB Atlas connection string.${NC}"
    echo -e "${YELLOW}Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/water${NC}"
fi

# Step 6: Restart backend with PM2
echo -e "${YELLOW}Step 6: Restarting backend with PM2...${NC}"
pm2 restart waterjunction-backend --update-env || pm2 start server.js --name waterjunction-backend

# Step 7: Check PM2 status
echo -e "${YELLOW}Step 7: Checking PM2 status...${NC}"
pm2 status

# Step 8: Show recent logs
echo -e "${YELLOW}Step 8: Recent backend logs:${NC}"
pm2 logs waterjunction-backend --lines 20 --nostream

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${YELLOW}If you see MongoDB connection errors, please update MONGO_URI in backend/.env file.${NC}"





