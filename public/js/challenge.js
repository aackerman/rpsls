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
		this.setChallenger(this.bot.getName());
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
			],
			getName: function(){
				var names = [
						'All-knowing Bot'
					, 'Bending Bot'
					, 'Pointy-ears Bot'
					, 'Laser Bot'
					, 'Beer Bot'
					, 'Can-opener Bot'
					, 'Cat Bot'
					, 'Dog Bot'
				];

				return names[_.random(0, names.length - 1)];
			}
		},

		def: {
			nick: 'Player',
			type: 'self',
			selection: ''
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
			$('.lock-btn').fadeIn().html(tpl);
		},

		lockin: function(e) {
			var p1 = pstore.player || this.def;
			var p2 = pstore.challenger || this.bot;
			p1.selection = $('.selection-img.active').attr('data-selection');
			console.log('lock in selection', p1.selection);
			$('.lock-btn').fadeOut();
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
				this.tie();
			} else {
				if(
					ps1 == p2.selection ||
					ps2 == p2.selection
				) {
					this.win();
				} else {
					this.lose();
				}
			}
		},

		// receive player information from the challenger
		receive: function(challenger) {
			// set the challenger
			pstore.challenger = pstore[challenger.id];
			console.log('recieve challenge', pstore.challenger);

			// create a message to accept or reject the challenge
			var msg = '<p class="center">' + pstore.challenger.nick + ' is challenging you.</p><p class="center"><button class="btn accept">Accept</button><button class="btn reject">Ignore</button></p>';
			utils.message(msg, 30);
			utils.timer.start();
		},

		acceptance: function(challenger) {
			pstore.challenger = challenger;
			utils.timer.start(60, this.challengeTimeout);
			this.setChallenger(pstore.challenger.nick);
		},

		acceptChallenge: function() {
			var recipientId = pstore.challenger.id;
			var originatorId = pstore.player.id;
			// send accept message to challenger from player
			utils.timer.start(60, this.challengeTimeout);
			socket.emit('/challenge/accept', originatorId, recipientId);
			this.setChallenger(pstore.challenger.nick);
		},

		setChallenger: function(name) {
			$('.challenger').html('<p>Playing against '+name+'</p>');
		},

		setChallengeAttempt: function(name) {
			$('.challenger').html('<p>Waiting for a challenge response from '+name+'</p>');
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
			console.log(pstore, pstore[recipientId]);
			var opponent = pstore[recipientId];

			// logging
			console.log('challenge sent to' + recipientId + ' from ' + pstore.player.nick);
			
			// don't allow the user to challenge other users
			this.setChallengeAttempt(opponent.nick);
			utils.timer.start();

			// send challenge from our player id to their player id
			socket.emit('/challenge/send', originatorId, recipientId);
		},

		challengeTimeout: function() {
			utils.message('Timeout!', 5);
		},

		cleanup: function() {
			utils.timer.reset();
		},

		win: function() {
			utils.message('You win!', 3);
			console.log('you win');
		},

		lose: function() {
			utils.message('You lost!', 3);
			console.log('you lost');
		},

		tie: function() {
			utils.message('You tied!', 3);
		},

		reset: function() {

		}
	};

	return new Challenge();
});