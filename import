#!/bin/bash
docker exec -i wordpress-db-1 \
  sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" wordpress' < backup.sql