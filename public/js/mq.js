define([
	'jquery',
	'utils'
], function(
	$,
	utils
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

		accept: function() {

		},
		
		reject: function(e){
			$(e.currentTarget).parents('.message').hide();
		}
	};

	return new MQ();
});