module.exports = {
	files: {
		allow: [
			'test/fixtures/article.docx',
			'test/fixtures/video-small.mp4'
		],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			// content UUID
			'b59dff10-3f7e-11e7-9d56-25f963e998b2'
		]
	}
};
