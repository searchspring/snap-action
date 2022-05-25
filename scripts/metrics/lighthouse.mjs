import { promises as fsp } from 'fs';
import { exit } from 'process';

const LIGHTHOUSE_FILE = './repository/tests/lighthouse/runs/manifest.json';
const METRICS_DIR = './metrics/data';

(async function () {
	try {
		await prepare();

		await generateMetrics(now);
	} catch (err) {
		console.error('unable to process coverage file');
		console.error(err);
		exit(1);
	}
})();

async function prepare() {
	try {
        console.log("got here1")
		await fsp.stat(METRICS_DIR);
	} catch (err) {
        console.log("got here2")
		// make metrics directory
	    await fsp.mkdir(METRICS_DIR);
	}
}

async function generateMetrics() {
	try {
		await fsp.stat(LIGHTHOUSE_FILE);
	} catch (err) {
		throw 'no lighthouse data found!';
	}
    console.log("got here3")

    const now = new Date();
    const argv = require('minimist')(process.argv.slice(2));

	const lighthouseContents = await fsp.readFile(LIGHTHOUSE_FILE, 'utf8');
	const lighthouseData = JSON.parse(lighthouseContents);

    const representativeRun = lighthouseData.filter(run => run.isRepresentativeRun);
    const summary = representativeRun.map(run => {
        const { performance, accessibility, seo, pwa  } = run.summary;
        const bestPractices = run.summary['best-practices'];

        return {
            performance: toPercentage(performance),
            accessibility: toPercentage(accessibility),
            bestPractices: toPercentage(bestPractices),
            seo: toPercentage(seo),
            pwa: toPercentage(pwa),
            performance: toPercentage(performance),
        };
    }).pop();

    const { siteId, branch, repository_owner, repository, issue_number } = argv;
    const reportHTMLFile = representativeRun.htmlPath.split('/').pop();
    const report = `https://snapui.searchspring.io/${siteId}/.lighthouse/${branch}/${reportHTMLFile}`;
    const obj = {
        timestamp: now,
        type: 'snap-lighthouse',
        data: {
            repository_owner,
            repository,
            issue_number,
            report,
            summary
        }
    };
    
    const filename = `SnapAction-${repository}-pull_request}${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}${now.getMinutes()}.json`;
    const contents = JSON.stringify(obj, null, '  ');

    console.log("got here4")
    await fsp.writeFile(`${METRICS_DIR}/${filename}`, contents);

    console.log(`Generated lighthouse metrics file: ${filename}`);
    console.log(`${contents}\n`);
}

function toPercentage(value) {
    return Math.floor(value * 100);
}