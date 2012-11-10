$(document).ready(function(){

	var player = {
		selection: ''
	};

	var bot = {
		selection: ''
	};

	var options = [
			'rock'
		, 'lizard'
		, 'spock'
		, 'scissors'
		, 'paper'
	];

	var gm = {
		'rock': ['scissors', 'lizard'],
		'lizard': ['spock', 'paper'],
		'spock': ['scissors', 'rock'],
		'scissors': ['paper', 'lizard'],
		'paper': ['rock', 'spock']
	};

	var resolveBot = function(){

	};

	var socket = io.connect();

	socket.on('/update/chat', function(user, msg){
		$('#chat').append('<p>'+user.nick+': '+msg+'</p>');
	});

	socket.on('/add/player', function(p){
		$('#players').append('<p data-id="'+p.id+'">'+p.nick+'</p>');
	});

	socket.on('/players', function(players){
		$.each(players, function(k, p){
			$('#players').append('<p data-id="'+p.id+'">'+p.nick+'</p>');
		});
	});

	socket.on('/remove/player', function(p){
		$('[data-id='+p.id+']').remove();
	});

	$('[name=chat]').on('keyup', function(e){
		if(e.which == 13) {
			var text = $(this).val();
			$(this).val('');
			socket.emit('/update/chat', text);
		}
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
		$('.main-img img').removeClass('active');
		$(this).toggleClass('active');
		$('.selection').show();
	});

	$('.lock-btn').on('click', function(e){
		player.selection = $('img.active').attr('data-selection');
		resolveBot();
	});
});