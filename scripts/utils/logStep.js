const getCliArgs = require('./getCliArgs');
const boxify = require('./boxify');
const colorize = require('./colorize');

(async function () {
	const args = getCliArgs(['step']);
	const { step } = args;

	console.log(colorize.green(boxify(step)));
})();