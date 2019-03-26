# clin-proxy-api

### Development Set-up
* Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md)
* `cp -p local.env .env`
* `npm install -g pnpm`
* `pnpm install -g pnpm`
* `pnpm install`

#### Available Scripts

* `pnpm start` will run all of the Services in development mode.<br>
* `pnpm run build` will build all of the Services for production mode.<br>
* `pnpm run service-auth` will start the Auth API Service in production mode.<br>
* `pnpm run service-query` will start the Query API Service in production mode.<br>
* `pnpm test` will launch [newman](https://github.com/postmanlabs/newman) and runs Postman collections

#### API Service Creation
Please refer to `src/services/api/boilerplate`

### Production Set-up
* `pnpm install`
* `pnpm run build`
* `pnpm run service-auth`
