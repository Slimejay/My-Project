#!/bin/bash

# Exit immediately if a command fails
set -e

# Navigate to the app directory
cd /home/ec2-user/app

# Install Node.js dependencies
npm install

# Start or restart app using PM2
pm2 describe myapp > /dev/null
if [ $? -eq 0 ]; then
  echo "Restarting existing PM2 process..."
  pm2 restart myapp
else
  echo "Starting new PM2 process..."
  pm2 start app.js --name myapp
fi

# Save PM2 process for auto-restart on reboot
pm2 save
