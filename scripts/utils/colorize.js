const colorCodes = {
	reset: '\x1b[0m',
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	crimson: '\x1b[38m',
};

const colorize = {
	black: (msg) => logColor(colorCodes.black, msg),
	red: (msg) => logColor(colorCodes.red, msg),
	green: (msg) => logColor(colorCodes.green, msg),
	yellow: (msg) => logColor(colorCodes.yellow, msg),
	blue: (msg) => logColor(colorCodes.blue, msg),
	magenta: (msg) => logColor(colorCodes.magenta, msg),
	cyan: (msg) => logColor(colorCodes.cyan, msg),
	white: (msg) => logColor(colorCodes.white, msg),
	crimson: (msg) => logColor(colorCodes.crimson, msg),
}

function logColor(colorCode, value) {
	return value.split('\n').map(line => {
		return `${colorCode}${line}${colorCodes.reset}`;
	}).join('\n');
}

module.exports = colorize;