$(document).ready(function(){

	var resolve = function(p1, p2) {
		var ps1 = outcomes[p1.selection][0];
		var ps2 = outcomes[p1.selection][1];
		console.log(p1.nick + ' selected ' + p1.selection, p2.nick + ' selected ' + p2.selection);
		if(p1.selection == p2.selection) {
			console.log('Tie!');
		} else {
			if(
				ps1 == p2.selection ||
				ps2 == p2.selection
			) {
				console.log(p1.nick + ' wins!');
			} else {
				console.log(p2.nick + ' wins!');
			}
		}
	};

	var player = {
		nick: 'Ron',
		selection: ''
	};

	var bot = {
		nick: 'bot',
		selection: ''
	};

	var options = [
			'rock'
		, 'lizard'
		, 'spock'
		, 'scissors'
		, 'paper'
	];

	var outcomes = {
		'rock': ['scissors', 'lizard'],
		'lizard': ['spock', 'paper'],
		'spock': ['scissors', 'rock'],
		'scissors': ['paper', 'lizard'],
		'paper': ['rock', 'spock']
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
		var r = _.random(0, 4);
		player.selection = $('img.active').attr('data-selection');
		bot.selection = options[r];
		resolve(player, bot);
	});
});