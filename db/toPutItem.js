'use strict';

module.exports = exports = (data, schema) => {
	let item = {
		Item: {},
		TableName: schema.TableName
	};

	schema.AttributeDefinitions.reduce((acc, def) => {
		if (Object.prototype.hasOwnProperty.call(data, def.AttributeName)) {
			acc[def.AttributeName] = {
				[def.AttributeType]: data[def.AttributeName]
			};
		}

		return acc;
	}, item.Item);

	return item;
};
