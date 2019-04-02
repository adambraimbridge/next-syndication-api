const MaskLogger = require('@financial-times/n-mask-logger').default;

module.exports = new MaskLogger([
	'email',
	'password',
	'contract_id',
	'first_name',
	'surname',
	'x-api-key'
]);
