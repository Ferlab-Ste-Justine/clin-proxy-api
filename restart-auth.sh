#!/usr/bin/env bash

docker service scale qa-proxy-api_auth=0
docker service scale qa-proxy-api_auth=2
