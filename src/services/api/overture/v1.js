import errors from 'restify-errors'


const getSessionDataFromToken = async ( token, cacheService ) => {
    return await cacheService.read( token.uid )
}

const functionToGetSomethingFromScore = async ( req, res, cacheService, overtureService, logService ) => {
    try {
        const sessionData = await getSessionDataFromToken( req.token, cacheService )
        // @NOTE Request parameters, query string, whatever...
        // const params = req.query || req.params || req.body

        // This is what is in the mysterious sessionData variable:
        const keycloakAccessToken = sessionData.auth.access_token
        const keycloakRefreshToken = sessionData.auth.access_token
        const clinAclFHIRRole = sessionData.acl.fhir.role // 'administrator', 'genetician', 'practitioner'
        const clinAclFHIROrganizationId = sessionData.acl.fhir.organization_id // 'OR00202'
        const clinAclFHIRPractitionerId = sessionData.acl.fhir.practitioner_id // 'PR00601'
        const clinUserUsername = sessionData.user.username // this is an email !
        const clinUserFirstName = sessionData.user.firstName // can be empty
        const clinUserLastName = sessionData.user.lastName // can be empty
        const clinUserGroups = sessionData.user.groups //  [ 'chursj' ]
        const clinUserRoles = sessionData.user.groups //  [ 'clin_administrator' || 'clin_genetician' || 'clin_practitioner' ]

        const response = await overtureService.getSomethingFromScore( keycloakAccessToken )

        /* Dedoded keycloakAccessToken looks like this:
        {
            jti: 'ba2d88a3-bf92-4b1f-8393-88d86b21cceb',
            exp: 1586211470,
            nbf: 0,
            iat: 1586209670,
            iss: 'http://142.1.177.220:8080/auth/realms/clin',
            aud: 'account',
            sub: 'ad68e764-2064-4705-ad6f-a48005a1a0db',
            typ: 'Bearer',
            azp: 'clin-proxy-api',
            auth_time: 0,
            session_state: '86cd56fb-2271-4255-8159-4cfb227f3bf0',
            acr: '1',
            realm_access: {
                roles: [
                    'clin_administrator'
                ]
            },
            resource_access: {
                account: {
                    roles: [
                        'manage-account',
                        'manage-account-links',
                        'view-profile'
                    ]
                }
            },
            scope: 'profile',
            fhir_practitioner_id: 'PR00601',
            groups: [
                'chursj'
            ],
            given_name: 'John',
            fhir_organization_id: 'OR00202',
            family_name: 'Doe'
        }
        */

        await logService.debug( 'Overture getSomethingFromScore returned something' )
        return {
            response
        }
    } catch ( e ) {
        await logService.warning( `Overture getSomethingFromScore ${e.toString()}` )
        return new errors.InternalServerError()
    }
}


export default {
    functionToGetSomethingFromScore
}
