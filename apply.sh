export DEFAULT_PROD_VERSION=1.3.10
docker stack deploy --prune -c docker-compose.yml qa-proxy-api
