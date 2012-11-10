var games = [];
var usernames = {};

module.exports = function(io) {

	io.sockets.on('connection', function(socket){

		// send the player connecting all the other known players
		socket.emit('/players', usernames);

		// the user picked a name
		socket.on('/entrance', function(nick){
			usernames[socket.id] = {
				nick: nick,
				id: socket.id
			};

			// tell all the players there is a new player to challenge
			io.sockets.emit('/add/player', usernames[socket.id]);
		});

		// somebody sent a message
		socket.on('/update/chat', function(text){
			io.sockets.emit('/update/chat', usernames[socket.id], text);
		});

		// somebody wants to challenge another player
		socket.on('/challenge', function(id){

		});

		// somebody disconnected
		socket.on('disconnect', function(){
			if(usernames[socket.id]) {
				io.sockets.emit('/remove/player', usernames[socket.id]);
				delete usernames[socket.id];
			}
		});
	});

};