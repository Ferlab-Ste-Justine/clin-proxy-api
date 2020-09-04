import errors from 'restify-errors'


const example = () => {

    return new errors.NotImplementedError( 'v3' )

}


export default {
    example
}
