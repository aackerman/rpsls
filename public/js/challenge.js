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
		this.socket = socket;
		utils.eventDelegation.call(this);
		utils.socketEventDelegation.call(this);
	};

	Challenge.prototype = {

		events: {
			'.selection-img click': 'select',
			'.lock-btn click': 'lockin'
		},

		socketEvents: {
			'/challenge/accept': 'acceptance',
			'/challenge/reject': 'rejection',
			'/challenge/receive': 'receive',
			'/challenge/win': 'win',
			'/challenge/lose': 'lose',
			'/challenge/tie': 'tie'
		},

		bot: {
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
			console.log(e);
			var $t = $(e.currentTarget);
			var selection = $t.attr('data-selection');
			var tpl = _.template('Lock in <%= selection %>', {selection: selection});

			console.log('select option', selection);

			$('.selection-img.active').removeClass('active');
			$t.toggleClass('active');
			$('.lock-btn').show().html(tpl);
		},

		lockin: function(e) {
			var p1 = pstore.player;
			var p2 = pstore.challenger;
			p1.selection = $('.selection-img.active').attr('data-selection');
			console.log('lock in selection', p1.selection);
			if(p2.type == 'bot') {
				p2.selection = p2.options[_.random(0, 4)];
				this.resolve(p1, p2);
			} else {
				socket.emit('/selection/send', p1.id, p2.id, p1.selection);
			}
		},

		resolve: function(p1, p2) {
			var ps1 = this.outcomes[p1.selection][0];
			var ps2 = this.outcomes[p1.selection][1];
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

		// receive player information from the challenger
		receive: function(challenger) {
			// set the challenger
			pstore.challenger = pstore[challenger.id];
			console.log('recieve challenge', pstore.challenger);

			// create a message to accept or reject the challenge
			utils.message(pstore.challenger.nick + ' is challenging you. <span class="timer">30s</span><p class="center"><button class="btn accept">Accept</button><button class="btn reject">Ignore</button></p>');
		},

		acceptance: function(challenger) {
			pstore.challenger = challenger;
			$('.challenger').html('<p>Playing against '+pstore.challenger.nick+'</p>');
		},

		acceptChallenge: function() {
			var recipientId = pstore.challenger.id;
			var originatorId = pstore.player.id;
			// send accept message to challenger from player
			socket.emit('/challenge/accept', originatorId, recipientId);
			$('.challenger').html('<p>Playing against '+pstore.challenger.nick+'</p>');
		},

		rejection: function(rejector) {
			console.log('challenge ignored from', rejector);
		},

		rejectChallenge: function() {
			var recipientId = pstore.challenger.id;
			var originatorId = pstore.player.id;
			socket.emit('/challenge/reject', pstore.player);
		},

		send: function(e) {
			var recipientId = $(e.currentTarget).attr('data-id');
			var originatorId = pstore.player.id;
			console.log('challenge sent to' + recipientId + ' from ' + pstore.player.nick);
			// send challenge from our player id to their player id
			socket.emit('/challenge/send', originatorId, recipientId);
		},

		win: function() {
			console.log('you win');
		},

		lose: function() {
			console.log('you lost');
		},

		tie: function() {
			console.log('you tied');
		},

		reset: function() {

		}
	};

	return new Challenge();
});