const chalk = require( 'chalk' )

class Logger {

    constructor( namespace, level = 'normal' ) {
        this.namespace = namespace
        this.level = level
        if ( this.namespace.length < 24 ) {
            this.namespace += ' '.repeat( 24 - this.namespace.length )
        }
    }

    async _log( color, message ) {
        console.log(chalk[color](chalk.bold(this.namespace) + ' ' + message)) // eslint-disable-line
    }

    async success( message ) {
        await this._log( 'green', message )
    }

    async warning( message ) {
        await this._log( 'yellow', message )
    }

    async error( message ) {
        await this._log( 'red', message )
    }

    async info( message ) {
        if ( [ 'info', 'debug' ].indexOf( this.level ) !== -1 ) {
            await this._log( 'cyan', message )
        }
    }

    async debug( message ) {
        if ( this.level === 'debug' ) {
            await this._log( 'grey', message )
        }
    }

}

module.exports = Logger
