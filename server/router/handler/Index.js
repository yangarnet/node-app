const user_handler = require('./user');
const check_handler = require('./checks');
const token_handler = require('./tokens');
// define the handlers, used by router
const acceptMethods = ['post', 'get', 'put', 'delete'];

const handlers = {

    ping: (data, callback) => {
        callback(200);
    },

    notFound: (data, callback) => {
        callback(404, {error: 'not such handlers'});
    },

    // define the user handlers
    users: (data, callback) => {
        // see the data object in router module , line 25
        if(acceptMethods.indexOf(data.method) > -1) {
            // connect with the handler container
            user_handler[data.method](data, callback);
        } else {
            callback(404, {error: 'no match user handler found'});
        }
    },

    tokens: (data, callback) => {
        if(acceptMethods.indexOf(data.method) > -1) {
            token_handler[data.method](data, callback);
        } else {
            callback(404, {error: 'no match token handler found'});
        }
    },

    checks: (data, callback) => {
        if (acceptMethods.indexOf(data.method) !== -1) {
            check_handler[data.method](data, callback);
        } else {
            callback(404, {error: 'no match checks handle found'});
        }
    }
};

module.exports = handlers;
