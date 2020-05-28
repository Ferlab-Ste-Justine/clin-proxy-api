![](https://github.com/cr-ste-justine/clin-proxy-api/workflows/Build%20Images/badge.svg)
![](https://github.com/cr-ste-justine/clin-proxy-api/workflows/Publish%20Images/badge.svg)

# CLIN Proxy API

### Creating Services

##### Boilerplate

`src/services/api/boilerplate`

##### Default Endpoints

* `GET` on `/{endpoint}/health` returns a health check for the service endpoint
* `GET` on `/{endpoint}/docs` returns the documentation for the service endpoint ( https://editor.swagger.io )

### Available Scripts

* `pnpm start` launches of the Services in local development mode.<br>
* `pnpm test` launches all test runners using .env file.<br>
* `pnpm run functional-tests` start functional tests using  [newman](https://github.com/postmanlabs/newman) through Postman collections
* `pnpm run unit-tests` start unit tests using  [mocha](https://www.npmjs.com/package/mocha)
* `pnpm run build` builds all of the Services for production mode.<br>
* `pnpm run service-auth` starts the Auth API Service in production (built) mode.<br>
* `pnpm run service-patient` starts the Patient API Service in production (built) mode.<br>
* `pnpm run service-variant` starts the Variant API Service in production (built) mode.<br>
* `pnpm run service-gene` starts the Gene API Service in production (built) mode.<br>
* `pnpm run service-meta` starts the Meta API Service in production (built) mode.<br>
* `pnpm run dev-service-xyz` launches specified service in docker development mode.<br>

### Development Set-up

#### Directly on Computer

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p development.env .env
npm install -g pnpm
pnpm install
pnpm start
```

#### Dockerized Version

Run the following to launch:

```
./launch-docker-local.sh
```

Run the following to tear down:

```
./teardown-docker-local.sh
```

If your browser is giving you issues with https on localhost:

Note that the clin resulting services will also have certificates for the **dev.chusj-clin-dev.org** domain. You just have to add the following entry in your **/etc/hosts** file:

```
127.0.1.1       dev.chusj-clin-dev.org
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
To create the 'statement' and 'profile' indices, run the following command line where ElasticSearch is available (ssh -L or ssh thru environment)

The delete is because the devops have decided to own elasticsearch and pre-configure settings which make the creation of the index crash 
```shell script
curl -XDELETE "http://localhost:9200/statement"
curl -XDELETE "http://localhost:9200/profile"

curl -XPUT "http://localhost:9200/statement" -H 'Content-Type: application/json' -d @clin-statement-centric.json
curl -XPUT "http://localhost:9200/profile" -H 'Content-Type: application/json' -d @clin-profile-centric.json
```

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
# Create the proxy & clinnet network to connect all necessary services together
docker network create -d overlay --attachable proxy
docker network create -d overlay --attachable clinnet
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
./apply.sh
```

#### Update a service to another version i.e. (1.1)

Edit the **docker-compose.yml** and **apply.sh** script so that your desired version is deployed for each service (they point to the same version by default, they don't need to if you need to rollback a particular service) with the number of replicas you want.


```
copy docker.env patient.env
copy docker.env auth.env
nano patient.env  -- fix environment
nano auth.env -- fix environment
./apply.sh
```

### CI/CD Workflow

#### Pushing images

Images are pushed by merging on master. The version tag is taken from the version in the package.json file so make sure you increment it before merging to master.

If you add a new service, make sure to add the building and pushing of its image to the **push_images.sh** script and its orchestration in the **docker-compose.yml** file.
