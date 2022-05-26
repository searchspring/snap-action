const fsp = require('fs').promises;
const exit = require('process').exit;
const minimist = require('minimist');
const core = require('@actions/core');
const github = require('@actions/github');

const LIGHTHOUSE_FILE = './repository/tests/lighthouse/runs/manifest.json';
const METRICS_DIR = './metrics/data';

(async function () {
	try {
		await prepare();
		await generateMetrics();
	} catch (err) {
		console.error('unable to process lighthouse file');
		console.error(err);
		exit(1);
	}
})();

async function prepare() {
	try {
		await fsp.stat(METRICS_DIR);
	} catch (err) {
		// make metrics directory
	    await fsp.mkdir(METRICS_DIR, { recursive: true });
	}
}

async function generateMetrics() {
	try {
		await fsp.stat(LIGHTHOUSE_FILE);
	} catch (err) {
		throw 'no lighthouse data found!';
	}

    const now = new Date()
    const argv = minimist(process.argv.slice(2),  { '--': true });

	const lighthouseFileContents = await fsp.readFile(LIGHTHOUSE_FILE, 'utf8');
	const lighthouseData = JSON.parse(lighthouseFileContents);

    const representativeRun = lighthouseData.filter(run => run.isRepresentativeRun).pop();

    const { performance, accessibility, seo, pwa } = representativeRun.summary;
    const bestPractices = representativeRun.summary['best-practices'];

    const scores = {
        performance: toPercentage(performance),
        accessibility: toPercentage(accessibility),
        bestPractices: toPercentage(bestPractices),
        seo: toPercentage(seo),
        pwa: toPercentage(pwa),
        performance: toPercentage(performance),
    };    

    const { siteId, branch } = argv;
    const reportHTMLFile = representativeRun.htmlPath.split('/').pop();
    const report = `https://snapui.searchspring.io/${siteId}/.lighthouse/${branch}/${reportHTMLFile}`;
    const obj = {
        timestamp: now,
        type: 'snap-lighthouse',
        data: {
            siteId,
            branch,
            repository_owner: github.organization.login,
            repository: github.payload.repository.name,
            issue_number: github.payload.pull_request.number,
            report,
            scores
        }
    };
    
    const filename = `SnapAction-${github.payload.repository.name}-${github.eventName}}${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}${now.getMinutes()}.json`;
    const contents = JSON.stringify(obj, null, '  ');

    await fsp.writeFile(`${METRICS_DIR}/${filename}`, contents);

    console.log(`Generated lighthouse metrics file: ${filename}`);
    console.log(`${contents}\n`);
}

function toPercentage(value) {
    return Math.floor(value * 100);
}