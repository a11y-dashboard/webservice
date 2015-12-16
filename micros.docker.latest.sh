#!/bin/sh
set -x
set -e

docker login docker.atlassian.io
docker build -t a11y-dashboard-webservice .
docker tag -f `docker images -q a11y-dashboard-webservice` docker.atlassian.io/atlassian/a11y-dashboard-webservice:latest
docker push docker.atlassian.io/atlassian/a11y-dashboard-webservice:latest
