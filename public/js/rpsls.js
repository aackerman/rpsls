define(function(){
	var RPSLS = {

		socket: io.connect(),

		outcomes : {
			'rock': ['scissors', 'lizard'],
			'lizard': ['spock', 'paper'],
			'spock': ['scissors', 'rock'],
			'scissors': ['paper', 'lizard'],
			'paper': ['rock', 'spock']
		},
		
		player: {
			nick: '',
			selection: ''
		},
		
		challenger: {
			nick: 'bot',
			selection: '',
			options: [
					'rock'
				, 'lizard'
				, 'spock'
				, 'scissors'
				, 'paper'
			]
		},
		
		resolve: function(p1, p2) {
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
		}

	};
	return RPSLS;
});