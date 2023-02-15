const exit = require('process').exit;
const getCliArgs = require('./getCliArgs');
const constants = require('./constants');

const { BRANCH_PREFIX, REVERT_BRANCH_PREFIX } = constants;

(async function () {
    try {
        const args = getCliArgs(['commitMessage']);
        
        const { commitMessage } = args

        if(commitMessage) {
            if (commitMessage.includes(`from searchspring-implementations/${BRANCH_PREFIX}`)) {
                const version = commitMessage.split(BRANCH_PREFIX).pop().split('\n').shift();
                if(version) {
                    console.log(`${BRANCH_PREFIX}${version}`)
                }
            } else if (commitMessage.includes(`from searchspring-implementations/${REVERT_BRANCH_PREFIX}`)) {
                const version = commitMessage.split(REVERT_BRANCH_PREFIX).pop().split('\n').shift();
                if(version) {
                    console.log(`${REVERT_BRANCH_PREFIX}${version}`)
                }
            }
        }
        
        exit(0);        
    } catch (err) {
        exit(0);
    }
})();