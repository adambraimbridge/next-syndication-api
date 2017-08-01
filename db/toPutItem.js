'use strict';

const { JS_TO_DB_TYPES } = require('config');

module.exports = exports = (data, schema) => {
	return {
		Item: assignProperties(data, schema.AttributeDefinitions),
		TableName: schema.TableName
	};
};

exports.assignProperties = assignProperties;
exports.getValue = getValue;
exports.getType = getType;

function assignProperties(data, schema, item = {}, simplify) {
	if (!schema) {
		for (let [key, val] of Object.entries(data)) {
			let def = { AttributeType: getType(val) };
			val = getValue(val, def);

			if (val !== null) {
				item[key] = {
					[def.AttributeType]: val
				};
			}
		}

		return item;
	}

	schema.reduce((acc, def) => {
		if (Object.prototype.hasOwnProperty.call(data, def.AttributeName) || Object.prototype.hasOwnProperty.call(data, def.AttributeAlias)) {
			const ATTRIBUTE_ID = def.AttributeAlias || def.AttributeName;

			let val = Object.prototype.hasOwnProperty.call(data, def.AttributeName)
					? data[def.AttributeName]
					: data[def.AttributeAlias];

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
			else if (def.AttributeType === 'L' && def.AttributeItemTypes) {
				acc[ATTRIBUTE_ID][def.AttributeType] = val.map(item => {
					return { [def.AttributeItemTypes]: getValue(item, { AttributeType: def.AttributeItemTypes }) };
				});
			}
			else {
				val = getValue(val, def);

				if (val !== null) {
					if (simplify === true) {
						acc[ATTRIBUTE_ID] = val;
					}
					else {
						if (def.AttributeType === 'M') {
							acc[ATTRIBUTE_ID][def.AttributeType] = assignProperties(val);
						}
						else {
							acc[ATTRIBUTE_ID][def.AttributeType] = val;
						}
					}
				}
			}
		}

		return acc;
	}, item);

	return item;
}

function getType(item) {
	let [, type] = Object.prototype.toString.call(item).split(' ');

	type = type.substring(0, type.length - 1).toLowerCase();

	type = JS_TO_DB_TYPES[type];

	return type;
}

function getValue(val, def) {
	if (val === null || typeof val === 'undefined') {
		if (Object.prototype.hasOwnProperty.call(def, 'DefaultValue')) {
			val = def.DefaultValue;
		}
		else {
			return null;
		}
	}

	return def.AttributeType === 'N' ? String(val) : val;
}
