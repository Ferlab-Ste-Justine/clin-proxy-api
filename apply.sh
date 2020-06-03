export DEFAULT_PROD_VERSION=1.4.0
docker stack deploy --prune -c docker-compose.yml qa-proxy-api
