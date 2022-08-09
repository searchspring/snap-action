const exit = require('process').exit;
const getCliArgs = require('../utils/getCliArgs');

(async function () {
    try {
        const args = getCliArgs(['tags']);
        console.log("tag.js: ")
        console.log(args.tags);
        // exit(args.tags)
        // if(args.tags !== 'string' && args.siteId_Type !== 'object') {
        //     console.log("Verify script requires 'siteId_Type' parameter with values either 'string' (single site) or 'object' (multi site)")
        //     exit(1);
        // }
        


       
        exit(0);
    } catch (err) {
        console.error('Error during authentication');
        console.error(err);
        exit(1);
    }
})();