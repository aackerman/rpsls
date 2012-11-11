var connections = {};

module.exports = function(io) {

	var sockets = io.sockets.sockets;

	io.sockets.on('connection', function(socket){
		var player;

		socket.on('/ready', function(){
			socket.emit('/players', connections);
		});

		// the user picked a name
		socket.on('/entrance', function(nick){

			player = connections[socket.id] = {
				nick: nick,
				id: socket.id
			};
			
			socket.emit('/self', player);

			// tell all the players there is a new player to challenge
			socket.broadcast.emit('/add/player', player);
		});

		// somebody sent a message
		socket.on('/update/chat', function(text){
			if(player)
				io.sockets.emit('/update/chat', player, text);
		});

		// somebody wants to challenge another player
		socket.on('/challenge/send', function(id){
			if(connections[id])
				sockets[id].emit('/challenge/receive', socket.id);
		});

		socket.on('/challenge/response', function(id){
			if(connections[id])
				sockets[id].emit('/challenge/response', socket.id);
		});

		// somebody disconnected
		socket.on('disconnect', function(){
			console.log('disconnect');
			if(connections[socket.id]) {
				io.sockets.emit('/remove/player', connections[socket.id]);
				player = null;
				delete connections[socket.id];
			}
		});
	});

};