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

	socket.emit('entrance', 'Ron', 'Slithering Lizards');

	socket.on('/update/chat', function(m){
		$('#chat').append('<p>'+m+'</p>');
	});

	$('[name=chat]').on('keyup', function(e){
		if(e.which == 13) {
			var text = $(this).val();
			$('#chat').append('<p>'+text+'</p>');
			$(this).val('');
			socket.emit('/update/chat', text);
		}
	});

	$('.main-img img').on('click', function(e){
		$('.main-img img').removeClass('active');
		$(this).toggleClass('active');
	});
});