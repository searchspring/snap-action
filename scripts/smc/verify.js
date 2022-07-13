const exit = require('process').exit;
const https = require('https');

const verify = (siteId, name, secretKey) => {
    return new Promise(async (resolve, _) => {

        const data = JSON.stringify({
            name
        });

        const options = {
            hostname: 'https://smc-config-api.kube.searchspring.io',
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
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', d => {
                process.stdout.write(d);
            });
        });

        req.on('error', error => {
            console.error(error);
        });

        req.write(data);
        req.end();
        
        
        // if(data.message === 'success') {
        //     console.log(`Authentication successful for siteId ${siteId}`)
        //     resolve(true)
        // } else {
        //     console.log(`Authentication failed for siteId ${siteId}`)
        //     resolve(false)
        // }
    });
}

function getCliArg(name) {
    const args = process.argv.slice(2);
    try {
        return args.filter(arg => arg.includes(`--${name}=`)).pop().split('=')[1]
    } catch(e) {
        return '';
    }
}

(async function () {
    try {
        const args = process.argv.slice(2);
        console.log("args", args);

        const siteId_Type = getCliArg('siteId_Type');
        console.log("siteId_Type", siteId_Type);

        const siteId = getCliArg('siteId');
        console.log("siteId", siteId);

        const repository = getCliArg('repository');
        console.log("repository", repository);

        const secretKey = getCliArg('secretKey');
        console.log("secretKey", secretKey);

        const siteIds = getCliArg('siteIds');
        console.log("siteIds", siteIds);

        const siteNames = getCliArg('siteNames');
        console.log("siteNames", siteNames);

        const secretsCi = getCliArg('secrets-ci');
        console.log("secrets-ci", secretsCi);


        if(siteId_Type !== 'string' && siteId_Type !== 'object') {
            console.log("Verify script requires 'siteId_Type' parameter with values either 'string' (single site) or 'object' (multi site)")
            exit(1);
        }
        if(!siteId_Type === 'string' && (!siteId || !repository || !secretKey)) {
            console.log("Verify script requires 'siteId', 'repository' and 'secretKey' parameter")
            exit(1);
        }
        if(!siteId_Type === 'object' && (!siteIds || !siteNames || !secretsCi)) {
            console.log("Verify script requires 'siteId', 'repository' and 'secrets-ci' parameter")
            exit(1);
        }

        let authFailed = false;
        if(siteId_Type === 'string') {
            // single site
            const name = repository;
            const success = await verify(siteId, name, secretKey);
            if(!success) {
                authFailed = true;
            }
        } else if (siteId_Type === 'object') {
            // multi site
            const siteIds = siteIds.split(',').filter(a => a);
            const siteNames = siteNames.split(',').filter(a => a);

            if(siteIds.length !== siteNames.length) {
                console.log("The amount of siteIds and siteNames does not match")
                exit(1);
            }
            
            let secretsData;
            try {
                const jsonSerializingCharacter = secretsCi.slice(1,2);
                const secretsUnserialized = secretsCi.split(`${jsonSerializingCharacter} "`).join('"').split(`"${jsonSerializingCharacter}}`).join('"}');
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
        console.error('Error during authentication');
        console.error(err);
        exit(1);
    }
})();