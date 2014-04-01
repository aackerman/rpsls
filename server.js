
var express = require('express'),
    redis = require('redis'),
    socketio = require('socket.io');

//create server
var app = express(),
    server = require('http').createServer(app),
    ioserver = socketio.listen(server);

ioserver.configure(function () {
  ioserver.set('transports', ['websocket', 'xhr-polling']);
  ioserver.enable('log');
});

require('./redis-setup')(ioserver);

//setup express middleware
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'haxzorz'}));
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('port', 8000);
});

process.on('uncaughtException', function(err){
  console.error(err);
  console.error(err.stack);
  process.exit(1);
});

// handle socket-io
require('./socket-io-handler')(ioserver);

//import routes
require('./routes')(app);

//explode server
server.listen(app.get('port'));
console.log('server running on port ' + app.get('port'));
