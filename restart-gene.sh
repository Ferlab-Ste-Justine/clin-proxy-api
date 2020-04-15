#!/usr/bin/env bash

docker service scale qa-proxy-api_gene=0
docker service scale qa-proxy-api_gene=2
