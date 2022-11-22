const getCliArgs = require('./getCliArgs');
const boxify = require('./boxify');
const colorize = require('./colorize');

(async function () {
	const args = getCliArgs(['step', 'message']);
	const { step, message } = args;

	console.log(colorize.green(boxify(step, message)));
})();