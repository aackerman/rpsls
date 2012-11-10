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
		$('#players').append('<p data-id="'+p.id+'">'+p.nick+'</p>');
	});

	RPSLS.socket.on('/players', function(players){
		$.each(players, function(k, p){
			$('#players').append('<p data-id="'+p.id+'">'+p.nick+'</p>');
		});
	});

	RPSLS.socket.on('/remove/player', function(p){
		$('[data-id='+p.id+']').remove();
	});

	var setNickname = function(e) {
		var nick = $('[name=nickname]').val();
		if(nick.length) {
			$('.nick-overlay').hide();
			socket.emit('/entrance', nick);
		}
	};

	// emit the player is ready to start
	$('.start').on('click', setNickname);
	$('[name=nickname]').on('keyup', function(e){
		if(e.which == 13) setNickname();
	});

	$('.challenge').on('click', function(e){
		socket.emit('/challenge', $(this).attr('data-id'));
	});

	$('.main-img img').on('click', function(e){
		var selection = $(this).attr('data-selection');
		var tpl = _.template('Lock In <%= selection %>', {selection: selection});
		$('img.active').removeClass('active');
		$(this).toggleClass('active');
		$('.selection').show();

		$('.lock-btn').html(tpl);
	});

	$('[name=chat]').on('keyup', function(e){
		if(e.which == 13) {
			var text = $(this).val();
			$(this).val('');
			RPSLS.socket.emit('/update/chat', text);
		}
	});

	$('.lock-btn').on('click', function(e){
		RPSLS.lockin();
	});
	
});