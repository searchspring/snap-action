const exit = require('process').exit;
const getCliArgs = require('../utils/getCliArgs');

(async function () {
    try {
        const args = getCliArgs(['text']);

        if(!args.text) {
            exit(0)
        }

        console.log(args.text.replaceAll(`\n`, ``).replaceAll(`\r`, ``).replaceAll(`'`, `\'`).replaceAll(`"`,` \"`));
        exit(0);        
    } catch (err) {
        console.error(`Error during escape.js - could not escape text: ${args.text}`);
        console.error(err);
        exit(1);
    }
})();