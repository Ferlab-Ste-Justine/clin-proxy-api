DEPENDANT_SERVICES=( "clin-proxy_auth" "clin-proxy_gene" "clin-proxy_meta" "clin-proxy_patient" "clin-proxy_variant" );
SECRET_EXISTS=$(docker secret ls | grep clin_proxy_api_jwt_secret);

if [ -z "$SECRET_EXISTS" ]; then
    #Secret is new, just create it
    docker secret create clin_proxy_api_jwt_secret clin_proxy_api_jwt_secret;
fi