#!/usr/bin/env bash
# Build auth,patient and variant  service
docker-compose build

docker push localhost:5000/clin-proxy-api-auth-service:latest
docker push localhost:5000/clin-proxy-api-patient-service:latest
docker push localhost:5000/clin-proxy-api-variant-service:latest


docker tag localhost:5000/clin-proxy-api-auth-service:latest localhost:5000/clin-proxy-api-auth-service:${1}
docker tag localhost:5000/clin-proxy-api-patient-service:latest localhost:5000/clin-proxy-api-patient-service:${1}
docker tag localhost:5000/clin-proxy-api-auth-service:latest localhost:5000/clin-proxy-api-variant-service:${1}

docker push localhost:5000/clin-proxy-api-auth-service:${1}
docker push localhost:5000/clin-proxy-api-patient-service:${1}
docker push localhost:5000/clin-proxy-api-variant-service:${1}

docker service update qa-proxi-api_auth --image localhost:5000/clin-proxy-api-auth-service:${1}
docker service update qa-proxi-api_patient --image localhost:5000/clin-proxy-api-patient-service:${1}
docker service update qa-proxi-api_variant --image localhost:5000/clin-proxy-api-variant-service:${1}