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
		this.setupBot();
	};

	Challenge.prototype = {

		events: {
			'.selection-img click': 'select',
			'.lock-btn click': 'lockin'
		},

		socketEvents: {
			'/challenge/accept'		: 'acceptance',
			'/challenge/reject'		: 'rejection',
			'/challenge/receive'	: 'receive',
			'/challenge/selection': 'notify',
			'/challenge/win'			: 'win',
			'/challenge/lose'			: 'lose',
			'/challenge/tie'			: 'tie'
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
					, 'Bear Bot'
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
		},

		// user clicked on a selection
		select: function(e) {
			var $t = $(e.currentTarget);
			var selection = $t.attr('data-selection');
			var tpl = _.template('Lock in <%= selection %>', {selection: selection});

			console.log('select option', selection);

			$('.selection-img.active').removeClass('active');
			$t.toggleClass('active');
			$('.lock-btn').fadeIn().html(tpl);
		},

		// user locked in a selection
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
				console.log(p1, p2);
				socket.emit('/selection/send', p1.id, p2.id, p1.selection);
			}
		},

		// resolve client-side if the user is facing a bot
		resolve: function(p1, p2) {
			var outcome1 = this.outcomes[p1.selection];
			var outcome2 = this.outcomes[p2.selection];
			console.log(p1.nick + ' selected ' + p1.selection, p2.nick + ' selected ' + p2.selection);
			if(p1.selection == p2.selection) {
				this.tie();
			} else {
				console.log(p2.selection, outcome1);
				if(p2.selection in outcome1) {
					this.win(outcome1[p2.selection].message);
				} else {
					this.lose(outcome2[p1.selection].message);
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

		notify: function() {
			$('.info-box').html(pstore.challenger.nick + ' has made a selection.');
		},

		// handle another user accepting our challenge
		acceptance: function(challenger) {
			pstore.challenger = challenger;
			utils.timer.start(60, this.challengeTimeout);
			this.setChallenger(pstore.challenger.nick);
		},

		// tell another user we are accepting the challenger
		acceptChallenge: function() {
			var recipientId = pstore.challenger.id;
			var originatorId = pstore.player.id;
			// send accept message to challenger from player
			utils.timer.start(60, this.challengeTimeout);
			socket.emit('/challenge/accept', originatorId, recipientId);
			this.setChallenger(pstore.challenger.nick);
		},

		//set the name of the challenger
		setChallenger: function(name) {
			$('.challenger').html('<p>Playing against '+name+'</p>');
		},

		// let the user know they are still waiting for a response
		setChallengeAttempt: function(name) {
			$('.challenger').html('<p>Waiting for a challenge response from '+name+'</p>');
		},

		// handle rejection from another user
		rejection: function(rejector) {
			console.log('challenge ignored from', rejector);
		},

		// tell another user we are rejecting their challenge
		rejectChallenge: function() {
			var recipientId = pstore.challenger.id;
			var originatorId = pstore.player.id;
			socket.emit('/challenge/reject', pstore.player);
		},

		// send a challenge to another user
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

		setupBot: function(){
			this.setChallenger(this.bot.getName());
		},

		// handle when a user takes too long to decide
		challengeTimeout: function() {
			utils.message('Timeout!', 5);
		},

		// cleanup
		cleanup: function() {
			$('.info-box').empty();
			utils.timer.reset();
		},

		// tell the user the outcome
		win: function(msg) {
			this.cleanup();
			var sound = msg.toLowerCase().replace(/\s/g, '-').replace('!', '');
			utils.audio.sequence('win', sound);
			utils.message('You win! ' + msg, 3);
			console.log('you win');
		},

		lose: function(msg) {
			this.cleanup();
			var sound = msg.toLowerCase().replace(/\s/g, '-').replace('!', '');
			utils.audio.sequence('lose', sound);
			utils.message('You lost! ' + msg, 3);
			console.log('you lost');
		},

		tie: function() {
			this.cleanup();
			utils.audio.play('tie');
			utils.message('You tied!', 3);
		}
	};

	return new Challenge();
});