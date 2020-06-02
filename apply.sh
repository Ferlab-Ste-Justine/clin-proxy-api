export DEFAULT_PROD_VERSION=1.3.12
docker stack deploy --prune -c docker-compose.yml qa-proxy-api
