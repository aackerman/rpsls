define([
	'jquery'
], function(
	$
){
	return {
		eventDelegation: function() {
			if(!this.$el) throw new Error('Module requires an $el prop to delegate events');
			var events = this.events;
			if(!events) return;
			for (var key in events) {
				var method = events[key];
				if (!$.isFunction(method)) method = this[events[key]];
				if (!method) throw new Error('Method "' + events[key] + '" does not exist');
				var match = key.match(/^(\S+)\s*(.*)$/);
				var eventName = match[1], selector = match[2];
				method = $.proxy(method, this);
				if (selector === '') {
					this.$el.on(eventName, method);
				} else {
					this.$el.on(selector, eventName, method);
				}
			}
		},

		socketEventDelegation: function() {
			var events = this.socketEvents;
			if(!events) return;
			for (var key in events) {
				var eventName = key;
				var method = events[key];
				if (!$.isFunction(method)) method = this[events[key]];
				if (!method) throw new Error('Method "' + events[key] + '" does not exist');
				method = $.proxy(method, this);
				this.socket.on(eventName, method);
			}
		},

		message: function(msg) {
			console.log('create message');
			var seconds = 30;
			var $msg = $('.message-queue').append('<div class="message">'+msg+'</div>');
			var $timer = $msg.find('.timer');
			var timeout = setInterval(function(){
				seconds--;
				$timer.html(seconds + 's');
			}, 1000);
			setTimeout(function(){
				clearInterval(timeout);
				$msg.remove();
			}, 31000);
		}
	};
});