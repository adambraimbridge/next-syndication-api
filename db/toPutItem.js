'use strict';

module.exports = exports = (data, schema) => {
	return {
		Item: assignProperties(data, schema.AttributeDefinitions),
		TableName: schema.TableName
	};
};

function assignProperties(data, schema, item = {}, simplify) {
	schema.reduce((acc, def) => {
		if (Object.prototype.hasOwnProperty.call(data, def.AttributeName)) {
			const ATTRIBUTE_ID = def.AttributeAlias || def.AttributeName;

			let val = data[def.AttributeName];

			acc[ATTRIBUTE_ID] = {};

			if (Array.isArray(def.AttributeDefinitions)) {
				switch (def.AttributeType) {
					case 'L':
						if (!Array.isArray(val)) {
							val = [val];
						}

						acc[ATTRIBUTE_ID][def.AttributeType] = val.map(raw => {
							return {
								M: assignProperties(raw, def.AttributeDefinitions)
							};
						});

						break;
					case 'M':
						acc[ATTRIBUTE_ID][def.AttributeType] = assignProperties(val, def.AttributeDefinitions);

						break;
				}
			}
			else {
				if (simplify === true) {
					acc[ATTRIBUTE_ID] = val;
				}
				else {
					acc[ATTRIBUTE_ID][def.AttributeType] = def.AttributeType === 'N' ? String(val) : val;
				}
			}
		}

		return acc;
	}, item);

	return item;
}
