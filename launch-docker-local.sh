(cd certificate-generation; docker-compose run ca-certificate-generator; docker-compose run certificate-generator)
cp docker.local.env auth.env;
cp docker.local.env patient.env;
cp docker.local.env variant.env;
cp docker.local.env meta.env;
cp docker.local.env gene.env;
docker build -f Dockerfile-auth -t localhost:5000/clin-proxy-api-auth-service .;
docker build -f Dockerfile-patient -t localhost:5000/clin-proxy-api-patient-service .;
docker build -f Dockerfile-variant -t localhost:5000/clin-proxy-api-variant-service .;
docker build -f Dockerfile-meta -t localhost:5000/clin-proxy-api-meta-service .;
docker build -f Dockerfile-gene -t localhost:5000/clin-proxy-api-gene-service .;
docker stack deploy -c docker-compose-docker-local.yml clin-proxy;
