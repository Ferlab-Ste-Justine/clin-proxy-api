#!/usr/bin/env bash
# Build auth, patient, variant and meta services
docker-compose build

docker push localhost:5000/clin-proxy-api-auth-service:latest
docker push localhost:5000/clin-proxy-api-patient-service:latest
docker push localhost:5000/clin-proxy-api-variant-service:latest
docker push localhost:5000/clin-proxy-api-meta-service:latest
docker push localhost:5000/clin-proxy-api-overture-service:latest

docker tag localhost:5000/clin-proxy-api-auth-service:latest localhost:5000/clin-proxy-api-auth-service:${1}
docker tag localhost:5000/clin-proxy-api-patient-service:latest localhost:5000/clin-proxy-api-patient-service:${1}
docker tag localhost:5000/clin-proxy-api-variant-service:latest localhost:5000/clin-proxy-api-variant-service:${1}
docker tag localhost:5000/clin-proxy-api-meta-service:latest localhost:5000/clin-proxy-api-meta-service:${1}
docker tag localhost:5000/clin-proxy-api-overture-service:latest localhost:5000/clin-proxy-api-overture-service:${1}

docker push localhost:5000/clin-proxy-api-auth-service:${1}
docker push localhost:5000/clin-proxy-api-patient-service:${1}
docker push localhost:5000/clin-proxy-api-variant-service:${1}
docker push localhost:5000/clin-proxy-api-meta-service:${1}
docker push localhost:5000/clin-proxy-api-overture-service:${1}

docker service update qa-proxy-api_auth --image localhost:5000/clin-proxy-api-auth-service:${1}
docker service update qa-proxy-api_patient --image localhost:5000/clin-proxy-api-patient-service:${1}
docker service update qa-proxy-api_variant --image localhost:5000/clin-proxy-api-variant-service:${1}
docker service update qa-proxy-api_meta --image localhost:5000/clin-proxy-api-meta-service:${1}
docker service update qa-proxy-api_overture --image localhost:5000/clin-proxy-api-overture-service:${1}
