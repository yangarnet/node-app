const user_handler = require('./user');
const check_handler = require('./checks');
const token_handler = require('./tokens');
const helpers = require('../../../utils/helpers');
// define the handler, used by router
const acceptMethods = ['post', 'get', 'put', 'delete'];

const handler = {
    /* -----------------------html handler-----------------*/
    index: data => {
        if (data.method === 'get') {
            const templateData = {
                'head.title': 'Uptime Monitoring - Made Simple',
                'head.description':
                    "We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we'll send you a text to let you know",
                'body.class': 'index'
            };
            return helpers.getHtml('index', templateData);
        }
    },

    // load account creation page
    accountCreate: (data, callback) => {
        if (data.method === 'get') {
            const templateData = {
                'head.title': 'register with us',
                'head.description': 'sign up with us and get started monitoring',
                'body.class': 'accountCreate'
            };
            helpers.getHtml('accountCreate', templateData, callback);
        }
    },

    // create session after register
    sessionCreate: (data, callback) => {
        if (data.method === 'get') {
            const templateData = {
                'head.title': 'log in your account',
                'head.description': 'Enter your phone number and passworkd to login to your account',
                'body.class': 'sessionCreate'
            };
            helpers.getHtml('sessionCreate', templateData, callback);
        }
    },
    sessionDeleted: (data, callback) => {
        if (data.method === 'get') {
            const templateData = {
                'head.title': 'log out your account',
                'head.description': 'you just log out of your account',
                'body.class': 'sessionDeleted'
            };
            helpers.getHtml('sessionDeleted', templateData, callback);
        }
    },
    // Account has been deleted
    accountDeleted: (data, callback) => {
        // Reject any request that isn't a GET
        if (data.method == 'get') {
            // Prepare data for interpolation
            var templateData = {
                'head.title': 'Account Deleted',
                'head.description': 'Your account has been deleted.',
                'body.class': 'accountDeleted'
            };
            helpers.getHtml('accountDeleted', templateData, callback);
        }
    },

    accountEdit: (data, callback) => {
        // Reject any request that isn't a GET
        if (data.method == 'get') {
            // Prepare data for interpolation
            var templateData = {
                'head.title': 'Account Settings',
                'body.class': 'accountEdit'
            };
            helpers.getHtml('accountEdit', templateData, callback);
        }
    },
    // Dashboard (view all checks)
    checkList: (data, callback) => {
        // Reject any request that isn't a GET
        if (data.method == 'get') {
            // Prepare data for interpolation
            var templateData = {
                'head.title': 'Dashboard',
                'body.class': 'checksList'
            };
            helpers.getHtml('checksList', templateData, callback);
        }
    },
    // Create a new check
    checkCreate: (data, callback) => {
        // Reject any request that isn't a GET
        if (data.method == 'get') {
            // Prepare data for interpolation
            var templateData = {
                'head.title': 'Create a New Check',
                'body.class': 'checksCreate'
            };
            helpers.getHtml('checksCreate', templateData, callback);
        }
    },
    checkEdit: (data, callback) => {
        // Reject any request that isn't a GET
        if (data.method == 'get') {
            // Prepare data for interpolation
            var templateData = {
                'head.title': 'Create a New Check',
                'body.class': 'checksEdit'
            };
            helpers.getHtml('checksEdit', templateData, callback);
        }
    },
    public: data => {
        return helpers.loadStaticResources(data);
    },

    /* -----------------------json handler-----------------*/
    ping: (data, callback) => {
        callback(200);
    },

    notFound: (data, callback) => {
        callback(404, { error: 'not such handler' }, helpers.CONTENT_TYPE.JSON);
    },

    // define the user handler
    users: (data, callback) => {
        // see the data object in router module , line 25
        if (acceptMethods.indexOf(data.method.toLowerCase()) > -1) {
            // connect with the handler container
            user_handler[data.method](data, callback);
        } else {
            callback(404, { error: 'no match user handler found' }, helpers.CONTENT_TYPE.JSON);
        }
    },

    tokens: (data, callback) => {
        if (acceptMethods.indexOf(data.method) > -1) {
            token_handler[data.method.toLowerCase()](data, callback);
        } else {
            callback(404, { error: 'no match token handler found' }, helpers.CONTENT_TYPE.JSON);
        }
    },

    checks: (data, callback) => {
        if (acceptMethods.indexOf(data.method.toLowerCase()) !== -1) {
            check_handler[data.method](data, callback);
        } else {
            callback(404, { error: 'no match checks handle found' }, helpers.CONTENT_TYPE.JSON);
        }
    }
};

module.exports = handler;
