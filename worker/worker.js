const url = require('url');

// define a container
const worker = {};

worker.init = () => {
    // run the checks
    // set the call loop
    worker.loop();
};

worker.loop = () => {
    setInterval(() => {
        worker.getAllChecks();
    }, 100000);
};

worker.getAllChecks = () => {
    // do the read json file stuff to get the getAllChecks
    // validation and then performCheck
    worker.validateCheckData();
};

worker.validateCheckData = (dataToCheck) => {
    // check the payload
    const {id, userPhone, protocol, url, method, successCode, timeoutSeconds } = dataToCheck;
    if (id && userPhone && protocol && url && method && successCode && timeoutSeconds) {
        // this is how to check the server status
        worker.performCheck();
    }
};

//  this is the core: how to check server status is up or down
worker.performCheck = (payload) => {
    // prepare the initial check outcome
    const checkOutcome = {
        error: false,
        respoonseCode: false
    };
    let checkOutcomeSent = false;
    const parsedUrl = url.parse(`${payload.protocol}://${payload.url}`, true);
    const hostName = parsedUrl.hostname;
    // path include the query
    const path = parsedUrl.path;

    // build request requestDetails
    const requestDetail = {
        protocol: 'http:',
        hostname: hostName,
        method: payload.method,
        timeout: payload.timeoutSeconds * 1000,
        path: payload.path
    };

    //core: instantiate the web request to check server up or down status : http ot httpServer
    const req = http.request(requestDetail, response => {
        const status = response.statusCode;
        checkOutcome.respoonseCode = status;
        // check if response has been sent back
        if(!checkOutcomeSent) {
            // say switch server etc.
            worker.processCheckOutcome(payload, checkOutcome);
            checkOutcomeSent = true;
        }
    });
    // deal error from the req
    req.on('error', error => {
        chechOutcome.error = { error: true, value: error};
        if(!checkOutcomeSent) {
            worker.processCheckOutcome(payload, checkOutcome);
            checkOutcomeSent = true;
        }
    });
    // deal error in timeout
    req.on('timeout', error => {
        chechOutcome.error = { error: true, value: 'server timeout'};
        if(!checkOutcomeSent) {
            worker.processCheckOutcome(payload, checkOutcome);
            checkOutcomeSent = true;
        }
    });

    // end the request to check mail server status
    req.end();
};


worker.processCheckOutcome = (checkOutcome) => {
    const state = !checkOutcome.error && checkOutcome.respoonseCode;
    // do what you want
    if(!statue) {
        worker.alertUserByEmail();
    }
};

worker.alertUserByEmail = () => {
    // do send email or sms here.
};


module.exports = worker;
