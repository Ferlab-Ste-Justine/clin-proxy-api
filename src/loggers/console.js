const util  = require('util')
const chalk = require('chalk')

class Logger {

    constructor(namespace) {
        if (namespace.length < 24) {
            namespace += ' '.repeat(24 - namespace.length)
        }

        this.namespace = namespace
    }

    _log(color, message) {
        console.log(chalk[color](chalk.bold(this.namespace) + ' ' + message)) // eslint-disable-line
    }

    error(message, error) {
        this._log('red', message)
        if (error) {
            this._log('red', error)
        }
    }

    info(message, object) {
        this._log('cyan', message)
        if (object && this.debug) {
            this._log('grey', util.inspect(object))
        }
    }

    success(message) {
        this._log('green', message)
    }

    verbose(message) {
        if (this.debug) {
            this._log('grey', message)
        }
    }

    warning(message) {
        this._log('yellow', message)
    }

}

module.exports = Logger
