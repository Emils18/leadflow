#!/bin/bash
#
# Deployment script for the LeadFlow CRM (Node/Express + Prisma backend,
# React/Vite frontend).
#
# Steps:
#   1. Pull the latest code from the target branch
#   2. Install backend deps, regenerate the Prisma client, run migrations
#   3. Build the frontend assets
#   4. Restart the backend via PM2
#
# Error safety: any failing command aborts the deploy immediately.

set -euo pipefail

PROJECT_DIR="/var/www/snapserve/crm"
GIT_BRANCH="main"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PM2_APP="leadflow-crm"   # PM2 process name for the backend

pull_latest() {
  echo "==> Pulling latest from origin/$GIT_BRANCH..."
  git -C "$PROJECT_DIR" pull origin "$GIT_BRANCH"
}

deploy_backend() {
  echo "==> Deploying backend..."
  cd "$BACKEND_DIR"
  npm install --omit=dev
  echo "==> Generating Prisma client..."
  npx prisma generate
  echo "==> Running database migrations..."
  npx prisma migrate deploy
}

build_frontend() {
  echo "==> Building frontend..."
  cd "$FRONTEND_DIR"
  npm install
  npm run build
}

restart_backend() {
  echo "==> Restarting backend ($PM2_APP)..."
  pm2 restart "$PM2_APP"
}

main() {
  echo "==> Deployment variables..."
  echo "* PROJECT_DIR:  $PROJECT_DIR"
  echo "* GIT_BRANCH:   $GIT_BRANCH"
  echo "* PM2_APP:      $PM2_APP"

  cd "$PROJECT_DIR" || { echo "Failed to change directory to $PROJECT_DIR"; exit 1; }

  pull_latest
  deploy_backend
  build_frontend
  restart_backend

  echo "==> Deployment complete."
}

main
