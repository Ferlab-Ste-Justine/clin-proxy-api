import Cache from 'memcached-promisify'


export default class CacheClient {

    constructor( config, expirationInSeconds = 1800 ) {
        this.instance = new Cache( config, {
            retries: 3,
            timeout: 10000
        } )
        this.expiry = expirationInSeconds
    }

    async ping() {
        return this.create( 'ping', new Date().getTime() )
    }

    async create( key, value, expiration = this.expiry ) {
        return this.instance.set( key, value, expiration )
    }

    async read( key ) {
        return this.instance.get( key )
    }

    async update( key, value, expiration = this.expiry ) {
        return this.instance.get( key, value, expiration )
    }

    async delete( key, value, expiration = this.expiry ) {
        return this.instance.get( key, value, expiration )
    }

}
