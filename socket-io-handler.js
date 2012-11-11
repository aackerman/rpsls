var connections = {};

var outcomes = {
	'rock': ['scissors', 'lizard'],
	'lizard': ['spock', 'paper'],
	'spock': ['scissors', 'rock'],
	'scissors': ['paper', 'lizard'],
	'paper': ['rock', 'spock']
};

var resolve = function(p1, p2) {
	var ps1 = outcomes[p1.selection][0];
	var ps2 = outcomes[p1.selection][1];
	if(p1.selection == p2.selection) {
		return 'tie';
	} else {
		if(
			ps1 == p2.selection ||
			ps2 == p2.selection
		) {
			return p1.id;
		} else {
			return p2.id;
		}
	}
};

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

		// send pick to the server
		socket.on('/selection/send', function(originatorId, recipientId, selection){
			var p1 = connections[originatorId];
			var p2 = connections[recipientId];
			if(p1 && p2) {
				p1.selection = selection;
				if(p2.selection) {
					var result = resolve(p1, p2);
					if(result == 'tie') {
						sockets[originatorId].emit('/challenge/tie', selection);
						sockets[recipientId].emit('/challenge/tie', selection);
					} else if (result == originatorId) {
						sockets[originatorId].emit('/challenge/win', p2.selection);
						sockets[recipientId].emit('/challenge/lose', p1.selection);
					} else {
						sockets[recipientId].emit('/challenge/win', p1.selection);
						sockets[originatorId].emit('/challenge/lose', p2.selection);
					}
				}
				// wait for the other user to resolve if we don't have their selection
			} else {
				throw new Error('we dont have both users');
				// we don't know about both users and have an error
			}
		});

		// somebody wants to challenge another player
		socket.on('/challenge/send', function(originatorId, recipientId){
			console.log('challenge accepted by ' + originatorId);
			// emit to the receiver the challenger information
			if(connections[originatorId] && connections[recipientId]) {
				sockets[recipientId].emit('/challenge/receive', connections[originatorId]);
			}
		});

		// somebody want to accept a challenge from another player
		socket.on('/challenge/accept', function(originatorId, recipientId){
			console.log('challenge accepted by ' + originatorId);
			if(connections[originatorId] && connections[recipientId]) {
				// send acceptance and player info to the challenger
				sockets[recipientId].emit('/challenge/accept', connections[originatorId]);
			}
		});

		// somebody want to reject a challenge from another player
		socket.on('/challenge/reject', function(originatorId, recipientId){
			console.log('challenge rejected by ' + originatorId);
			if(connections[originatorId] && connections[recipientId]) {
				// send rejection and player info to the challenger
				sockets[recipientId].emit('/challenge/reject', connections[originatorId]);
			}
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