cp docker.local.env auth.env;
cp docker.local.env patient.env;
cp docker.local.env variant.env;
cp docker.local.env meta.env;
cp docker.local.env gene.env;
PROXY_NETWORK_EXISTS=$(docker network ls | grep proxy)
if [ -z "$PROXY_NETWORK_EXISTS" ]; then
    docker network create -d overlay --attachable proxy;
fi
AIDBOX_NETWORK_EXISTS=$(docker network ls | grep aidbox)
if [ -z "$AIDBOX_NETWORK_EXISTS" ]; then
    docker network create -d overlay --attachable aidbox;
fi
docker network create -d overlay --attachable clinnet;
docker build -f Dockerfile-auth -t localhost:5000/clin-proxy-api-auth-service .;
docker build -f Dockerfile-patient -t localhost:5000/clin-proxy-api-patient-service .;
docker build -f Dockerfile-variant -t localhost:5000/clin-proxy-api-variant-service .;
docker build -f Dockerfile-meta -t localhost:5000/clin-proxy-api-meta-service .;
docker build -f Dockerfile-gene -t localhost:5000/clin-proxy-api-gene-service .;
docker stack deploy -c docker-compose.yml clin-proxy;
