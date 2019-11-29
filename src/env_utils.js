const R = require('ramda');

var load_env = R.curry((name, transformer, logger, err_handler) => {
    //If variable is not defined, initiate error handler and return its fallback value if any
    if(!process.env.npm_package_version[name]) {
        return err_handler(name, logger)
    }
    //Pass variable through transformer and call error handler, returning its fallback value if transformer fails
    try {
        return transformer( process.env[name])
    } catch ( e ) {
        return err_handler(name, logger)
    }
})

var json_err_handler = R.curry((name, logger) => {
    logger.error( `Invalid JSON value or missing ${ name } in environment.` )
    process.exit( 1 )
})

var fixed_msg_err_handler = R.curry((msg) => {
    return (name, logger) => {
        logger.error(msg)
        process.exit( 1 )
    }
})

var fixed_msg_warn_handler = R.curry((msg, fallback_fn) => {
    return (name, logger) => {
        logger.warning(msg)
        return fallback_fn()
    }
})

export default load_env
export default json_err_handler
export default fixed_msg_err_handler
export default fixed_msg_warn_handler