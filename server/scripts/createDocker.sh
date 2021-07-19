echo 'creating' $1 'docker image'
echo 'docker build -t' $1 '.'
docker build -t $1 .
