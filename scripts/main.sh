#!/bin/bash

echo "Running go test..."
go test -v -coverprofile=coverage.txt ./...
echo "Parsing coverage file..."
echo "Pushing coverage to Prometheus..."