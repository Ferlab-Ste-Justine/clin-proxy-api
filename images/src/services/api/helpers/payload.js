const statusCodeMapping = {
    200: 'Ok',
    201: 'Created',
    204: 'NoContent',
    400: 'BadRequest',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'NotFound',
    500: 'InternalError',
    501: 'NotImplemented'
}

export default ( req, res, body ) => {
    const response = {
        timestamp: new Date().getTime()
    }

    if ( body instanceof Error ) {
        response.error = statusCodeMapping[ res.statusCode ] || 'Error'
        const contents = body.body || body,
            messages = contents.message.split( ',' )

        response.data = { messages: messages[ 0 ] !== '' ? messages : [] }
    } else {
        response.message = statusCodeMapping[ res.statusCode ] || 'Ok'
        response.data = body
    }

    const finalResponse = JSON.stringify( response )

    res.header( 'Content-Length', Buffer.byteLength( finalResponse ) )
    res.header( 'Content-Type', 'application/json' )

    return finalResponse
}
