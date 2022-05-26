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
    console.log("process.argv", process.argv)
    const argv = minimist(process.argv.slice(2),  { '--': true });
    console.log("argv", argv)
    console.log("github.context", github.context)


	const lighthouseContents = await fsp.readFile(LIGHTHOUSE_FILE, 'utf8');
	const lighthouseData = JSON.parse(lighthouseContents);

    const representativeRun = lighthouseData.filter(run => run.isRepresentativeRun).pop();

    const { performance, accessibility, seo, pwa  } = representativeRun.summary;
    const bestPractices = representativeRun.summary['best-practices'];
    const summary = {
        performance: toPercentage(performance),
        accessibility: toPercentage(accessibility),
        bestPractices: toPercentage(bestPractices),
        seo: toPercentage(seo),
        pwa: toPercentage(pwa),
        performance: toPercentage(performance),
    };    

    const { siteId, branch, repository } = argv;
    const reportHTMLFile = representativeRun.htmlPath.split('/').pop();
    const report = `https://snapui.searchspring.io/${siteId}/.lighthouse/${branch}/${reportHTMLFile}`;
    //              https://snapui.searchspring.io/undefined/.lighthouse/undefined/localhost-_lighthouse_html-2022_05_26_14_47_08.report.html",
    const obj = {
        timestamp: now,
        type: 'snap-lighthouse',
        data: {
            siteId,
            branch,
            repository_owner: github.repository_owner,
            repository,
            issue_number: github.issue_number,
            report,
            summary
        }
    };
    
    const filename = `SnapAction-${repository}-pull_request}${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}${now.getMinutes()}.json`;
    const contents = JSON.stringify(obj, null, '  ');

    await fsp.writeFile(`${METRICS_DIR}/${filename}`, contents);

    console.log(`Generated lighthouse metrics file: ${filename}`);
    console.log(`${contents}\n`);
}

function toPercentage(value) {
    return Math.floor(value * 100);
}