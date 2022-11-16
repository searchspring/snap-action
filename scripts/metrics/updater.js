const exit = require('process').exit;
const getCliArgs = require('../utils/getCliArgs');
const https = require('../utils/https');

const BRANCH_PREFIX = 'update/';
(async function () {
    try {
        const now = new Date()
        const args = getCliArgs(['runAttempt', 'actor', 'repository', 'branch', 'eventName', 'pullRequestID', 'startTime', 'conclusion', 'duration', 'failedStep', 'commitMessage', 'url', 'secrets-ci']);

        if (!args.siteId_Type === 'object' && (!args.siteIds || !args.siteNames || !args['secrets-ci'])) {
            console.log("Verify script requires 'siteId', 'repository' and 'secrets-ci' parameter")
            exit(1);
        }

        const { runAttempt, actor, repository, branch, eventName, pullRequestID, startTime, conclusion, duration, failedStep, commitMessage, url } = args;
        let secrets;
        try {
            secrets = JSON.parse(args['secrets-ci']);
        } catch (e) {
            console.log("Could not parse secrets. Please provide a 'secrets' parameter. Example: `secrets: ${{ toJSON(secrets) }}`");
        }

        const UPDATER_TOKEN = secrets['UPDATER_TOKEN'];
        const UPDATER_URL = secrets['UPDATER_URL'];

        let version;
        if (branch == 'production' && commitMessage.includes(`from searchspring-implementations/${BRANCH_PREFIX}`)) {
            version = commitMessage.split(BRANCH_PREFIX).pop();
        } else if (branch.includes(BRANCH_PREFIX)) {
            version = branch.split(BRANCH_PREFIX).pop();
        }

        if (!version) {
            console.log(`NOT Sending Updater Metrics - no version found!`);
            exit(1);
        }

        if (!UPDATER_TOKEN) {
            console.log(`NOT Sending Updater Metrics - no token found!`);
            exit(1);
        }

        const data = {
            version,
            runAttempt,
            actor,
            repository,
            branch,
            eventName,
            pullRequestID,
        }

        if (pullRequestID) {
            data.pullRequestID = pullRequestID;
        }

        if (startTime) {
            data.startTime = startTime;
        } else if (conclusion) {
            data.conclusion = conclusion;
            data.failedStep = failedStep;
            data.duration = duration;
            data.url = url;
        }

        console.log(`Sending Updater Metrics:`);
        console.log(data);

        const response = await https({
            hostname: UPDATER_URL,
            port: 443,
            path: `/api/action/${startTime ? 'start' : 'conclusion'}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': UPDATER_TOKEN,
            },
            body: JSON.stringify(data)
        })

        // when response is received
        if (response.status === 200 && response.data.success) {
            // success!
            console.log(`Snapp Updater successful response: `);
            console.log(response.data.message);
        } else if (response.status === 200 && !response.data.success) {
            console.log(`Snapp Updater rejected payload!`);
            console.log(response.data.message);
            exit(1);
        } else if (response.status !== 200) {
            console.log(`Could not send metrics to Updater!`);
            console.log(`Response status: ${response.status}`)
            exit(1);
        }
    } catch (err) {
        console.error('Error attempting to send Updater Metrics');
        console.error(err);
        exit(1);
    }
})();
