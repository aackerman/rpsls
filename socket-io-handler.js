var connections = {};

var outcomes = {
	'rock': {
		'scissors': {
			message: 'Rock crushes scissors!',
			audio: 'rock-crushes-scissors'
		},
		'lizard': {
			message: 'Rock crushes lizard!',
			audio: 'rock-crushes-lizard'
		}
	},
	'lizard': {
		'spock': {
			message: 'Lizard poisons Spock!',
			audio: 'lizard-poisons-spock'
		},
		'paper': {
			message: 'Lizard eats paper!',
			audio: 'lizard-eats-paper'
		}
	},
	'spock': {
		'scissors': {
			message: 'Spock smashes scissors!',
			audio: 'spock-smashes-scissors'
		},
		'rock': {
			message: 'Spock vaporizes rock!',
			audio: 'spock-vaporizes-rock'
		}
	},
	'scissors': {
		'paper': {
			message: 'Scissors cuts paper!',
			audio: 'scissors-cuts-paper'
		},
		'lizard': {
			message: 'Scissors decapitates lizard!',
			audio: 'scissors-decapitates-lizard'
		}
	},
	'paper': {
		'rock': {
			message: 'Paper covers rock!',
			audio: 'paper-covers-rock'
		},
		'spock': {
			message: 'Paper disproves Spock!',
			ogg: 'paper-disproves-spock'
		}
	}
};

var resolve = function(p1, p2) {
	var outcome1 = outcomes[p1.selection];
	var outcome2 = outcomes[p2.selection];
	if(p1.selection == p2.selection) {
		return {
			winner: false,
			message: p1.selection + ' ties ' + p1.selection
		};
	} else {
		if(p2.selection in outcome1) {
			return {
				winner: p1.id,
				message: outcome1[p2.selection].message
			};
		} else {
			return {
				winner: p2.id,
				message: outcome2[p1.selection].message
			};
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
			// get references for both playesr
			var p1 = connections[originatorId];
			var p2 = connections[recipientId];

			// make sure we have both players
			if(p1 && p2) {
				p1.selection = selection;

				// only resolve if both players have made selections
				if(p2.selection) {
					// resolve returns either tie or the winning id
					var result = resolve(p1, p2);

					// undefine both players selections
					p1.selection = undefined;
					p2.selection = undefined;

					// send the results to both parties
					if(!result.winner) {
						// send both parties a tie response
						sockets[originatorId].emit('/challenge/tie', selection);
						sockets[recipientId].emit('/challenge/tie', selection);
					} else if (result.winner == originatorId) {
						// send both parties a what happenend
						sockets[originatorId].emit('/challenge/win', result.message);
						sockets[recipientId].emit('/challenge/lose', result.message);
					} else {
						// send both parties a what happenend
						sockets[recipientId].emit('/challenge/win', result.message);
						sockets[originatorId].emit('/challenge/lose', result.message);
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