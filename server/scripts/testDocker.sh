echo 'creating' $1 'docker image for testing purpose'
echo 'docker build -t' $1 '-f Dockerfile.test .'
docker build -t $1 -f Dockerfile.test .
