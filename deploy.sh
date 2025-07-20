#!/bin/bash
set -e

echo "🔧 Installing Node.js 16 (if not already installed)..."
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

echo "📦 Ensuring PM2 is globally available..."
sudo npm install -g pm2

cd /home/ec2-user/app  # Use ec2-user if Amazon Linux

npm install

pm2 describe myapp > /dev/null
if [ $? -eq 0 ]; then
  echo "Restarting app with PM2..."
  pm2 restart myapp
else
  echo "Starting new app with PM2..."
  pm2 start dist/server.js --name myapp
fi

pm2 save
