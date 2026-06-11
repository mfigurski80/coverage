#!/bin/bash

# Exit on error
set -e

# 1. Build the action
echo "Building the action..."
npm run build

# 2. Start Prometheus Pushgateway
echo "Starting Prometheus Pushgateway..."
docker run -d --name pushgateway -p 9091:9091 prom/pushgateway

# 3. Create dummy coverage file
echo "Creating dummy coverage file..."
echo 'mode: set' > coverage.txt
echo 'github.com/owner/repo/package1/file1.go:10.5,12.5 1 0' >> coverage.txt
echo 'github.com/owner/repo/package1/file2.go:15.1,17.2 2 1' >> coverage.txt
echo 'github.com/owner/repo/package2/file3.go:8.1,10.2 1 1' >> coverage.txt

# 4. Run the action
echo "Running the action..."
export INPUT_PROMETHEUS_ENDPOINT='http://localhost:9091'
export INPUT_LABELS='branch=local-debug,actor=local'
export GITHUB_WORKSPACE=$(pwd)
export GITHUB_JOB='local-job'
export GITHUB_REPOSITORY='owner/repo'

node dist/index.js

# 5. Get metrics and stop and remove Prometheus Pushgateway
echo "Fetching metrics from Pushgateway..."
sleep 2 # a small delay to ensure metrics are processed
curl http://localhost:9091/metrics

echo "Stopping and removing Prometheus Pushgateway..."
docker logs pushgateway
docker stop pushgateway
docker rm pushgateway

echo "Local test finished."
