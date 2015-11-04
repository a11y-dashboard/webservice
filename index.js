var Hapi = require('hapi');
var debug = require('debug');
var info = debug('a11y-dashboard-webservice:info');

var server = new Hapi.Server();
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

server.start(function () {
    info('Server running at: %s', server.info.uri);
});
