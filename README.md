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
- Log into Keycloak as `admin`
- Add a Realm named `clin`
  - Enable `Login with email`
- Create a client called `clin-proxy-api`
  - Disable `Standard Flow Enabled` in Settings
  - Enable `Authorization Enabled` in Settings
  - Enable `Direct Access Grants` in Settings
  - Enable `Service Accounts` in Settings
  - Enable `Exclude Session State From Authentication Response` in Settings under OpenID Connect Compatibility Modes
  - Set `Access Token Lifespan` to X minutes in Settings > Advanced Settings
  - Disable `OAuth 2.0 Mutual TLS Certificate Bound Access Tokens Enabled` in Settings > Advanced Settings
- Find your `secret` under Client > Credentials and update the `.env` file
- Create an Identity Provider
  - Enable `Trust Email` in Settings
  - Set the Client ID to `clin-proxy-api` in Settings under OpenID Connect Config
  - Set the Client Secret to found `secret` under Client > Credentials
  - Set Prompt to `none` in Settings under OpenID Connect Config
- Create a User
  - Set an email
  - Set a non-temporary password under Credentials > Manage Password

##### ElasticSearch Set-up
To create the index 'statement', run the following command line where ElasticSearch is available (ssh -L or ssh thru environment)

```curl -XPUT "http://localhost:9200/statement" -H 'Content-Type: application/json' -d @clin-meta-centric.json```

### Production Set-up

#### Manual Mode

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p production.env .env
npm install -g pnpm
pnpm install
pnpm run build
pnpm run service-auth
```

#### Docker Mode

```
# Create the proxy network to connect all necessary services together
docker network create -d overlay --attachable proxy
# Install on all box sshfs docker volume pluggin
docker plugin install vieux/sshfs DEBUG=1 sshkey.source=/home/ubuntu/.ssh/
# (Optional) Tot test the sshvolume with vieux/sshfs (does not work on macosx)
# Create the volumen sshvolume on all box
docker volume create -d vieux/sshfs -o sshcmd=ubuntu@10.10.0.19:/home/ubuntu/sshvolume/certbot/conf -o allow_other sshvolume
# To Test (does not work on docker for macosx)
docker run -it -v sshvolume:/sshvolume busybox ls /sshvolume
```

###### Local Environment

```
cp -p docker.env auth.env
cp -p docker.env patient.env
```

`docker-compose up --build` to rebuild images

or
```Edit docker-compose to comment sshfs docker volume and uncomment local volume```

`docker-compose up`

```
docker stack deploy -c docker-compiose.yml qa-proxi-api

```

###### Build and Push and deploy the first time  Qa/Prod

```
copy docker.env patient.env
copy docker.env auth.env
nano patient.env  -- fix environment
nano auth.env -- fix environment
docker-compose build 
docker push localhost:5000/clin-proxy-api-auth-service:latest
docker push localhost:5000/clin-proxy-api-patient-service:latest
docker tag localhost:5000/clin-proxy-api-auth-service:latest localhost:5000/clin-proxy-api-auth-service:1.0
docker tag localhost:5000/clin-proxy-api-patient-service:latest localhost:5000/clin-proxy-api-patient-service:1.0
docker push localhost:5000/clin-proxy-api-auth-service:1.0
docker push localhost:5000/clin-proxy-api-patient-service:1.0
docker stack deploy -c docker-compose.yml qa-proxy-api
docker service update qa-proxi-api_auth --image localhost:5000/clin-proxy-api-auth-service:1.0
docker service update qa-proxi-api_patient --image localhost:5000/clin-proxy-api-patient-service:1.0


```

#### Update a service to another version i.e. (1.1)

```
copy docker.env patient.env
copy docker.env auth.env
nano patient.env  -- fix environment
nano auth.env -- fix environment
docker-compose build
docker tag localhost:5000/clin-proxy-api-auth-service:latest localhost:5000/clin-proxy-api-auth-service:1.2.0
docker tag localhost:5000/clin-proxy-api-patient-service:latest localhost:5000/clin-proxy-api-patient-service:1.2.0
docker push localhost:5000/clin-proxy-api-auth-service:1.2.0
docker push localhost:5000/clin-proxy-api-patient-service:1.2.0
docker service update qa_auth --image localhost:5000/clin-proxy-api-auth-service:1.2.0
docker service update qa_patient --image localhost:5000/clin-proxy-api-patient-service:1.2.0
```
To scale the service up or down...
```
docker service scale qa-proxi-api_auth=3
docker service scale qa-proxi-api_patient=3
or
use portainer (port 9000)
```
