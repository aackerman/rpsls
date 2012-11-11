define([
	'jquery',
	'utils',
	'socket',
	'pstore',
	'challenge'
], function(
	$,
	utils,
	socket,
	pstore,
	challenge
){
	var MQ = function() {
		this.$el = $('.message-queue');
		utils.eventDelegation.call(this);
	};

	MQ.prototype = {
		
		events: {
			'.accept click': 'accept',
			'.reject click': 'reject'
		},

		accept: function(e) {
			challenge.acceptChallenge();
			$(e.currentTarget).parents('.message').hide();
		},
		
		reject: function(e){
			challenge.rejectChallenge();
			$(e.currentTarget).parents('.message').hide();
		}
	};

	return new MQ();
});