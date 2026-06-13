#!/bin/bash
# Keep-alive script for Next.js server

cd /home/z/my-project

while true; do
    if ! pgrep -f "next start" > /dev/null; then
        echo "$(date): Starting Next.js production server..."
        NODE_ENV=production node node_modules/.bin/next start -p 3000 &
        sleep 5
    fi
    sleep 2
done
