#!/usr/bin/env bash

docker service scale qa-proxy-api_meta=0
docker service scale qa-proxy-api_meta=2
