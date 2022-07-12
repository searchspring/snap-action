const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const exit = require('process').exit;
const minimist = require('minimist');

const verify = (siteId, name, secretKey) => {
    return new Promise(async (resolve, _) => {
        const body = { name };
        const response = await fetch(`https://smc-config-api.kube.searchspring.io/api/customer/${siteId}/verify`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'accept': 'application/json',
                'User-Agent': '',
                'Authorization': `${secretKey}`
            }
        });
        const data = await response.json();
        if(data.message === 'success') {
            console.log(`Authentication successful for siteId ${siteId}`)
            resolve(true)
        } else {
            console.log(`Authentication failed for siteId ${siteId}`)
            resolve(false)
        }
    });
}

(async function () {
    try {
        const argv = minimist(process.argv.slice(2),  { '--': true });

        if(argv['siteId_Type'] !== 'string' || argv['siteId_Type'] !== 'object') {
            console.log("Verify script requires 'siteId_Type' parameter with values either 'string' (single site) or 'object' (multi site)")
            console.log("argv['siteId_Type']", argv['siteId_Type'])
            exit(1);
        }
        if(!argv['siteId_Type'] === 'string' && (!argv['siteId'] || !argv['repository'] || !argv['secretKey'])) {
            console.log("Verify script requires 'siteId', 'repository' and 'secretKey' parameter")
            exit(1);
        }
        if(!argv['siteId_Type'] === 'object' && (!argv['siteIds'] || !argv['siteNames'] || !argv['secrets-ci'])) {
            console.log("Verify script requires 'siteId', 'repository' and 'secrets-ci' parameter")
            exit(1);
        }

        let authFailed = false;
        if(argv.siteId_Type === 'string') {
            // single site
            const siteId = argv.siteId;
            const name = argv.repository;
            const secretKey = argv.secretKey;

            const success = await verify(siteId, name, secretKey);
            if(!success) {
                authFailed = true;
            }
        } else if (argv.siteId_Type === 'object') {
            // multi site
            const siteIds = argv.siteIds.split(',').filter(a => a);
            const siteNames = argv.siteNames.split(',').filter(a => a);

            if(siteIds.length !== siteNames.length) {
                console.log("The amount of siteIds and siteNames does not match")
                exit(1);
            }
            
            let secretsData;
            try {
                const jsonSerializingCharacter = argv['secrets-ci'].slice(1,2);
                const secretsUnserialized = argv['secrets-ci'].split(`${jsonSerializingCharacter} "`).join('"').split(`"${jsonSerializingCharacter}}`).join('"}');
                secretsData = JSON.parse(secretsUnserialized)
            } catch(e) {
                console.log("Could not parse secrets");
                exit(1);
            }

            for (let index = 0; index < siteIds.length; index++) {
                const siteId = siteIds[index];
                const name = siteNames[index];
                const secretKey = secretsData[`WEBSITE_SECRET_KEY_${siteId.toUpperCase()}`] || secretsData[`WEBSITE_SECRET_KEY_${siteId}`] || secretsData[`WEBSITE_SECRET_KEY_${siteId.toLowerCase()}`];
                if(!secretKey) {
                    console.log(`
Could not find Github secret 'WEBSITE_SECRET_KEY_${siteId.toUpperCase()}' in 'secrets' input.
It can be added by running 'snapfu secrets add' in the project's directory locally, 
or added manual in the project's repository secrets. 
The value can be obtained in the Searchspring Management Console.
Then ensure that you are providing 'secrets' when running the action. ie:
jobs:
  Publish:
    runs-on: ubuntu-latest
    name: Snap Action
    steps:
      - name: Checkout action
        uses: actions/checkout@v2
        with:
          repository: searchspring/snap-action
      - name: Run @searchspring/snap-action
        uses: ./
        with:
          secrets: \${{ toJSON(secrets) }}
          ...
`);
                    exit(1);
                }

                const success = await verify(siteId, name, secretKey);
                if(!success) {
                    authFailed = true;
                }
            }
        }

        if(authFailed) {
            exit(1);
        }
        exit(0);
    } catch (err) {
        console.error('unable to process verify file');
        console.error(err);
        exit(1);
    }
})();