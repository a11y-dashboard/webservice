var Hapi = require('hapi');
var bunyan = require('bunyan');
var hapiBunyan = require('hapi-bunyan');

var server = new Hapi.Server();
var logger = bunyan.createLogger({ name: 'a11y-dashboard-webservice' });

server.connection({
    host: 'localhost',
    port: 8080
});

server.route({
    method: 'GET',
    path:'/healthcheck',
    handler: function (request, reply) {
        reply('♥');
    }
});

var config = {
  register: hapiBunyan,
  options: {
    logger: logger,
  },
};

server.register(config, function(err) {
  if (err) throw err;
});

server.start(function () {
    logger.info('Server running at: %s', server.info.uri);
});
