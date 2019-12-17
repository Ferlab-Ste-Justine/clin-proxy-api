#!/usr/bin/env bash

docker service scale qa-proxy-api_patient=0
docker service scale qa-proxy-api_patient=2
