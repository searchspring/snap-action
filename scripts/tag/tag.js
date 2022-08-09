const exit = require('process').exit;
const getCliArgs = require('../utils/getCliArgs');
const cmp = require('../utils/cmp');

(async function () {
    try {
        const args = getCliArgs(['tags']);

        if(!args.tags) {
            console.error("tags.js did not recieve any tags")
            exit(1);
        }
        console.log("args.tags: ", args.tags)

        const tags = args.tags.split('\n').map(tag => tag.trim()).filter(tag => tag);
        tags.sort(cmp);
        
        const latestTag = tags[tags.length - 1];
        let [tag, suffix] = latestTag.split('-');
        suffix = Number(suffix);

        if(isNaN(suffix)) {
            // creates first suffix version
            console.log(`${tag}-1`)
            exit(0);
        }

        // increment suffix
        console.log(`${tag}-${++suffix}`)
        exit(0);

    } catch (err) {
        console.error('Error during tag increment');
        console.error(err);
        exit(1);
    }
})();