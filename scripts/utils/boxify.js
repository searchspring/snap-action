function boxify(inside, message) {
	const boxTopper = `┌${'─'.repeat(inside.length + 2)}┐`;
	const boxMiddle = `│ ${inside} │ ${message || ''}`;
	const boxBottom = `└${'─'.repeat(inside.length + 2)}┘`;

	return `${boxTopper}\n${boxMiddle}\n${boxBottom}`;
}

module.exports = boxify;