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

        let secretsData;
        try {
            const jsonSerializingCharacter = secrets.slice(1,2);
            console.log("jsonSerializingCharacter", jsonSerializingCharacter);

            const secretsUnserialized = secrets.split(`${jsonSerializingCharacter} "`).join('"').split(`"${jsonSerializingCharacter}}`).join('"}');
            secretsData = JSON.parse(secretsUnserialized)
        } catch(e) {
            console.log("Could not parse secrets");
        }

        
        
        
        
        

        if(siteId_Type == 'string') {
            // single site
            
        } else if (siteId_Type == 'object') {
            // multi site
            const siteIds = siteIds.split(',').filter(a => a);
            const siteNames = siteNames.split(',').filter(a => a);

            if(siteIds.length !== siteNames.length) {
                console.log("The amount of siteIds and siteNames does not match")
                exit(1);
            }

            siteIds.forEach(id => {
                if(!secretsData[`${id}_SECRET_KEY`]) {
                    console.log(`Could not find github secret '${id}_SECRET_KEY'.
                    It can be added by running 'snapfu secrets add' in the project's directory locally, 
                    or added manual in the project's repository secrets. 
                    The value can be obtained in the Searchspring Management Console.`);
                    exit(1);
                }
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

