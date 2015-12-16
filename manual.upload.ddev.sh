#!/bin/sh
curl -X POST -d @$KEY.json https://a11y-dashboard-webservice.internal.domain.dev.atlassian.io/load.crawlkit --header "Content-Type: application/json"
