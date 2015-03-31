var path = require('path');
var http = require('http');
var connect = require('connect');

// extras for prettier logging
var dateFormat = require('dateformat');
function getTimestamp() {
	var now = new Date();
	return dateFormat(now, '[hh:MM:ss]'); 
}

var StoppableServer = {
    options: {
        port: '8080',
        host: 'localhost',
        root: path.dirname(module.parent.id)
    },
    server: null,
    application: null,
    sockets: [],
	running: false,
    start: function start(oOptions, fCallback) {
		if (StoppableServer.running) return fCallback("not starting: server already started.");
		
		// basic option fix-up
        StoppableServer.options.port = oOptions.port || StoppableServer.options.port;
        StoppableServer.options.host = oOptions.host || StoppableServer.options.host;
        StoppableServer.options.root = oOptions.root || StoppableServer.options.root;

		// wiring up the static content serving
        StoppableServer.application = connect();
        StoppableServer.server = http.createServer(StoppableServer.application);
		StoppableServer.application.use(connect.static(StoppableServer.options.root));
        StoppableServer.application.use(connect.directory(StoppableServer.options.root));

		// listening for connections and tracking sockets
        StoppableServer.server.listen(StoppableServer.options.port, function (eError) {
            if (eError) return fCallback(eError);
            StoppableServer.server.on('connection', function (socket) {
                StoppableServer.sockets.push(socket);
                return socket.on('close', function () {
                    var location = StoppableServer.sockets.indexOf(socket);
                    return StoppableServer.sockets.splice(location, 1);
                });
            });
			
			console.log(getTimestamp() + ' Started http server.');
			StoppableServer.running = true;
            return fCallback();
        });
    },
    stop: function stop(fCallback) {
		if (!StoppableServer.running) return fCallback("not stopping: server already stopped.");
		
        StoppableServer.sockets.forEach(function (socket) {
            return socket.destroy();
        });
        StoppableServer.server.close();

		console.log(getTimestamp() + ' Stopped http server.');
		StoppableServer.running = false;
        return fCallback();
    },
	stopAndExit: function stopAndExit(fCallback) {
		StoppableServer.stop(function () {
			// close regardless of failure to stop http
			return process.nextTick(function() {
				return process.exit(0);
			});
		});
	}
};

// extra wiring for clean close on exit or ctrl-c
process.on("SIGINT", StoppableServer.stopAndExit);
process.on("exit", StoppableServer.stopAndExit);

module.exports = StoppableServer;

