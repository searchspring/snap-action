const exit = require('process').exit;
const getPatchId = require('./getPatchId');

(async function () {
    try {
        const args = getCliArgs(['commitMessage', 'branch']);
        
        const { commitMessage, branch } = args

        const { id } = getPatchId(commitMessage, branch)
        if(id) {
            console.log(id)
        } else {
            console.error("getPatchId didn't return id")
        }
        
        exit(0);        
    } catch (err) {
        if(err) {
            console.error(err)
        }
        exit(0);
    }
})();