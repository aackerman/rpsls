var Session = function() {
	this.games = 0;
};

Session.prototype.start = function() {
};

var Game = function(){};

Game.prototype.start = function(){

};

Game.prototype.reset = function() {
	this.games = 0;
};

Game.prototype.addPlayer = function(p) {
	this.players.push(p);
};

var Player = function() {
	this.name = 'Player';
	this.wins = 0;
	this.losses = 0;
	this.draws = 0;
	this.selection = null;
	this.lockedIn = false;
};

Player.prototype.lockin = function(s) {
	this.selection = s;
	this.lockedIn = true;
};

$(document).ready(function(){

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
	});
});