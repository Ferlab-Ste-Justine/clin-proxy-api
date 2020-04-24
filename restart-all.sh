#!/usr/bin/env bash

docker service scale qa-proxy-api_auth=0
docker service scale qa-proxy-api_auth=2
docker service scale qa-proxy-api_patient=0
docker service scale qa-proxy-api_patient=2
docker service scale qa-proxy-api_meta=0
docker service scale qa-proxy-api_meta=2
docker service scale qa-proxy-api_variant=0
docker service scale qa-proxy-api_variant=2
docker service scale qa-proxy-api_gene=0
docker service scale qa-proxy-api_gene=2
