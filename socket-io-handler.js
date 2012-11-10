var rooms = [
	'Slithering Lizards',
	'Paper Mache Playground',
	'Rock Hard Smashers',
	'Cut Cut Cut Cut Cut Cut Cut',
	'Logical Exports'
];

module.exports = function(io) {

	io.sockets.on('connection', function(socket){

		socket.on('entrance', function(nick, room){
			// set the users nickname
			socket.nick = nick;

			// set the users room
			// @todo only use valid rooms
			socket.room = room;

			// set the user to join the room
			socket.join(socket.room);

			// update chat for the user
			socket.emit('/update/chat', 'Connected to room ' + socket.room);

			// update chat for all other users
			socket.broadcast.to(socket.room).emit('/update/chat', socket.nick + ' just walked in');

			// update rooms for the user
			socket.emit('/update/rooms', rooms, socket.room);
		});

		socket.on('/update/chat', function(text){
			socket.broadcast.to(socket.room).emit('/update/chat', text);
		});

		// broadcast to the room that another person has joined
	});

};