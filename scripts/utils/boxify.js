function boxify(inside) {
	const boxTopper = `┌${'─'.repeat(inside.length + 2)}┐`;
	const boxMiddle = `│ ${inside} │`;
	const boxBottom = `└${'─'.repeat(inside.length + 2)}┘`;

	return `${boxTopper}\n${boxMiddle}\n${boxBottom}`;
}

module.exports = boxify;