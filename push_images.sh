export VERSION=$(cat package.json | jq -r ".version")

export PATIENT_IMAGE=chusj/clin-proxy-api-patient-service:$VERSION
export VARIANT_IMAGE=chusj/clin-proxy-api-variant-service:$VERSION
export META_IMAGE=chusj/clin-proxy-api-meta-service:$VERSION
export GENE_IMAGE=chusj/clin-proxy-api-gene-service:$VERSION

docker build -t $PATIENT_IMAGE -f Dockerfile-patient .;
docker build -t $META_IMAGE -f Dockerfile-meta .;
docker build -t $VARIANT_IMAGE -f Dockerfile-variant .;
docker build -t $GENE_IMAGE -f Dockerfile-gene .;

docker push $PATIENT_IMAGE;
docker push $META_IMAGE;
docker push $VARIANT_IMAGE;
docker push $GENE_IMAGE;