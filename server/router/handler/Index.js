const user_handler = require("./user");
const check_handler = require("./checks");
const token_handler = require("./tokens");
const helpers = require("../../../utils/helpers");
// define the handlers, used by router
const acceptMethods = ["post", "get", "put", "delete"];
const CONTENT_HTML = "HTML";
const CONTENT_JSON = "JSON";

const handlers = {
    /* -----------------------html handler-----------------*/
    index: (data, callback) => {
        if (data.method === "get") {
            helpers.loadHtml("index", (err, str) => {
                if (!err && str) {
                    callback(200, str, CONTENT_HTML);
                } else {
                    callback(500, undefined, CONTENT_HTML);
                }
            });
        } else {
            callback(405, undefined, CONTENT_HTML);
        }
    },

    /* -----------------------json handler-----------------*/
    ping: (data, callback) => {
        callback(200);
    },

    notFound: (data, callback) => {
        callback(404, { error: "not such handlers" }, CONTENT_JSON);
    },

    // define the user handlers
    users: (data, callback) => {
        // see the data object in router module , line 25
        if (acceptMethods.indexOf(data.method) > -1) {
            // connect with the handler container
            user_handler[data.method](data, callback);
        } else {
            callback(404, { error: "no match user handler found" }, CONTENT_JSON);
        }
    },

    tokens: (data, callback) => {
        if (acceptMethods.indexOf(data.method) > -1) {
            token_handler[data.method](data, callback);
        } else {
            callback(404, { error: "no match token handler found" }, CONTENT_JSON);
        }
    },

    checks: (data, callback) => {
        if (acceptMethods.indexOf(data.method) !== -1) {
            check_handler[data.method](data, callback);
        } else {
            callback(404, { error: "no match checks handle found" }, CONTENT_JSON);
        }
    }
};

module.exports = handlers;
