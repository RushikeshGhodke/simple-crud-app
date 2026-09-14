Docker Commands — Volumes

This guide demonstrates why Docker volumes are important for persistent data, using MySQL as an example.

Part 1 — The Problem

By default, data is stored inside the container's filesystem.

When the container is removed, the data stored inside it is also removed.

Problem: If the MySQL container is deleted, all database data is lost.

1. Start MySQL Without a Volume
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8


Load the schema and add some books via the API.

2. Remove the Container
docker rm -f mysql-db

3. Start a Fresh MySQL Container
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8

4. Load the Schema Again
docker exec -i mysql-db mysql -uroot -ppassword library < init.sql


At this point, the previous data is gone. ❌

Part 2 — The Solution
Use a Named Volume

A named Docker volume stores data outside the container's writable filesystem.

This means the data survives even when the container is removed.

In this example, the MySQL data is stored in:

mysql-data:/var/lib/mysql

1. Clean Up Existing Containers and Network
docker rm -f mysql-db crud-backend
docker network rm crud-network


If the containers or network don't exist, Docker may return an error. That's okay.
