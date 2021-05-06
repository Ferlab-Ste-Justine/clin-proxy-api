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

export const AUTH_RESOURCE_PATIENT_VARIANTS = 'patient-variants'
export const AUTH_RESOURCE_PATIENT_FAMILY = 'patient-family'
export const AUTH_RESOURCE_PATIENT_FILES = 'patient-files'
export const AUTH_RESOURCE_PATIENT_PRESCRIPTIONS = 'patient-prescriptions'
export const AUTH_RESOURCE_PATIENT_LIST = 'patient-list'

export const AUTH_RESOURCES = [
    AUTH_RESOURCE_PATIENT_LIST,
    AUTH_RESOURCE_PATIENT_PRESCRIPTIONS,
    AUTH_RESOURCE_PATIENT_FILES,
    AUTH_RESOURCE_PATIENT_FAMILY,
    AUTH_RESOURCE_PATIENT_VARIANTS
]

export const KEYCLOAK_AUTH_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:uma-ticket'
export const KEYCLOAK_AUTH_RESPONSE_MODE = 'permissions'
