define([
	'jquery',
	'pstore',
	'socket',
	'utils'
], function(
	$,
	pstore,
	socket,
	utils
){
	var Challenge = function() {
		this.$el = $('.challenge-container');
		this.player = {};
		this.challenger = {};
		utils.eventDelegation.call(this);
	};

	Challenge.prototype = {

		events: {
			'.lock-btn click': 'lockin'
		},

		player: {
			nick: 'Ron',
			type: 'self',
			selection: ''
		},

		challenger: {
			nick: 'Bot',
			type: 'bot',
			selection: '',
			options: [
					'rock'
				, 'lizard'
				, 'spock'
				, 'scissors'
				, 'paper'
			]
		},

		outcomes : {
			'rock': ['scissors', 'lizard'],
			'lizard': ['spock', 'paper'],
			'spock': ['scissors', 'rock'],
			'scissors': ['paper', 'lizard'],
			'paper': ['rock', 'spock']
		},

		select: function(e) {
			var $t = $(e.currentTarget);
			var selection = $t.attr('data-selection');
			var tpl = _.template('Lock in <%= selection %>', {selection: selection});

			console.log('select option', selection);

			$('.selection-img.active').removeClass('active');
			$t.toggleClass('active');
			$('.lock-btn').show().html(tpl);
		},

		lockin: function(e) {
			var p1 = self.player;
			var p2 = self.challenger;
			p1.selection = $('.selection-img.active').attr('data-selection');
			console.log('lock in selection', p1.selection);
			if(p2.type == 'bot') {
				p2.selection = p2.options[_.random(0, 4)];
			} else {

			}
			self.resolve(p1, p2);
		},

		resolve: function(p1, p2) {
			var ps1 = self.outcomes[p1.selection][0];
			var ps2 = self.outcomes[p1.selection][1];
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
		},

		receive: function(p) {
			this.challenger = pstore[p];
			console.log('recieve challenge', this.challenger);
			utils.message(this.challenger.nick + ' is challenging you. <span class="timer">30s</span><p class="center"><button class="btn">Accept</button><button class="btn reject">Reject</button></p>');
		},

		outcome: function() {

		},

		send: function(e) {
			var player = $(e.currentTarget).attr('data-id');
			console.log('challenge sent to' + player);
			socket.emit('/challenge/send', player);
		}
	};

	return Challenge;
});