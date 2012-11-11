var redis = require('redis');

module.exports = function(ioserver) {
	var ready = {
		pub: 0,
		sub: 0,
		cli: 0
	};

	var setredis = function() {
		ioserver.set('store', new socketio.RedisStore({
			redisPub: pub,
			redisSub: sub,
			redisClient: cli
		}));
	};

	var pub = redis.createClient(6379, 'nodejitsudb8585611132.redis.irstack.com');
	var sub = redis.createClient(6379, 'nodejitsudb8585611132.redis.irstack.com');
	var cli = redis.createClient(6379, 'nodejitsudb8585611132.redis.irstack.com');

	pub.auth('nodejitsudb8585611132.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4');
	sub.auth('nodejitsudb8585611132.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4');
	cli.auth('nodejitsudb8585611132.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4');

	pub.on('ready', function(){
		ready.pub = 1;
		if(ready.pub && ready.sub && ready.cli) setredis();
	});

	sub.on('ready', function(){
		ready.sub = 1;
		if(ready.pub && ready.sub && ready.cli) setredis();
	});

	cli.on('ready', function(){
		ready.sub = 1;
		if(ready.pub && ready.sub && ready.cli) setredis();
	});
};