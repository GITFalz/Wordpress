#!/bin/bash

# Export database
./export-db.sh

# Stop services
docker-compose down