const _data = require('../../../lib/data');
const config = require('../../config/config');
const helper = require('../../../utils/helpers');
const token_handler = require('./tokens');

const check_handler = {
    // how to get rid of this call back hell?
    /*require chedk data: protocl, url, method, successcode, timeout secoonds */
    post(data, callback) {
        const { protocol, url, method, successCodes, timeoutSeconds } = data.payload;
        if (protocol && url && method && successCodes && timeoutSeconds) {
            // get the token from request header
            const token = typeof data.headers.token === 'string' ? data.headers.token : false;
            _data.read('tokens', token, (err, tokenData) => {
                if (!err && tokenData) {
                    _data.read('users', tokenData.phone, (err, userData) => {
                        if (!err && userData) {
                            const userChecks =
                                //create new user check or just use existing checks
                                typeof userData.checks === 'object' && userData.checks instanceof Array
                                    ? userData.checks
                                    : [];
                            if (userChecks.length < config.maxChecks) {
                                const checkId = helper.createRandomString(15);
                                const checkObj = {
                                    id: checkId,
                                    userPhone: userData.phone,
                                    url,
                                    protocol,
                                    method,
                                    successCodes,
                                    timeoutSeconds
                                };
                                _data.create('checks', checkId, checkObj, (err, res) => {
                                    if (!err && res) {
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);
                                        _data.update('users', userData.phone, userData, err => {
                                            if (!err) {
                                                callback(200, checkObj, helper.CONTENT_TYPE.JSON);
                                            } else {
                                                callback(
                                                    500,
                                                    { error: 'could not update user checks' },
                                                    helper.CONTENT_TYPE.JSON
                                                );
                                            }
                                        });
                                    } else {
                                        callback(400, { error: 'cannot create user checks' }, helper.CONTENT_TYPE.JSON);
                                    }
                                });
                            } else {
                                callback(400, { error: 'your checks reached the max limit' }, helper.CONTENT_TYPE.JSON);
                            }
                        } else {
                            callback(500, { error: 'read user data error' }, helper.CONTENT_TYPE.JSON);
                        }
                    });
                } else {
                    callback(500, { error: 'read token data error' }, helper.CONTENT_TYPE.JSON);
                }
            });
        } else {
            callback(400, { error: 'request payload is invalid' }, helper.CONTENT_TYPE.JSON);
        }
    },

    /* take check id as query param*/
    get(data, callback) {
        const checkId = data.query.id;
        // we need token verification here as well.
        if (checkId) {
            _data.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const token = typeof data.headers.token === 'string' ? data.headers.token : false;
                    token_handler.verifyToken(token, checkData.userPhone, isValidToken => {
                        if (isValidToken) {
                            callback(200, checkData, helper.CONTENT_TYPE.JSON);
                        } else {
                            callback(403, { error: 'invalid token' }, helper.CONTENT_TYPE.JSON);
                        }
                    });
                } else {
                    callback(err, checkData);
                }
            });
        } else {
            callback(400, { error: 'plz provider a valide check id' }, helper.CONTENT_TYPE.JSON);
        }
    },

    /* require data: checkId*/
    delete(data, callback) {
        const checkId = data.query.id;
        // will need user verification as well
        _data.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof data.headers.token === 'string' ? data.headers.token : false;
                token_handler.verifyToken(token, checkData.userPhone, isValidToken => {
                    if (isValidToken) {
                        // with phone number from check data to verify the user checks
                        _data.read('users', checkData.userPhone, (err, userData) => {
                            if (!err && userData) {
                                const checkIndex = userData.checks.indexOf(checkId);
                                if (checkIndex > -1) {
                                    // remove the check
                                    userData.checks.splice(checkIndex, 1);
                                    //save user
                                    _data.update('users', checkData.userPhone, userData, (err, data) => {
                                        if (!err && data) {
                                            // delete the checks
                                            _data.delete('checks', checkId, (err, res) => {
                                                if ((!err, res)) {
                                                    callback(
                                                        200,
                                                        { success: 'delete user checks success' },
                                                        helper.CONTENT_TYPE.JSON
                                                    );
                                                } else {
                                                    callback(
                                                        500,
                                                        { error: 'delete user checks fails' },
                                                        helper.CONTENT_TYPE.JSON
                                                    );
                                                }
                                            });
                                        } else {
                                            callback(
                                                500,
                                                { error: 'update user checks fails' },
                                                helper.CONTENT_TYPE.JSON
                                            );
                                        }
                                    });
                                } else {
                                    callback(200, { success: 'no token to delete' }, helper.CONTENT_TYPE.JSON);
                                }
                            } else {
                                callback(400, { error: 'read user data error' }, helper.CONTENT_TYPE.JSON);
                            }
                        });
                    } else {
                        callback(403, { error: 'invalid token' }, helper.CONTENT_TYPE.JSON);
                    }
                });
            } else {
                callback(400, { error: 'read check data error' }, helper.CONTENT_TYPE.JSON);
            }
        });
    },

    /* require data: checkId*/
    put(data, callback) {
        const { id: checkId, protocol, url, method, successCodes, timeoutSeconds } = data.payload;
        // will need user verification as well
        if (protocol && url && method && successCodes && timeoutSeconds) {
            _data.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const token = typeof data.headers.token === 'string' ? data.headers.token : false;
                    token_handler.verifyToken(token, checkData.userPhone, isValidToken => {
                        if (isValidToken) {
                            checkData.protocol = protocol;
                            checkData.method = method;
                            checkData.url = url;
                            checkData.successCode = successCodes;
                            checkData.timeoutSeconds = timeoutSeconds;
                            _data.update('checks', checkId, checkData, (err, response) => {
                                if (!err && response) {
                                    callback(200, { success: 'update checks successful' }, helper.CONTENT_TYPE.JSON);
                                } else {
                                    callback(500, { error: 'fail to update checks' }, helper.CONTENT_TYPE.JSON);
                                }
                            });
                        } else {
                            callback(403, { error: 'invalid token' }, helper.CONTENT_TYPE.JSON);
                        }
                    });
                } else {
                    callback(400, { error: 'invalid check id' }, helper.CONTENT_TYPE.JSON);
                }
            });
        } else {
            callback(400, { error: 'invalid request' }, helper.CONTENT_TYPE.JSON);
        }
    }
};

module.exports = check_handler;
