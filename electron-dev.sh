#!/bin/bash

# Start Angular dev server in background
npm start &
ANGULAR_PID=$!

# Wait for Angular to be ready
echo "Waiting for Angular dev server..."
sleep 5

# Start Electron
echo "Starting Electron..."
NODE_ENV=development electron .

# When Electron exits, kill Angular
kill $ANGULAR_PID