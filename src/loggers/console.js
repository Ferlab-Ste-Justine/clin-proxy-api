const util = require( 'util' )
const chalk = require( 'chalk' )

class Logger {

    constructor( namespace, level = 'normal' ) {
        this.namespace = namespace
        this.level = level
        if ( this.namespace.length < 24 ) {
            this.namespace += ' '.repeat( 24 - this.namespace.length )
        }
    }

    _log( color, message ) {
        console.log(chalk[color](chalk.bold(this.namespace) + ' ' + message)) // eslint-disable-line
    }

    success( message ) {
        this._log( 'green', message )
    }

    warning( message ) {
        this._log( 'yellow', message )
    }

    error( message ) {
        this._log( 'red', message )
    }

    info( message ) {
        if ( [ 'info', 'debug' ].indexOf( this.level ) !== -1 ) {
            this._log( 'cyan', message )
        }
    }

    debug( message ) {
        if ( this.level === 'debug' ) {
            this._log( 'grey', message )
        }
    }

}

module.exports = Logger
