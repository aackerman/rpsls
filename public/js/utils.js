define([
	'jquery'
], function(
	$
){
	return {
		audio: {
			
			cache: {},

			enabled: function(){
				return $('[name=use-audio]').is(':checked');
			},
			
			cachesound: function(sound){
				if(!this.cache[sound]) {
					this.cache[sound] = new Audio();
					this.cache[sound].src = '/audio/' + this.format + '/' + sound + '.' + this.format;
				}
				return this.cache[sound];
			},
			
			format: (new Audio().canPlayType('audio/mp3') ? 'mp3' : 'ogg'),
			
			play: function(sound) {
				sound = this.cachesound(sound);
				if(!this.enabled()) return;
				sound.play();
			},
			
			sequence: function(sound1, sound2) {
				var s1 = this.cachesound(sound1);
				var s2 = this.cachesound(sound2);

				if(!this.enabled()) return;

				// play audio in sequence
				s1.play();
				$(s1).on('ended', function(){
					s2.play();
					$(s1).off('ended');
				});
			}
		},

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

		timer: {
			time: 30,
			$el: $('.timer'),
			start: function(time, fn) {
				var seconds = time || this.time;
				var self = this;
				this.reset();
				this.$el.html(seconds + 's');
				this.interval = setInterval(function(){
					seconds--;
					self.$el.html(seconds + 's');
				}, 1000);
				
				this.timeout = setTimeout(function(){
					clearInterval(self.interval);
					self.$el.html('');
					if(fn) fn();
				}, seconds * 1000);
			},
			timeout: {},
			interval: {},
			reset: function() {
				clearTimeout(this.timeout);
				clearInterval(this.interval);
				this.$el.html('');
			}
		},

		message: function(msg, timeout) {
			console.log('create message');
			var $msg = $('<div class="message">'+msg+'</div>').appendTo('.message-queue');
			if(timeout) {
				setTimeout(function(){
					$msg.fadeOut();
					setTimeout(function(){
						$msg.remove();
					}, 500);
				}, timeout * 1000);
			}
			return $msg;
		}
	};
});