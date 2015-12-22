#!/bin/sh
curl \
--fail \
-X POST \
--data-binary @$KEY.json \
--header "Content-Type: application/json" \
"https://a11y-dashboard-webservice.internal.domain.dev.atlassian.io/load.crawlkit?origin=$ORIGIN&timestamp=$TIMESTAMP"
