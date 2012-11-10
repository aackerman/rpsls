//import modules
var express     = require('express'),
    RedisStore  = require('connect-redis')(express),
    consolidate	= require('consolidate');

//create server
var app = express();

//setup express middleware
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'haxzorz'}));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('port', 8000);
});

process.on('uncaughtException', function(err){
  console.error(err);
  console.error(err.stack);
  process.exit(1);
});

//import routes
require('./routes')(app);

//explode server
app.listen(app.get('port'));
console.log('server running on port ' + app.get('port'));