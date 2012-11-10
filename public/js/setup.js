define([
	'RPSLS',
	'jquery',
	'lodash'
], function(
	RPSLS,
	$,
	_
){

	RPSLS.socket.on('/update/chat', function(user, msg){
		$('#chat').append('<p>'+user.nick+': '+msg+'</p>');
	});

	RPSLS.socket.on('/add/player', function(p){
		$('#players').append('<p data-id="'+p.id+'">'+p.nick+'<button class="btn rfloat challenge" data-id="'+p.id+'">Challenge</button></p>');
	});

	RPSLS.socket.on('/players', function(players){
		$.each(players, function(k, p){
			$('#players').append('<p data-id="'+p.id+'">'+p.nick+'</p>');
		});
	});

	RPSLS.socket.on('/remove/player', function(p){
		$('[data-id='+p.id+']').remove();
	});
	
});