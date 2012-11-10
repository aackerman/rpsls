module.exports = function(app) {
	app.get('/', function(req, res){
		res.render('index');
	});

	app.all('*', function(req, res){
		res.render('404');
	});
};