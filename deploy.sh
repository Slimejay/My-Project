#!/bin/bash
set -e

echo "🔧 Installing Node.js 16 (if not already installed)..."
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

echo "📦 Ensuring PM2 is globally available..."
sudo npm install -g pm2


