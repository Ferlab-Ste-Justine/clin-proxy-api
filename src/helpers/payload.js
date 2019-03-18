const payloadFormatter = (req, res, body) => {
    let response

    if (body instanceof Error) {
        const isError = res.statusCode >= 400 && res.statusCode < 500
        if (isError) {
            response = {
                error: 'ERROR',
                code: body.code,
            }
        } else {
            response = {
                error: 'INTERNAL_SERVER_ERROR',
                code: body.code,
            }
        }
    }

    response = {
        data: body
    }

    response = JSON.stringify(response)
    res.header('Content-Length', Buffer.byteLength(response))
    res.header('Content-Type', 'application/json')

    return response
}

module.exports = payloadFormatter
