require.config({
	baseUrl: '/js/',
	paths: {
		'jquery': '//code.jquery.com/jquery.min',
		'RPSLS': 'rpsls',
		'setup': 'setup',
		'lodash': 'lodash'
	},
	include: [
		'RPSLS',
		'setup'
	],
	out: 'main-build.js'
});

require(requirejs.s.contexts._.config.include);