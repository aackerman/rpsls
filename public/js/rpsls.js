define([
	'lodash',
	'utils'
], function(
	_,
	utils
){
	var self;
	var RPSLS = function() {
		this.$el = $('body');
		this.players = [];
		this.socket = io.connect();
		utils.eventDelegation.call(this);
		utils.socketEventDelegation.call(this);
		this.socket.emit('/ready');
	};

	RPSLS.prototype = {

		events: {
			'.selection-img click': 'select',
			'.challenge click': 'challenge',
			'[name=chat] keyup': 'chat',
			'[name=nickname] keyup': 'nickname',
			'.lock-btn click': 'lockin',
			'.quick-start click': 'quickstart'
		},

		socketEvents: {
			'/players': 'bootstrapPlayers',
			'/update/chat': 'updateChat',
			'/add/player': 'addPlayer',
			'/remove/player': 'removePlayer'
		},

		outcomes : {
			'rock': ['scissors', 'lizard'],
			'lizard': ['spock', 'paper'],
			'spock': ['scissors', 'rock'],
			'scissors': ['paper', 'lizard'],
			'paper': ['rock', 'spock']
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

		$: function(selector){
			return self.$el.find(selector);
		},

		$nickname: $('[name=nickname]'),
		$chat: $('[name=chat]'),
		
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

		challenge: function(e) {
			self.socket.emit('/challenge', $(e.currentTarget).attr('data-id'));
		},

		quickstart: function(e) {
			$('.startup').hide();
			$('.quick-nick').fadeIn();
		},

		nickname: function(e){
			var nick = self.$nickname.val();
			if(e.which == 13 && nick.length) {
				$('.quick-nick').hide();
				$('.info-output').fadeIn();
				self.socket.emit('/entrance', nick);
			}
		},

		chat: function(e) {
			if(e.which == 13) {
				var text = self.$chat.val();
				self.$chat.val('');
				self.socket.emit('/update/chat', text);
			}
		},

		bootstrapPlayers: function(players){
			console.log('bootstrapPlayers', players);
			$.each(players, function(k, p){
				self.addPlayer(p);
			});
		},

		addPlayer: function(p) {
			console.log('addPlayer', p);
			var tpl = _.template('<p data-id="<%= id%>"><%= nick%>', p);
					tpl += _.template('<button class="btn rfloat challenge" data-id="<%= id%>">Challenge</button></p>', p);
			$('#players').append(tpl);
		},

		updateChat: function(user, msg) {
			$('#chat').append('<p>'+user.nick+': '+msg+'</p>');
		},

		select: function(e) {
			var $t = $(e.currentTarget);
			var selection = $t.attr('data-selection');
			var tpl = _.template('Lock In <%= selection %>', {selection: selection});
			$('.selection-img.active').removeClass('active');
			$t.toggleClass('active');
			$('.selection').show();
			$('.lock-btn').html(tpl);
		},

		removePlayer: function(p) {
			$('[data-id='+p.id+']').remove();
		},

		lockin: function(e) {
			var r = _.random(0, 4);
			var p1 = self.player;
			var p2 = self.challenger;
			p1.selection = $('.selection-img.active').attr('data-selection');
			if(p2.type == 'bot') {
				p2.selection = p2.options[r];
			} else {

			}
			self.resolve(p1, p2);
		}

	};

	self = new RPSLS();

	return self;
});