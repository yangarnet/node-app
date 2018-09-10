// get the string decoder for decoding request payload
const StringDecoder = require("string_decoder").StringDecoder;
const url = require("url");

const helpers = require("../../utils/helpers");
const handler = require("./handler/Index");

// define the router configuration here
const routerConfig = {
    // add new routes to server html
    "": handler.index,
    "account/create": handler.accountCreate,
    "account/edit": handler.accountEdit,
    "account/delete": handler.accountDelete,
    "session/create": handler.sessionCreate,
    "session/deleted": handler.sessionDeleted,
    "checks/all": handler.checkList,
    "checks/create": handler.checkCreate,
    "checks/edit": handler.checkEdit,
    sample: handler.sample,
    ping: handler.ping,
    users: handler.users,
    tokens: handler.tokens,
    checks: handler.checks,
    // this is the core router/service to check the server(given by url) status
    pings: handler.pings,
    // loading static files like css and js
    'public': handler.public
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

    /* ------- get the payload from the request , after getting the payload, select handler */
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
        let selectedHandler = typeof routerConfig[trimmedPath] !== "undefined" ? routerConfig[trimmedPath] : handler.notFound;
        // cater the static public resource
        selectedHandler = trimmedPath.indexOf('public/') > -1 ? handler.public : selectedHandler;

        // the data object here contains important info to choose property handler
        const data = {
            trimmedPath,
            query,
            method, // will be used for selecting routes in the handler
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // run the handler
        selectedHandler(data, (statusCode, payload, contentType) => {
            statusCode = typeof statusCode == "number" ? statusCode : 400;

            if (contentType === handler.CONTENT_TYPE.JSON) {
                payload = JSON.stringify(typeof payload == "object" ? payload : {});

            } else if (contentType === handler.CONTENT_TYPE.HTML) {
                payload = typeof payload === "string" ? payload : "";
            } else {
                // loading static asset like js and css
                payload = typeof payload !== "undefined" ? payload : "";
            }

            res.setHeader("Content-Type", contentType);
            res.writeHead(statusCode);
            // we MUST call res.end() on each response!
            res.end(payload);

        });
    });
};

module.exports = router;
