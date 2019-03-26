# clin-proxy-api

### Development Set-up
* Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md)
* `cp -p local.env .env`
* `npm install -g pnpm`
* `pnpm install -g pnpm`
* `pnpm install`

#### Available Scripts

* `pnpm start` will run all of the Services in development mode.<br>
* `pnpm build` will build all of the Services for production mode.<br>
* `pnpm run service-auth` will start the Auth API Service in production mode.<br>
* `pnpm run service-query` will start the Query API Service in production mode.<br>
* `pnpm test` will launch [newman](https://github.com/postmanlabs/newman) and runs Postman collections

#### API Service Creation
Please refer to `src/services/api/boilerplate`

### Production Set-up
* `pnpm install`
* `pnpm run build`
* `pnpm run service-auth`

###Docker

Update docker.env for keycloack,

then run:
```
For Local env:
docker-compose up

For swarm:
docker swarm init (on master node)
(on another node)
docker swarm join --token SWMTKN-1-05mkbqs1dcxl3r6umbx0dqygz0ius3wxnw9ko9mddyy3vycz0s-2vqxt00dvmeztut58d08k2xh5 10.10.0.15:2377
docker run -it -d -p 108080:8080 -v /var/run/docker.sock:/var/run/docker.sock dockersamples/visualizer
or
docker service create --name=viz --publish=18080:8080/tcp --constraint=node.role==manager \
  --mount=type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock dockersamples/visualizer
  
docker build . -t chusj/clin-api
docker images
docker tag ID chusj/clin-api
docker push chusj/clin-api
docker stack deploy -c docker-compose.yml clin

```