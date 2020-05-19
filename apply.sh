export DEFAULT_PROD_VERSION=1.3.11
docker stack deploy --prune -c docker-compose.yml qa-proxy-api
