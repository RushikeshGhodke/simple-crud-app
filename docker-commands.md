Docker Commands — Volumes

This guide demonstrates **why Docker volumes are needed** for persistent data and how to use a **named volume** with MySQL.

---

## Part 1 — The Problem

Without a volume, data is stored inside the **container's writable filesystem**.

When the container is removed, the data stored inside it is also removed.

### 1. Start MySQL Without a Volume

```bash
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8
```

Load the schema and add some books through the API.

Then remove the container:

```bash
docker rm -f mysql-db
```

### 2. Start a Fresh MySQL Container

```bash
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8
```

Load the schema again:

```bash
docker exec -i mysql-db mysql -uroot -ppassword library < init.sql
```

The previous data is gone. ❌

### Why?

The data was stored inside the original MySQL container.

```text
Container
└── /var/lib/mysql
    ├── databases
    ├── tables
    └── data
```

When the container was removed, its filesystem was removed as well.

---

# Part 2 — The Solution

## Docker Named Volumes

A **named volume** stores data outside the container's writable filesystem.

The container can be removed and recreated, while the data in the volume remains available.

```text
Host
└── Docker Volume: mysql-data
    └── /var/lib/mysql
        ├── databases
        ├── tables
        └── data
```

---

## Step 1 — Clean Up

Remove the existing containers and network:

```bash
docker rm -f mysql-db crud-backend
docker network rm crud-network
```

> If the containers or network don't exist, Docker may print an error. That's okay.

---

## Step 2 — Create the Network

```bash
docker network create crud-network
```

---

## Step 3 — Run MySQL With a Named Volume

```bash
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  --network crud-network \
  -d mysql:8
```

The important part is:

```bash
-v mysql-data:/var/lib/mysql
```

This mounts the Docker volume `mysql-data` to MySQL's data directory:

```text
mysql-data
    ↓
/var/lib/mysql
```

---

## Step 4 — Wait for MySQL

Watch the MySQL logs:

```bash
docker logs -f mysql-db
```

Wait until MySQL reports:

```text
ready for connections
```

Press `Ctrl+C` to stop following the logs.

> Pressing `Ctrl+C` here only stops `docker logs -f`; it does **not** stop the MySQL container.

---

## Step 5 — Load the Schema

```bash
docker exec -i mysql-db \
  mysql -uroot -ppassword library < init.sql
```

---

## Step 6 — Run the Backend

```bash
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
```

Now add some books through the API.

---

# Part 3 — Test Data Persistence

Now let's verify that the volume actually preserves the data.

## 1. Remove the MySQL Container

```bash
docker rm -f mysql-db
```

The MySQL container is gone.

However, the named volume still exists:

```text
mysql-data
    ↓
Your MySQL data
```

---

## 2. Start MySQL Again Using the Same Volume

```bash
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  --network crud-network \
  -d mysql:8
```

MySQL will use the existing data from `mysql-data`.

### Result

Your previously inserted books are still there. ✅

You do **not** need to recreate the database schema or reinsert the data.

---

# Part 4 — Useful Volume Commands

## List All Volumes

```bash
docker volume ls
```

Example:

```text
DRIVER    VOLUME NAME
local     mysql-data
```

---

## Inspect a Volume

```bash
docker volume inspect mysql-data
```

This shows information about the volume, including its mount point on the Docker host.

---

## Remove a Volume

```bash
docker volume rm mysql-data
```

> ⚠️ **Warning:** Removing the volume permanently deletes the data stored in it.

---

# Part 5 — Complete Cleanup

To remove the containers, volume, and network:

```bash
docker rm -f crud-backend mysql-db
docker volume rm mysql-data
docker network rm crud-network
```

> ⚠️ Removing `mysql-data` deletes the MySQL data permanently.

---

# Quick Comparison

| Without Volume                           | With Named Volume                     |
| ---------------------------------------- | ------------------------------------- |
| Data lives inside container              | Data lives in Docker volume           |
| Removing container deletes data          | Removing container preserves data     |
| New container starts with empty database | New container can reuse existing data |
| Not suitable for persistent databases    | Suitable for persistent database data |

---

# Key Concept

The most important command is:

```bash
-v mysql-data:/var/lib/mysql
```

It means:

> **Mount the named Docker volume `mysql-data` at MySQL's data directory `/var/lib/mysql`.**

As long as the volume is not deleted, the data survives container removal and recreation.
