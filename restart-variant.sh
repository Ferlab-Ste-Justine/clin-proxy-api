#!/usr/bin/env bash

docker service scale qa-proxy-api_variant=0
docker service scale qa-proxy-api_variant=2
