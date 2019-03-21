import Cache from 'memcached-promisify'


class CacheClient {

    constructor( config, options = {}, expirationInSeconds = 1800 ) {
        this.instance = new Cache( config, options )
        this.expiry = expirationInSeconds
    }

    create( key, value, expiration = this.expiry ) {
        return this.instance.set( key, value, expiration )
    }

    read( key, value ) {
        return this.instance.get( key, value )
    }

    update( key, value, expiration = this.expiry ) {
        return this.instance.get( key, value, expiration )
    }

    delete( key, value, expiration = this.expiry ) {
        return this.instance.get( key, value, expiration )
    }

}

export default CacheClient
