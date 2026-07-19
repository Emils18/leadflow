#!/usr/bin/env bash
set -e

echo "Starting LeadFlow CRM deployment..."

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "Pulling latest changes..."
git pull origin main

echo "Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm install
npx prisma generate

echo "Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install

echo "Building frontend for Nginx..."
npm run build

echo "Restarting backend process if PM2 is available..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart leadflow || pm2 restart crm || pm2 restart all
  pm2 save
else
  echo "PM2 not found. Please restart backend manually."
fi

echo "Deployment completed successfully."