var connections = {};

module.exports = function(io) {

	var sockets = io.sockets.sockets;

	io.sockets.on('connection', function(socket){

		socket.on('/ready', function(){
			socket.emit('/players', connections);
		});

		// the user picked a name
		socket.on('/entrance', function(nick){

			connections[socket.id] = {
				nick: nick,
				id: socket.id
			};

			// tell all the players there is a new player to challenge
			socket.broadcast.emit('/add/player', connections[socket.id]);
		});

		// somebody sent a message
		socket.on('/update/chat', function(text){
			io.sockets.emit('/update/chat', connections[socket.id], text);
		});

		// somebody wants to challenge another player
		socket.on('/challenge/send', function(id){
			sockets[id].emit('/challenge/receive', socket.id);
		});

		socket.on('/challenge/response', function(id){
			sockets[id].emit('/challenge/response', socket.id);
		});

		// somebody disconnected
		socket.on('disconnect', function(){
			console.log('disconnect');
			if(connections[socket.id]) {
				io.sockets.emit('/remove/player', connections[socket.id]);
				delete connections[socket.id];
			}
		});
	});

};