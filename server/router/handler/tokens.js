const _data = require('../../../lib/data');
const helpers = require('../../../utils/helpers');

const token_handler = {
    // verify if a token is still valid for a user when getting user informaiton!
    // verify a valid token by token id and user phone.
    verifyToken(id, phone, callback) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    },
    // get token by id
    get(data, callback) {
        const { tokenId } = data.query;
        if (tokenId) {
            _data.read('tokens', tokenId, (error, res) => {
                if (!error && res) {
                    callback(200, res, helpers.CONTENT_TYPE.JSON);
                } else {
                    callback(404, { error: 'token not found' }, helpers.CONTENT_TYPE.JSON);
                }
            });
        } else {
            callback(400, { error: 'no token id specified' }, helpers.CONTENT_TYPE.JSON);
        }
    },
    /*using phone number and password to generate token when user login*/
    async post(data) {
        const { phone, password } = data.payload;
        if (phone && password) {
            try {
                const data = await _data.read('users', phone);
                if (data) {
                    const hashedPassword = helpers.hash(password);
                    // only allow valid user to create token
                    if (hashedPassword === data.password) {
                        // token id is reandom string
                        const tokenId = helpers.createRandomString(20);
                        const expires = Date.now() + 1000 * 60 * 60; // set the token expires in one hour
                        /*user phone number and expires to create token object*/
                        const token = {
                            id: tokenId,
                            phone,
                            expires
                        };
                        const statusCode = await _data.create('tokens', tokenId, token);
                        return { statusCode, payload: token, contentType: helpers.CONTENT_TYPE.JSON };
                    }
                }
            } catch (error) {
                return {
                    statusCode: 400,
                    payload: { error: 'phone or pass is missing' },
                    contentType: helpers.CONTENT_TYPE.JSON
                };
            }
        } else {
            return { statusCode: 400, payload: { error: 'phone or pass is missing' }, contentType: helpers.CONTENT_TYPE.JSON };
        }
    },
    /*extend token expires, payload: {id, extend: boolean}*/
    put(data, callback) {
        const { tokenId, extend } = data.payload;
        if (tokenId && extend) {
            _data.read('tokens', tokenId, (err, data) => {
                if (!err && data) {
                    if (data.expires > Date.now()) {
                        //extend by another hour
                        data.expires = Date.now() + 1000 * 60 * 60;
                        _data.update('tokens', tokenId, data, (err, res) => {
                            if (!err && res) {
                                callback(200, { succes: 'extend token successful' }, helpers.CONTENT_TYPE.JSON);
                            } else {
                                callback(500, { error: 'cannot extend the token' }, helpers.CONTENT_TYPE.JSON);
                            }
                        });
                    } else {
                        callback(400, { error: 'cannot extend expired token' }, helpers.CONTENT_TYPE.JSON);
                    }
                } else {
                    callback(
                        404,
                        {
                            error: `cannot find token by id ${tokenId}`
                        },
                        helpers.CONTENT_TYPE.JSON
                    );
                }
            });
        } else {
            callback(400, { error: 'missing required tokenid and extend=true to update token' }, helpers.CONTENT_TYPE.JSON);
        }
    },
    delete(data, callback) {
        const tokenId = data.query.id;
        if (tokenId) {
            _data.read('tokens', tokenId, (err, res) => {
                if (!err && res) {
                    _data.delete('tokens', tokenId, (err, response) => {
                        if (!err && response) {
                            callback(200, { succes: `delete token success: ${tokenId}` }, helpers.CONTENT_TYPE.JSON);
                        } else {
                            callback(500, { error: 'cannot delete the given token' }, helpers.CONTENT_TYPE.JSON);
                        }
                    });
                } else {
                    callback(404, { error: 'given token not found' }, helpers.CONTENT_TYPE.JSON);
                }
            });
        } else {
            callback(400, { error: 'no token id supplied' }, helpers.CONTENT_TYPE.JSON);
        }
    }
};

module.exports = token_handler;
