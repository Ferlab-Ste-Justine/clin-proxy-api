const payloadFormatter = (req, res, body) => {
    let response

    if (body instanceof Error) {
        const isError = res.statusCode >= 400 && res.statusCode < 500
        if (isError) {
            response = {
                code: body.code,
                error: 'ERROR',
            }
        } else {
            response = {
                code: body.code,
                error: 'INTERNAL_SERVER_ERROR',
            }
        }
    }

    response = {
        code: body.code,
        message: 'OK',
        data: body
    }

    response = JSON.stringify(response)
    res.header('Content-Length', Buffer.byteLength(response))
    res.header('Content-Type', 'application/json')

    return response
}

module.exports = payloadFormatter
