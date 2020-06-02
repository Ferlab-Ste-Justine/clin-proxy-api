DEPENDANT_SERVICES=( "clin-proxy_auth" "clin-proxy_gene" "clin-proxy_meta" "clin-proxy_patient" "clin-proxy_variant" );
SECRET_EXISTS=$(docker secret ls | grep clin_proxy_api_jwt_secret);

if [ -z "$SECRET_EXISTS" ]; then
    #Secret is new, just create it
    docker secret create clin_proxy_api_jwt_secret jwt_secret;
else
    #Secret already exists. It should be rotated.
    #Docker Swarm doesn't support changing an existing secret, so we need to create a temporary secret
    #to support the rotation.
    
    #Create a temporary secret with the new value so we can switches the services to it
    docker secret create clin_proxy_api_jwt_secret_temp jwt_secret;
    for DEPENDANT_SERVICE in "${DEPENDANT_SERVICES[@]}"
    do
        SERVICE_EXISTS=(docker service ls | grep $DEPENDANT_SERVICE)
        if [ ! -z "$SERVICE_EXISTS" ]; then
            docker service update \
                --secret-rm clin_proxy_api_jwt_secret \
                --secret-add source=clin_proxy_api_jwt_secret_temp,target=clin_proxy_api_jwt_secret \
                $DEPENDANT_SERVICE;
        fi
    done
    
    #Renew the secret with the new value
    docker secret rm clin_proxy_api_jwt_secret;
    docker secret create clin_proxy_api_jwt_secret jwt_secret;

    #Switch the services back to the secret
    for DEPENDANT_SERVICE in "${DEPENDANT_SERVICES[@]}"
    do
        SERVICE_EXISTS=(docker service ls | grep $DEPENDANT_SERVICE)
        if [ ! -z "$SERVICE_EXISTS" ]; then
            docker service update \
                --secret-rm clin_proxy_api_jwt_secret_temp \
                --secret-add source=clin_proxy_api_jwt_secret \
                $DEPENDANT_SERVICE;
        fi
    done

    #Delete the temporary secret
    docker secret rm clin_proxy_api_jwt_secret_temp;
fi