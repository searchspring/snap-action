const exit = require('process').exit;
const getCliArgs = require('./getCliArgs');
const constants = require('./constants');

const { BRANCH_PREFIX, REVERT_BRANCH_PREFIX } = constants;

function getPatchId(commitMessage, branch) {
    let id, version;

    if (branch == 'production' && commitMessage.includes(`from searchspring-implementations/${BRANCH_PREFIX}`)) {
        version = commitMessage.split(BRANCH_PREFIX).pop().split('\n').shift();
        id = BRANCH_PREFIX + version;
    } else if (branch == 'production' && commitMessage.includes(`from searchspring-implementations/${REVERT_BRANCH_PREFIX}`)) {
        version = commitMessage.split(REVERT_BRANCH_PREFIX).pop().split('\n').shift();
        id = REVERT_BRANCH_PREFIX + version;
    } else if (branch.includes(BRANCH_PREFIX)) {
        id = branch;
    } else if (branch.includes(REVERT_BRANCH_PREFIX)) {
        id = branch;
    }

    return { id, version };
}

(async function () {
    try {
        const args = getCliArgs(['commitMessage', 'branch']);
        
        const { commitMessage, branch } = args

        const { id } = getPatchId(commitMessage, branch)
        if(id) {
            console.log(id)
        }
        
        exit(0);        
    } catch (err) {
        exit(0);
    }
})();

module.exports = getPatchId;