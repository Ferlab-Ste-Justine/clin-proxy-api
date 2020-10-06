![](https://github.com/Ferlab-Ste-Justine/clin-proxy-api/workflows/Build%20Images/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-proxy-api/workflows/Publish%20Images%20Using%20Commit%20Hash/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-proxy-api/workflows/Publish%20Images%20Using%20Tag/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-proxy-api/workflows/Lint%20Check/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/clin-proxy-api/workflows/Dependencies%20Security%20Audit/badge.svg)

# CLIN Proxy API

## Creating Services

### Boilerplate

`app/src/services/api/boilerplate`

###  Default Endpoints

* `GET` on `/{endpoint}/health` returns a health check for the service endpoint
* `GET` on `/{endpoint}/docs` returns the documentation for the service endpoint ( https://editor.swagger.io )

## Available Scripts

From the **app** directory:

* `pnpm start` launches of the Services in local development mode.<br>
* `pnpm test` launches all test runners using .env file.<br>
* `pnpm run functional-tests` start functional tests using  [newman](https://github.com/postmanlabs/newman) through Postman collections
* `pnpm run unit-tests` start unit tests using  [mocha](https://www.npmjs.com/package/mocha)
* `pnpm run build` builds all of the Services for production mode.<br>
* `pnpm run service-patient` starts the Patient API Service in production (built) mode.<br>
* `pnpm run service-variant` starts the Variant API Service in production (built) mode.<br>
* `pnpm run service-gene` starts the Gene API Service in production (built) mode.<br>
* `pnpm run service-meta` starts the Meta API Service in production (built) mode.<br>
* `pnpm run dev-service-xyz` launches specified service in docker development mode.<br>

## Development Set-up

### Directly on Computer

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
./launch-local.sh
```

### Dockerized Version

- Make sure that a network named **proxy** exists on your machine
- Make sure the following services are running on the **proxy** network with the corresponding names and ports (alternatively, you can edit the **docker.local.env** file to change the values):
  - keycloak which should be named **keycloak** on port **8080** (http)
  - elasticsearch which should be named **elastic** on port **9200**
- Run the following to launch:
```
./launch-docker-local.sh
```
- Run the following to tear down:
```
./teardown-docker-local.sh
```

### ElasticSearch Set-up

To create the 'statement' and 'profile' indices, run the following command line where ElasticSearch is available (ssh -L or ssh thru environment)

```
curl -XPUT "http://localhost:9200/statement" -H 'Content-Type: application/json' -d @clin-statement-centric.json
curl -XPUT "http://localhost:9200/profile" -H 'Content-Type: application/json' -d @clin-profile-centric.json
```

## CI/CD Workflow

### Pushing images

See the documentation for our convention on gitflow and docker images: https://www.notion.so/ferlab/Developer-Handbook-ca9d689d8aca4412a78eafa2dfa0f8a8

This repo follows it.

### Deployments

Updates to the QA environment are automatically done once a new image is pushed. No action is required.

Procedures to deploy to prod will be fleshed out once we have such an environment.