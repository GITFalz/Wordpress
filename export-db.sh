#!/bin/bash
docker exec wordpress-db-1 \
  sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" wordpress' > backup.sql