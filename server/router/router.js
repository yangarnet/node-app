// get the string decoder for decoding request payload
const StringDecoder = require("string_decoder").StringDecoder;
const url = require("url");

const helpers = require("../../utils/helpers");
const handlers = require("./handler/Index");

// define the router configuration here
const routerConfig = {
    sample: handlers.sample,
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks,
    // this is the core router/service to check the server(given by url) status
    pings: handlers.pings
};

const router = (req, res) => {
    // request method
    const method = req.method.toLowerCase();
    // get the request header
    const headers = req.headers;
    // when set the 2nd param is true, is means parsing the query in url as well
    const parsedUrl = url.parse(req.url, true); // url.parse(urlString[, parseQueryString[, slashesDenoteHost]])

    // get the query object form parsedUrl
    const query = parsedUrl.query;
    // get the path name from parsedUrl
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    /* ------- get the payload from the request , after getting the payload, select handlers */
    // get the payload from the request, we need the string coder to decode buffer
    const decoder = new StringDecoder("utf-8");
    let buffer = "";
    // bind with data event
    req.on("data", data => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();

        // select the handler base on the trimmed path
        const selectedHandler =
            typeof routerConfig[trimmedPath] !== "undefined"
                ? routerConfig[trimmedPath]
                : handlers.notFound;

        // the data object here contains important info to choose property handler
        const data = {
            trimmedPath,
            query,
            method, // will be used for selecting routes in the handler
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // run the handler
        selectedHandler(data, (statusCode, payload) => {
            statusCode = typeof statusCode == "number" ? statusCode : 400;
            payload = typeof payload == "object" ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            // we MUST call res.end() on each response!
            res.end(payloadString);

            console.log(`status: ${statusCode}\n`);
            console.log(`response: ${JSON.stringify(payloadString, null, 4)}`);
        });
    });
};

module.exports = router;
