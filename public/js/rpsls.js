define([
	'lodash',
	'socket',
	'pstore',
	'utils',
	'challenge',
	'mq'
], function(
	_,
	socket,
	pstore,
	utils,
	challenge
){
	var self;
	var RPSLS = function() {
		this.$el = $('body');
		this.audio = {};
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
			'.quick-start click': 'quickstart',
			'.selection-img click': 'selectionsound',
			'.rules-option click': 'togglerules',
			'.close-rules click': 'togglerules'
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
			$('.info-box').empty();
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
			$('.no-players').remove();
			console.log('add player', p);
			pstore[p.id] = p;
			var tpl = _.template('<div class="row player-row" data-id="<%= id%>"><div class="align-middle"></div><%- nick%>', p);
					tpl += _.template('<button class="btn rfloat challenge" data-id="<%= id%>">Challenge</button></div>', p);
			$('#players').append(tpl);
		},

		nickname: function(e){
			var nick = self.$nickname.val();
			nick = _.escape(nick);
			if(e.which == 13 && nick.length) {
				console.log('set nickname');
				$('.quick-nick').hide();
				$('.info-output').fadeIn();
				this.$('.nameplate').prepend(_.template('<span><%= nick%></span>',{nick: nick}));
				socket.emit('/entrance', nick);
			}
		},

		selectionsound: function(e) {
			if(!$('[name=use-audio]').is(':checked')) return;
			var file = $(e.currentTarget).attr('data-selection');
			if(!this.audio[file]) {
				this.audio[file] = new Audio();
				this.audio[file].src = '/audio/ogg/' + file + '.ogg';
				this.audio[file].load();
				this.audio[file].play();
			} else {
				this.audio[file].play();
			}
		},

		togglerules: function() {
			$('#rules').fadeToggle();
		},

		removeplayer: function(p) {
			console.log(p);
			if(p.id == pstore.challenger.id) {
				this.challenge.setupBot();
				utils.message(pstore.challenger.nick + ' left your game', 3);
			}
			delete pstore[p.id];
			$('[data-id='+p.id+']').remove();
		}

	};

	self = new RPSLS();

	return self;
});