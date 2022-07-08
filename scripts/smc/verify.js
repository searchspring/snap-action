const fetch = import('node-fetch');
const fsp = require('fs').promises;
const exit = require('process').exit;
const minimist = require('minimist');
const github = require('@actions/github');

const core = require('@actions/core');

const LIGHTHOUSE_FILE = './repository/tests/lighthouse/runs/manifest.json';
const METRICS_DIR = './metrics';


(async function () {
    try {
    
        const argv = minimist(process.argv.slice(2),  { '--': true });
        const { siteId_Type, siteId, siteIds, siteNames, siteSecretKeys, secretKey, secrets } = argv;

        console.log("siteId_Type", siteId_Type)
        console.log("siteId", siteId)
        console.log("siteIds", siteIds)
        console.log("siteNames", siteNames)
        console.log("secretKey", secretKey)
        console.log("siteSecretKeys", siteSecretKeys)
        console.log("secrets", secrets)

        try {
            const secretsData = JSON.parse(secrets.replaceAll('n', ''))
            console.log("secretsData['WEBSITE_SECRET_KEY']", secretsData['WEBSITE_SECRET_KEY'])
        } catch(e) {
            console.log("Could not parse secrets");
            console.log(e);
        }

        
        
        
        

        if(siteId_Type == 'string') {
            // single site
            
        } else if (siteId_Type == 'object') {
            // multi site
            siteIds.split(',').forEach(id => {
                console.log("id: ", id);
                // console.log("secret is", secrets[`${id.toUpperCase()}_SECRET_KEY`])
                
                
            });
        }

        const body = { 
            name: ''
        };
        

        // const response = await fetch(`https://smc-config-api.kube.searchspring.io/api/customer/${siteId}/verify`, {
        //     method: 'post',
        //     body: JSON.stringify(body),
        //     headers: {
        //         // 'Content-Type': 'application/json',
        //         'accept': 'application/json',
        //         'User-Agent': '',
        //         'Authorization': `${secretKey}`
        //     }
        // });
        // const data = await response.json();
        // console.log("data", data);
        
    } catch (err) {
        console.error('unable to process verify file');
        console.error(err);
        exit(1);
    }
})();

