# Docker Commands — Dockerfile Video

## Build the image 
docker build -t simple-crud-app .

## Run the container
docker run -p 3000:3000 simple-crud-app

## Run in detached (background) mode
docker run -p 3000:3000 -d simple-crud-app

## Useful commands 

## List running containers
docker ps

## List all containers (including stopped)
docker ps -a

## View logs
docker logs <container-id>

## Stop a container
docker stop <container-id>

## Remove a container
docker rm <container-id>

## Remove the image
docker rmi simple-crud-app
