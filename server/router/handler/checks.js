const _data = require("../../../lib/data");
const config = require("../../config/config");
const helper = require("../../../utils/helpers");
const token_handler = require("./tokens");

const check_handler = {
    /*require chedk data: protocl, url, method, successcode, timeout secoonds */
    post: (data, callback) => {
        const {
            protocol,
            url,
            method,
            successCode,
            timeoutSeconds,
            phone
        } = data.payload;
        if (protocol && url && method && successCode && timeoutSeconds) {
            // get the token from request header
            const token =
                typeof data.headers.token === "string"
                    ? data.headers.token
                    : false;
                token_handler.verifyToken(token, phone, isValidToken => {
                    if (isValidToken) {
                        _data.read("tokens", token, (err, tokenData) => {
                            if (!err && tokenData) {
                                _data.read("users", tokenData.phone, (err, userData) => {
                                    if (!err && userData) {
                                        const userChecks =
                                            //create new user check or just use existing checks
                                            typeof userData.checks === "object" &&
                                            userData.checks instanceof Array
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
                                                successCode,
                                                timeoutSeconds
                                            };
                                            _data.create(
                                                "checks",
                                                checkId,
                                                checkObj,
                                                (err, res) => {
                                                    if (!err && res) {
                                                        userData.checks = userChecks;
                                                        userData.checks.push(checkId);
                                                        _data.update(
                                                            "users",
                                                            userData.phone,
                                                            userData,
                                                            err => {
                                                                if (!err) {
                                                                    callback(200, {
                                                                        success: checkObj
                                                                    });
                                                                } else {
                                                                    callback(500, {
                                                                        error:
                                                                            "could not update user checks"
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        callback(400, {
                                                            error:
                                                                "cannot create user checks"
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            callback(400, {
                                                error: "your checks reached the max limit"
                                            });
                                        }
                                    } else {
                                        callback(500, { error: "read user data error" });
                                    }
                                });
                            } else {
                                callback(500, { error: "read token data error" });
                            }
                        });
                    } else {
                        callback(403, { error: "invalid token" });
                    }
                });
        } else {
            callback(400, { error: "request payload is invalid" });
        }
    },

    /* take check id as query param*/
    get: (data, callback) => {
        const { checkId } = data.query;
        // we need token verification here as well.
        if (checkId) {
            _data.read("checks", checkId, (err, checkData) => {
                if (!err && checkData) {
                    const token =
                        typeof data.headers.token === "string"
                            ? data.headers.token
                            : false;
                    token_handler.verifyToken(
                        token,
                        checkData.userPhone,
                        isValidToken => {
                            if (isValidToken) {
                                callback(200, checkData);
                            } else {
                                callback(403, { error: "invalid token" });
                            }
                        }
                    );
                } else {
                    callback(err, checkData);
                }
            });
        } else {
            callback(400, { error: "plz provider a valide check id" });
        }
    },

    /* require data: checkId*/
    delete: (data, callback) => {
        const { checkId } = data.query;
        // will need user verification as well
        if (checkId) {
            _data.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
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
                                                    if (!err, res) {
                                                        callback(200, {success: 'delete user checks success'});
                                                    } else {
                                                        callback(500, {error: 'delete user checks fails'});
                                                    }
                                                });
                                            } else {
                                                callback(500, {error: 'update user checks fails'});
                                            }
                                        });
                                    } else {
                                        callback(200, {success: 'no token to delete'});
                                    }
                                } else {
                                    callback(400, {error: 'read user data error'});
                                }
                            });
                        } else {
                            callback(403, {error: 'invalid token'});
                        }
                    });
                } else {
                    callback(400, {error: 'read check data error'});
                }
            });
        }
    },

    /* require data: checkId*/
    put: (data, callback) => {
        const { checkId } = data.query;
        const {
            protocol,
            url,
            method,
            successCode,
            timeoutSeconds
        } = data.payload;
        // will need user verification as well
        if (protocol && url && method && successCode && timeoutSeconds) {
            _data.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                    token_handler.verifyToken(token, checkData.userPhone, isValidToken => {
                        if (isValidToken) {
                            checkData.protocol = protocol;
                            checkData.method = method;
                            checkData.url = url;
                            checkData.successCode = successCode;
                            checkData.timeoutSeconds = timeoutSeconds;
                            _data.update('checks', checkId, checkData, (err, response) => {
                                if (!err && response) {
                                    callback(200, {success: 'update checks successful'});
                                } else {
                                    callback(500, {error: 'fail to update checks'});
                                }
                            });
                        } else {
                            callback(403, {error: 'invalid token'});
                        }
                    });
                } else {
                    callback(400, {error: 'invalid check id'});
                }
            });
        } else {
            callback(400, {error: 'invalid request'});
        }
    }
};

module.exports = check_handler;
