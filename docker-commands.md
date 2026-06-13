# Docker Compose

## THE PROBLEM
- After 3 videos we have 5+ manual docker commands to run every time.
- Hard to share, easy to forget a flag, no single source of truth.
- Everything below used to require these separate commands:
  ```
    docker network create crud-network
    docker run --name mysql-db -e ... --network crud-network -v ... -d mysql:8
    docker exec -i mysql-db mysql ... < init.sql
    docker build -t simple-crud-app .
    docker run --name crud-backend -e ... --network crud-network -d simple-crud-app
  ```

## THE SOLUTION - docker-compose.yml
One file defines the entire stack. One command runs it all.

#### STEP 1 : Start the entire stack (builds image if needed)
```
docker compose up -d
```
#### STEP 2 : Check all services are running
```
docker compose ps
```
#### STEP 3 : View logs for all services at once
```
docker compose logs -f
```
#### View logs for a specific service only
```
docker compose logs -f backend
docker compose logs -f mysql-db
```

## USEFUL COMMANDS

#### Rebuild the backend image (after code changes)
```
docker compose up -d --build
```
#### Stop all services (containers removed, volume + network kept)
```
docker compose down
```
#### Stop + remove the named volume (⚠ deletes all DB data)
```
docker compose down -v
```
#### Restart a single service
```
docker compose restart backend
```
