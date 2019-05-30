import errors from 'restify-errors'


const getPatient = ( req, res ) => {

    throw new errors.NotImplementedError( 'getPatient is not implemented' )

}

const searchPatients = ( req, res ) => {

    throw new errors.NotImplementedError( 'searchPatients is not implemented' )

}


export default {
    getPatient,
    searchPatients
}
