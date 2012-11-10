require.config({
	baseUrl: '/js/',
	paths: {
		'jquery': '//code.jquery.com/jquery.min',
		'RPSLS': 'rpsls',
		'lodash': 'lodash'
	},
	include: [
		'RPSLS'
	],
	out: 'main-build.js'
});

require(requirejs.s.contexts._.config.include);