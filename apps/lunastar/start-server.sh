#!/bin/bash
# Wrapper script to keep Next.js server alive
cd /home/z/my-project

while true; do
    echo "Starting Next.js server..."
    bun run dev
    EXIT_CODE=$?
    echo "Server exited with code $EXIT_CODE"
    echo "Restarting in 2 seconds..."
    sleep 2
done
