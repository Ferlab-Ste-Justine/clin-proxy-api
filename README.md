# CLIN Proxy API

### Creating Services

##### Boilerplate

`src/services/api/boilerplate`

##### Default Endpoints

* `GET` on `/{endpoint}/health` returns a health check for the service endpoint
* `GET` on `/{endpoint}/docs` returns the documentation for the service endpoint

### Available Scripts

* `pnpm start` launches of the Services in development mode.<br>
* `pnpm run build` builds all of the Services for production mode.<br>
* `pnpm run service-auth` starts the Auth API Service in production mode.<br>
* `pnpm run service-query` starts the Query API Service in production mode.<br>
* `pnpm test` start functional tests using  [newman](https://github.com/postmanlabs/newman) through Postman collections

### Development Set-up

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p development.env .env
npm install -g pnpm
pnpm install
pnpm start
```

##### Keycloak Set-up

- Install Docker
- Use `docker-compose` as described in this [repository](https://github.com/cr-ste-justine/devops/tree/dev/Keycloak)
- Log into Keycloak

### Production Set-up

##### Manual Mode

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p production.env .env
npm install -g pnpm
pnpm install
pnpm run build
pnpm run service-auth
```

##### Docker Mode

`cp -p docker.env .env`

###### Local Environment

`docker-compose up`

###### Pushing Changes to DockerHub

```
docker login
docker build . --tag=chusj/clin-proxy-api-{endpoint}-service
docker images [TAKE THE LATEST ID)
docker tag [LATEST ID] chusj/clin-proxy-api-{endpoint}-service:latest
docker push
```
