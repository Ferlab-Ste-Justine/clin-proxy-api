import Cache from 'memcached-promisify'


export default class CacheClient {

    constructor( config, expirationInSeconds = 1800 ) {
        this.instance = new Cache( config, {
            retries: 2,
            timeout: 2500
        } )
        this.expiry = expirationInSeconds
    }

    async create( key, value, expiration = this.expiry ) {
        return this.instance.set( key, value, expiration )
    }

    async read( key, value ) {
        return this.instance.get( key, value )
    }

    async update( key, value, expiration = this.expiry ) {
        return this.instance.get( key, value, expiration )
    }

    async delete( key, value, expiration = this.expiry ) {
        return this.instance.get( key, value, expiration )
    }

}
