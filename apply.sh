export DEFAULT_PROD_VERSION=1.3.14
docker stack deploy --prune -c docker-compose.yml qa-proxy-api
