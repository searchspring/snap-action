const nodeHttps = require('node:https');

function https({ body, ...options }) {
    return new Promise((resolve, reject) => {
        const req = nodeHttps.request({
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let resBody = Buffer.concat(chunks);
                switch (res.headers['content-type']) {
                    case 'application/json':
                    case 'application/json; charset=utf-8':
                        resBody = JSON.parse(resBody);
                        break;
                }
                resolve({
                    status: res.statusCode,
                    data: resBody
                })
            })
        })
        req.on('error', reject);
        if (body) {
            req.write(body);
        }
        req.end();
    })
}

module.exports = https;