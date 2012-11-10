module.exports = function(app) {
	app.get('/', function(req, res){
		res.render('index');
	});

	app.get('/rooms', function(req, res){
		res.json([
			'rkqx',
			'4393',
			'dldi',
			'dkdl'
		]);
	});

	app.get('/players', function(req, res){

	});

	app.all('*', function(req, res){
		res.render('404');
	});
};