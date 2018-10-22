'use strict';

module.exports = exports = content => {
	let xml = `<?xml version="1.0"?>
<document>
	<nitf>
		<head>
			<title>${content.title}</title>
		</head>
		<body>
			<body.head>
				<hedline>
					<hl1>${content.title}</hl1>
				</hedline>
				<byline>
					<bytag>${content.byline}</bytag>
				</byline>
			</body.head>
			<body.content>
				<block>
					${content.bodyXML__CLEAN}
					<p>Copyright The Financial Times Limited ${new Date(
						content.publishedDate
					).getFullYear()}</p>
					<p>&copy; ${new Date(
						content.publishedDate
					).getFullYear()} The Financial Times Ltd. All rights reserved. Please do not copy and paste FT articles and redistribute by email or post to the web.</p>
				</block>
			</body.content>
		</body>
	</nitf>
	<xn:Resource xmlns:xn="http://www.xmlnews.org/namespaces/meta#">
		<xn:resourceID>${content.id}</xn:resourceID>
		<xn:publicationTime>${content.publishedDate}</xn:publicationTime>
		<xn:title>${content.title}</xn:title>
		<xn:vendorData>FT______:Url=${content.webUrl}</xn:vendorData>
	</xn:Resource>
</document>`;

	return Buffer.from(xml, 'utf8');
};
