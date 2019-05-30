import errors from 'restify-errors'


const example = ( req, res ) => {

    return new errors.NotImplementedError( 'v3' )

}


export default {
    example
}
