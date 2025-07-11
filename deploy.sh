#!/bin/bash
set -e

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
