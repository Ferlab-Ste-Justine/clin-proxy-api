export const SERVICE_TYPE_PATIENT = 'patient'
export const SERVICE_TYPE_VARIANT = 'variant'
export const SERVICE_TYPE_META = 'meta'

export const ROLE_TYPE_USER = 'clin_practitioner'
export const ROLE_TYPE_GROUP = 'clin_genetician'
export const ROLE_TYPE_ADMIN = 'clin_administrator'

export const getACL = ( req ) => {
    return {
        practitioner_id: req.fhirPractitionerId,
        organization_id: req.fhirOrganizationId,
        roles: req.roles
    }
}
