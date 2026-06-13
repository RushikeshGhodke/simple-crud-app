# Docker Commands — Networking Video

# ─────────────────────────────────────────────────────────────────────────────
# PART 1 — THE PROBLEM
# Run both containers WITHOUT a custom network and watch them fail to connect.
# ─────────────────────────────────────────────────────────────────────────────

# Run MySQL on the default network
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  -d mysql:8

# Build the backend image
docker build -t simple-crud-app .

# Run the backend — DB_HOST=mysql-db will fail (name not resolvable)
docker run \
  --name crud-backend \
  -e PORT=3000 \
  -e DB_HOST=mysql-db \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=library \
  -p 3000:3000 \
  -d simple-crud-app

# Observe the failure
docker logs crud-backend


# ─────────────────────────────────────────────────────────────────────────────
# PART 2 — THE SOLUTION
# Custom bridge network — containers resolve each other by container name.
# ─────────────────────────────────────────────────────────────────────────────

# Clean up the failed containers first
docker rm -f crud-backend mysql-db

# STEP 1 : Create a custom bridge network
docker network create crud-network

# STEP 2 : Run MySQL on the custom network
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8

# STEP 3 : Wait for MySQL — watch until "ready for connections"
docker logs -f mysql-db

# STEP 4 : Load the schema
docker exec -i mysql-db mysql -uroot -ppassword library < init.sql

# STEP 5 : Run the backend on the same network
docker run \
  --name crud-backend \
  -e PORT=3000 \
  -e DB_HOST=mysql-db \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=library \
  -p 3000:3000 \
  --network crud-network \
  -d simple-crud-app

# STEP 6 : Verify
docker ps
docker logs crud-backend


# ─────────────────────────────────────────────────────────────────────────────
# USEFUL COMMANDS
# ─────────────────────────────────────────────────────────────────────────────

# List all networks
docker network ls

# Inspect the network (see which containers are on it)
docker network inspect crud-network

# Open a MySQL shell
docker exec -it mysql-db mysql -uroot -ppassword library

# Stop and remove everything
docker rm -f crud-backend mysql-db
docker network rm crud-network
