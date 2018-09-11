const _data = require("../../../lib/data");
const helpers = require("../../../utils/helpers");
const token_handler = require("./tokens");
const CONTENT_TYPE = "application/json";

const user_handler = {
    // only authenticated user can get their own data, not anyone else's data
    get: (data, callback) => {
        const { phone } = data.query;
        if (typeof phone === "string" && phone.length > 0) {
            // verify the user token from the header, say from postman
            const token = typeof data.headers.token === "string" ? data.headers.token : false;
            // only authenticated user can access user profile data
            token_handler.verifyToken(token, phone, isValidToken => {
                if (isValidToken) {
                    _data.read("users", phone, (err, res) => {
                        if (res && !err) {
                            delete res.password;
                            callback(200, res , CONTENT_TYPE);
                        } else {
                            callback(404, { error: "user not found" }, CONTENT_TYPE);
                        }
                    });
                } else {
                    callback(403, { error: "please give a valid token to access information" }, CONTENT_TYPE);
                }
            });
        } else {
            callback(400, { error: "plz provide a valid phone number" }, CONTENT_TYPE);
        }
    },

    /*payload: {firtname, lastname, phone, paswd, tosagreement}*/
    post: (data, callback) => {
        // all of these guys should be sting / boolean here
        const { firstname, lastname, phone, password, tosagreement } = data.payload;
        if (firstname && lastname && phone && password && tosagreement) {
            // with phone number to create json file
            _data.read("users", phone, (err, data) => {
                if (err) {
                    // hash password
                    const hashedPassword = helpers.hash(password);
                    if (hashedPassword) {
                        const newUser = {
                            firstname,
                            lastname,
                            phone,
                            password: hashedPassword,
                            tosagreement: true
                        };

                        // write the file
                        _data.create("users", phone, newUser, err => {
                            if (!err) {
                                callback(200, { succes: "add new user successful" }, CONTENT_TYPE);
                            } else {
                                callback(500, { error: err }, CONTENT_TYPE);
                            }
                        });
                    }
                } else {
                    callback(400, { error: "a user already exists with that number" }, CONTENT_TYPE);
                }
            });
        } else {
            const error = {};
            firstname && lastname && phone && password && tosagreement;
            if (helpers.isEmpty(firstname)) {
                error.firstname = "first name is required";
            }
            if (helpers.isEmpty(lastname)) {
                error.lastname = "last name is required";
            }
            if (helpers.isEmpty(phone)) {
                error.phone = "user phone is required";
            }
            if (helpers.isEmpty(password)) {
                error.password = "user password is required";
            }
            if (!tosagreement) {
                error.acceptTC = "need to accet T&C";
            }
            callback(400, { error }, CONTENT_TYPE);
        }
    },
    // only authenticated user can update
    put: (data, callback) => {
        const { phone, firstname, lastname, password } = data.payload;
        const token = typeof data.headers.token === "string" ? data.headers.token : false;
        token_handler.verifyToken(token, phone, isValidToken => {
            if (isValidToken && phone) {
                _data.read("users", phone, (err, userData) => {
                    if (!err && userData) {
                        if (password) {
                            userData.password = helpers.hash(password);
                        }
                        if (firstname) {
                            userData.firstname = firstname;
                        }
                        if (lastname) {
                            userData.lastname = lastname;
                        }
                        _data.update("users", phone, userData, (err, data) => {
                            if (!err) {
                                callback(200, data, CONTENT_TYPE);
                            } else {
                                callback(400, { error: "fail to update user information" }, CONTENT_TYPE );
                            }
                        });
                    } else {
                        callback(404, { error: `given user ${phone} not exists` }, CONTENT_TYPE);
                    }
                });
            } else {
                callback(403, { error: "only authorised can do the update" }, CONTENT_TYPE);
            }
        });
    },
    // only authenticated user can delete
    delete: (data, callback) => {
        const { phone } = data.query;
        const token = typeof data.headers.token === "string" ? data.headers.token : false;
        token_handler.verifyToken(token, phone, isValidToken => {
            if (isValidToken) {
                if (phone) {
                    _data.read("users", phone, (err, data) => {
                        if (!err && data) {
                            _data.delete("users", phone, (err, response) => {
                                if (!err) {
                                    callback(200, response, CONTENT_TYPE);
                                } else {
                                    callback(400, { error }, CONTENT_TYPE);
                                }
                            });
                        } else {
                            callback(404, { error }, CONTENT_TYPE);
                        }
                    });
                }
            } else {
                callback(403, { error: "you are not authorized to delete the user profile" }, CONTENT_TYPE);
            }
        });
    }
};

module.exports = user_handler;
