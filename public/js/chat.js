define([
	'jquery',
	'utils',
	'socket'
], function(
	$,
	utils,
	socket
) {

	var Chat = function() {
		this.$el = $('#chat');
		utils.eventDelegation.call(this);
	};

	Chat.prototype = {
		
		events: {
			'[name=chat] keyup': 'send'
		},
		
		send: function() {
			console.log('send chat');
			var text = this.$el.val();
			if(e.which == 13 && text.length) {
				this.$el.val('');
				socket.emit('/update/chat', text);
			}
		},
		
		update: function(user, msg) {
			console.log('update chat');
			this.$el.append('<p>'+user.nick+': '+msg+'</p>');
		}
	};

	return new Chat();
});