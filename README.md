# a11y-dashboard-webservice

## Development

* To only run the tests, use `npm test`.
* To run the tests and watch them use `npm run test:watch`.
* To run the server locally and watch use `npm run dev:local`.
* To run the whole platform (incl. local DynamoDb) in dev mode use `npm run test:tdd`.

### Postgres

#### dump
```
pg_dump postgres://... -F c -Z 9 > dump.backup
```

#### restore
```
pg_restore -d results -h `docker-machine ip default` -p 54321 -U postgres -c --role=postgres dump.backup
```
