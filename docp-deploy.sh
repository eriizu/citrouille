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
  --cookie '__cfduid=dca695f0bb19f37c06f7235261c0eded71589193375; __cfruid=5b2e84f0b82352eac37a76a3907f5a72ca3d557b-1589193375' \
  --data '{
	"content": "Je viens de finir un déployement !"
}'
