// using the built in lib in node js for hashing.
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('../server/config/config');

const helpers = {
    CONTENT_TYPE: {
        HTML: 'text/html',
        ICON: 'image/x-icon',
        CSS: 'text/css',
        JS: 'text/plain',
        JPEG: 'image/jpeg',
        PNG: 'image/png',
        JSON: 'application/json'
    },
    // hashing a raw password
    hash: rawPassword => {
        if (typeof rawPassword === 'string' && rawPassword.length > 0) {
            // this is how you can has a raw password.
            // create sha256 has
            const hash = crypto
                .createHmac('sha256', config.hashingSecret)
                .update(rawPassword)
                .digest('hex');
            return hash;
        } else {
            return false;
        }
    },
    createRandomString: len => {
        len = typeof len === 'number' && len > 0 ? len : false;
        if (len) {
            const characterSet = 'agsdgGYUHUJIKLJNBHryuifgfgVGJFHJGVHGH9876865HJGTRTRTV67726907HUIHJKHJH';
            let str = '';
            while (str.length < len) {
                const randomChar = characterSet.charAt(Math.floor(Math.random() * characterSet.length));
                str += randomChar;
            }
            return str;
        }
        return '';
    },
    // parse
    parseJsonToObject: str => {
        try {
            const obj = JSON.parse(str);
            return obj;
        } catch (err) {
            return {};
        }
    },
    isEmpty: obj => {
        return (
            obj === undefined ||
            (typeof obj === 'string' && obj.length === 0) ||
            (typeof obj === 'object' && Object.keys(obj).length === 0) ||
            (Array.isArray(obj) && Array.length === 0) ||
            obj === null
        );
    }
};

// what abput send email
helpers.sendTwilioSms = (phone, msg, callback) => {
    ///validation on phone and msg
    phone = typeof phone === 'string' ? phone.trim() : false;
    msg = typeof phone === 'string' && phone.length > 0 ? phone.trim() : false;
    if (phone && msg) {
        //config the request payload
        const payload = {
            from: config.twilio.phone,
            to: phone,
            body: msg
        };
        // stringify the payload
        const stringPayload = querystring.stringify(payload);
        //config request details  this is the key
        const requestDetails = {
            protocol: 'https:',
            hostname: 'api.twilio.com',
            method: 'POST',
            path: 'your twiliopath', // you will need to register with twilio
            auth: 'your auto token',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // create request object
        const request = https.request(requestDetails, res => {
            const status = res.statusCode;
            if (status == 200 || status == 201) {
                callback(false, { success: 'done with request' });
            } else {
                callback(status, { error: `status code ${status}` });
            }
        });

        req.on('err', e => callback(e));
        // add the payload
        req.write(stringPayload);
        //end the request
        req.end();
    } else {
        callback(400, { error: 'Given phone and msg is invalid' });
    }
};

helpers.loadHtml = (htmlTemplate, callback) => {
    if (htmlTemplate) {
        const htmlpath = path.join(__dirname, '/../views/');
        fs.readFile(htmlpath + htmlTemplate + '.html', 'utf8', (err, res) => {
            if (!err && res && res.length > 0) {
                callback(false, res);
            } else {
                callback(true, 'no html template');
            }
        });
    } else {
        callback(400, { error: 'invalid html template' }, CONTENT_TYPE.JSON);
    }
};

helpers.interpolate = (str, data) => {
    str = typeof str == 'string' && str.length > 0 ? str : '';
    data = typeof data == 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global."
    for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }
    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof (data[key] == 'string')) {
            var replace = data[key];
            var find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }
    return str;
};

helpers.getTemplate = (templateName, data, callback) => {
    templateName = typeof templateName == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof data == 'object' && data !== null ? data : {};
    if (templateName) {
        var templatesDir = path.join(__dirname, '/../views/');
        // as is reading string, we need to set encoding: utf-8, otherwise leave it blank
        fs.readFile(templatesDir + templateName + '.html', 'utf8', function(err, str) {
            if (!err && str && str.length > 0) {
                // Do interpolation on the string
                var finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback('No template could be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

helpers.addUniversalTemplates = (str, data, callback) => {
    str = typeof str == 'string' && str.length > 0 ? str : '';
    data = typeof data == 'object' && data !== null ? data : {};
    // Get the header
    helpers.getTemplate('header', data, function(err, headerString) {
        if (!err && headerString) {
            // Get the footer
            helpers.getTemplate('footer', data, function(err, footerString) {
                if (!err && footerString) {
                    // Add them all together
                    var fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback('Could not find the footer template');
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
};

helpers.getContentType = filename => {
    let contentType = '';
    if (filename.match(/.ico$/)) {
        contentType = helpers.CONTENT_TYPE.ICON;
    }
    if (filename.match(/.css$/)) {
        contentType = helpers.CONTENT_TYPE.CSS;
    }
    if (filename.match(/.js$/)) {
        contentType = helpers.CONTENT_TYPE.JS;
    }
    if (filename.match(/.jpg$/)) {
        contentType = helpers.CONTENT_TYPE.JPEG;
    }
    if (filename.match(/.png$/)) {
        contentType = helpers.CONTENT_TYPE.PNG;
    }
    return contentType;
}

helpers.loadStaticResources = (data, callback) => {
    if (data.method === 'get') {
        const filename = data.trimmedPath.replace('public/', '');
        if (filename) {
            const contentType = helpers.getContentType(filename);
            const staticRessourceDir = path.join(__dirname, '/../public');
            // reading non string content, no need to set encoding here
            fs.readFile(`${staticRessourceDir}/${filename}`, (err, data) => {
                if (!err && data) {
                    callback(200, data, contentType);
                } else {
                    callback(500, undefined, contentType);
                }
            });
        } else {
            callback(500, undefined, contentType);
        }
    }
};

helpers.getHtml = (templateName, data, callback) => {
    helpers.getTemplate(templateName, data, (err, str) => {
        if (!err && str) {
            // Add the universal header and footer
            helpers.addUniversalTemplates(str, data, (err, str) => {
                if (!err && str) {
                    // Return that page as HTML
                    callback(200, str, helpers.CONTENT_TYPE.HTML);
                } else {
                    callback(500, undefined, helpers.CONTENT_TYPE.HTML);
                }
            });
        } else {
            callback(500, undefined, helpers.CONTENT_TYPE.HTML);
        }
    });
};

module.exports = helpers;
