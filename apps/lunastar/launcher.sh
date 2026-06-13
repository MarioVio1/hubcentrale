#!/bin/bash
cd /home/z/my-project
while true; do
    echo "$(date): Checking server..."
    if ! curl -s http://127.0.0.1:3000/ > /dev/null 2>&1; then
        echo "$(date): Server not responding, restarting..."
        pkill -f "next start" 2>/dev/null
        sleep 1
        NODE_ENV=production node node_modules/.bin/next start -p 3000 &
        sleep 5
    fi
    sleep 3
done
