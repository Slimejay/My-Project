#!/bin/bash
set -e

echo "🔧 Installing Node.js 16 (compatible with Amazon Linux 2)..."
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

echo "📦 Ensuring PM2 is globally available..."
sudo npm install -g pm2

echo "📁 Navigating to app directory..."
cd /home/ec2-user/app  # ❗ Change this if your app lives elsewhere

echo "📦 Installing project dependencies..."
npm install

echo "🚀 Starting or restarting app with PM2..."
pm2 describe myapp > /dev/null
if [ $? -eq 0 ]; then
  echo "🔄 Restarting app with PM2..."
  pm2 restart myapp
else
  echo "🆕 Starting app with PM2..."
  pm2 start dist/server.js --name myapp
fi

echo "💾 Saving PM2 process list..."
pm2 save

echo "✅ Deployment complete!"
