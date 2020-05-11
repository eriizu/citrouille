#!/bin/sh

set -e

tmpfile=$(mktemp)

cat conf.env > $tmpfile

git clean -f
git checkout .

git pull

cat $tmpfile > conf.env

docker-compose pull
docker-compose build
docker-compose up -d

export $(cat conf.env | xargs)

curl --request POST \
  --url $DEPLOY_CONFIRM_WEBHOOK \
  --header 'content-type: application/json' \
  --data '{
	"content": "Je viens de finir un déployement !"
}'
