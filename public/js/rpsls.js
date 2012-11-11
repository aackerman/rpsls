define([
	'lodash',
	'socket',
	'pstore',
	'utils',
	'chat',
	'challenge',
	'mq'
], function(
	_,
	socket,
	pstore,
	utils,
	chat,
	challenge,
	MQ
){
	var self;
	var RPSLS = function() {
		this.$el = $('body');
		this.chat = chat;
		this.mq = MQ;
		this.challenge = challenge;
		this.socket = socket;
		utils.eventDelegation.call(this);
		utils.socketEventDelegation.call(this);
		this.socket.emit('/ready');
	};

	RPSLS.prototype = {

		events: {
			'.challenge click': 'challengesend',
			'[name=nickname] keyup': 'nickname',
			'.quick-start click': 'quickstart'
		},

		socketEvents: {
			'/self': 'setself',
			'/players': 'bootstrap',
			'/update/chat': 'chatupdate',
			'/add/player': 'addplayer',
			'/remove/player': 'removeplayer'
		},

		$: function(selector){
			return self.$el.find(selector);
		},

		$nickname: $('[name=nickname]'),
		$chat: $('[name=chat]'),

		quickstart: function(e) {
			$('.startup').hide();
			$('.quick-nick').fadeIn();
		},

		chatupdate: function(user, msg) {
			this.chat.update(user, msg);
		},

		challengesend: function(e) {
			console.log('send challenge from click');
			this.challenge.send(e);
		},

		bootstrap: function(players){
			console.log('bootstrap players', players);
			$.each(players, function(k, p){
				self.addplayer(p);
			});
		},

		setself: function(player) {
			pstore.player = player;
			console.log('setself');
		},

		addplayer: function(p) {
			console.log('add player', p);
			pstore[p.id] = p;
			var tpl = _.template('<div class="row player-row" data-id="<%= id%>"><div class="align-middle"></div><%= nick%>', p);
					tpl += _.template('<button class="btn rfloat challenge" data-id="<%= id%>">Challenge</button></div>', p);
			$('#players').append(tpl);
		},

		nickname: function(e){
			var nick = self.$nickname.val();
			if(e.which == 13 && nick.length) {
				console.log('set nickname');
				$('.quick-nick').hide();
				$('.info-output').fadeIn();
				this.$('.nameplate').html(nick);
				socket.emit('/entrance', nick);
			}
		},

		removeplayer: function(p) {
			console.log(p);
			delete pstore[p.id];
			$('[data-id='+p.id+']').remove();
		}

	};

	self = new RPSLS();

	return self;
});