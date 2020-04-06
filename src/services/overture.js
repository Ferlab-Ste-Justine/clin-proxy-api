import rp from 'request-promise-native'


export default class OvertureClient {

    constructor( config ) {
        this.songHost = config.song.host
        this.scoreHost = config.score.host
        this.songExtraOptions = config.song.extraOptions || {}
        this.scoreExtraOptions = config.score.extraOptions || {}
    }

    async pingSong() {
        // @NOTE Song healthcheck
        return rp( Object.assign( this.songExtraOptions, {
            method: 'GET',
            uri: `${this.songHost}`
        } ) )
    }

    async pingScore() {
        // @NOTE Score healthcheck
        return rp( Object.assign( this.scoreExtraOptions, {
            method: 'GET',
            uri: `${this.scoreHost}`
        } ) )
    }

    async getSomethingFromScore() {
        return rp( Object.assign( this.scoreExtraOptions, {
            method: 'GET',
            uri: `${this.scoreHost}/somethings-are-things-sometimes-i-guess`
        } ) )
    }

}
