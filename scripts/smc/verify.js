const exit = require('process').exit;
const https = require('https');

const getCliArgs = require('../utils/getCliArgs');

const verify = (siteId, name, secretKey) => {
    return new Promise(async (resolve, _) => {

        const data = JSON.stringify({
            name
        });

        const options = {
            hostname: 'smc-config-api.kube.searchspring.io',
            port: 443,
            path: `/api/customer/${siteId}/verify`,
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'User-Agent': '',
                'Authorization': `${secretKey}`
            },
        };

        const req = https.request(options, res => {
            res.on('data', res => {
                const response = JSON.parse(res);
                if(response.message === 'success') {
                    resolve(true);
                    console.log(`Authentication successful for siteId ${siteId}`)
                } else {
                    console.log(`Authentication failed for siteId ${siteId}`)
                    resolve(false)
                }
            });
        });

        req.on('error', error => {
            console.error(error);
            exit(1);
        });

        req.write(data);
        req.end();
    });
}

(async function () {
    try {
        const args = getCliArgs(['siteId_Type', 'siteId', 'repository', 'secretKey', 'siteIds', 'siteNames', 'secrets-ci']);

        if(args.siteId_Type !== 'string' && args.siteId_Type !== 'object') {
            console.log("Verify script requires 'siteId_Type' parameter with values either 'string' (single site) or 'object' (multi site)")
            exit(1);
        }
        if(!args.siteId_Type === 'string' && (!args.siteId || !args.repository || !args.secretKey)) {
            console.log("Verify script requires 'siteId', 'repository' and 'secretKey' parameter")
            exit(1);
        }
        if(!args.siteId_Type === 'object' && (!args.siteIds || !args.siteNames || !args['secrets-ci'])) {
            console.log("Verify script requires 'siteId', 'repository' and 'secrets-ci' parameter")
            exit(1);
        }

        let authFailed = false;
        if(args.siteId_Type === 'string') {
            // single site
            const name = args.repository;
            const success = await verify(args.siteId, name, args.secretKey);
            if(!success) {
                authFailed = true;
            }
        } else if (args.siteId_Type === 'object') {
            // multi site
            const siteIds = args.siteIds.split(',').filter(a => a);
            const siteNames = args.siteNames.split(',').filter(a => a);

            if(siteIds.length !== siteNames.length) {
                console.log("The amount of siteIds and siteNames does not match")
                exit(1);
            }
            
            const secrets = JSON.parse(args['secrets-ci']);

            for (let index = 0; index < siteIds.length; index++) {
                const siteId = siteIds[index];
                const name = siteNames[index];
                const secretKey = secrets[`WEBSITE_SECRET_KEY_${siteId.toUpperCase()}`] || secrets[`WEBSITE_SECRET_KEY_${siteId}`] || secrets[`WEBSITE_SECRET_KEY_${siteId.toLowerCase()}`];
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
        console.error('Error during authentication');
        console.error(err);
        exit(1);
    }
})();