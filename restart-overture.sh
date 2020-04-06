#!/usr/bin/env bash

docker service scale qa-proxy-api_overture=0
docker service scale qa-proxy-api_overture=2
