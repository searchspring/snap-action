import { STATUS_CODES } from 'http';

const fsp = require('fs').promises;
const exit = require('process').exit;
const getCliArgs = require('../utils/getCliArgs');

export const BRANCH_PREFIX = 'update/';

(async function () {
    try {
        const now = new Date()
        const args = getCliArgs(['runAttempt', 'actor', 'repository', 'branch', 'eventName', 'pullRequestID', 'startTime', 'conclusion', 'duration', 'failedStep', 'commitMessage', 'url', 'secrets-ci']);

        if(!args.siteId_Type === 'object' && (!args.siteIds || !args.siteNames || !args['secrets-ci'])) {
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

        const ACTION_TOKEN = secrets['UPDATER_TOKEN'];
        const ACTION_URL = secrets['UPDATER_URL'];
        
        let version;
        if (branch == 'production' && commitMessage.includes(`from searchspring-implementations/${BRANCH_PREFIX}`)) {
            version = commitMessage.split(BRANCH_PREFIX)[1];
        } else if (branch.includes(BRANCH_PREFIX)) {
            version = branch.split(BRANCH_PREFIX)[0];
        }

        if (!version) {
            console.log(`NOT Sending Updater Metrics!`);
            exit(0); //TODO: change to 1 if it's possible to detect if action is running on self-hosted
        }

        if (!ACTION_TOKEN) {
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
        console.log(`${data}\n`);

        const response = await fetch(ACTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ACTION_TOKEN
            },
            body: data
        });

        const responseData = response.json();

        // when response is received
        if (response.status === 200 && !responseData.success) {
            console.log(`Snapp Updater rejected payload!`);
            console.log(responseData.message);
            exit(1);
        } else {
            console.log(`Could not send metrics to Updater!`);
            console.log(`Response status: ${response.status}, ${response.statusText}`)
            exit(1);
        }
    } catch (err) {
        console.error('Error attempting to send Updater Metrics');
        console.error(err);
        exit(1);
    }
})();


