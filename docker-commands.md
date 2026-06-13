# Docker Volumes

## PART 1 - THE PROBLEM
- Data is stored inside the container filesystem.
- When the container is removed, all data is gone forever.

#### Start MySQL WITHOUT a volume
```
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8
```

Load schema and add some books via the API, then... Kill and remove the container.
```
docker rm -f mysql-db
```

### Start a fresh MySQL container
```
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  --network crud-network \
  -d mysql:8
```

### Load schema again - all previous data is gone
```
docker exec -i mysql-db mysql -uroot -ppassword library < init.sql
```

## PART 2 - THE SOLUTION
Named volume - data lives on the host, survives container removal.

#### Clean up
```
docker rm -f mysql-db crud-backend
docker network rm crud-network
```

#### STEP 1 : Create the network
```
docker network create crud-network
```

#### STEP 2 : Run MySQL WITH a named volume
```
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  --network crud-network \
  -d mysql:8
```

#### STEP 3 : Wait for MySQL - watch until "ready for connections"
```
docker logs -f mysql-db
```

#### STEP 4 : Load the schema
```
docker exec -i mysql-db mysql -uroot -ppassword library < init.sql
```

#### STEP 5 : Run the backend
```
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

#### Add some books via the API, then remove mysql-db...
```
docker rm -f mysql-db
```

#### Restart it with the same volume - data is back
```
docker run \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=library \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  --network crud-network \
  -d mysql:8
```

### USEFUL COMMANDS

#### List all volumes
```
docker volume ls
```

#### Inspect a volume (see mount point on host)
```
docker volume inspect mysql-data
```

#### Remove everything including the volume (deletes all data)
```
docker rm -f crud-backend mysql-db
docker volume rm mysql-data
docker network rm crud-network
```
