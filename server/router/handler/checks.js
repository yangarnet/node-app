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
            timeoutSeconds
        } = data.payload;
        if (protocol && url && method && successCode && timeoutSeconds) {
            // get the token from request header
            const token =
                typeof data.headers.token === "string"
                    ? data.headers.token
                    : false;
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
                            callback(403, { error: "not authoriz" });
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
                }
            });
        } else {
            callback(400, { error: "plz provider a valide check id" });
        }
    },

    delete: (data, callback) => {},
    put: (data, callback) => {}
};

module.exports = check_handler;
