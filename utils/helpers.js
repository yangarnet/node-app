// using the built in lib in node js for hashing.
const crypto = require("crypto");
const querystring = require("querystring");
const https = require("https");

const config = require("../server/config/config");

const helpers = {
    // hashing a raw password
    hash: rawPassword => {
        if (typeof rawPassword === "string" && rawPassword.length > 0) {
            // this is how you can has a raw password.
            // create sha256 has
            const hash = crypto
                .createHmac("sha256", config.hashingSecret)
                .update(rawPassword)
                .digest("hex");
            return hash;
        } else {
            return false;
        }
    },
    createRandomString: len => {
        len = typeof len === "number" && len > 0 ? len : false;
        if (len) {
            const characterSet =
                "agsdgGYUHUJIKLJNBHryuifgfgVGJFHJGVHGH9876865HJGTRTRTV67726907HUIHJKHJH";
            let str = "";
            while (str.length < len) {
                const randomChar = characterSet.charAt(
                    Math.floor(Math.random() * characterSet.length)
                );
                str += randomChar;
            }
            return str;
        }
        return "";
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
            (typeof obj === "string" && obj.length === 0) ||
            (typeof obj === "object" && Object.keys(obj).length === 0) ||
            (Array.isArray(obj) && Array.length === 0) ||
            obj === null
        );
    }
};

// what abput send email
helpers.sendTwilioSms = (phone, msg, callback) => {
    ///validation on phone and msg
    phone = typeof phone === 'string' ? phone.trim() : false;
    msg = (typeof phone === 'string'&&phone.length > 0) ? phone.trim() : false;
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
            protocol: "https:",
            hostname: "api.twilio.com",
            method: "POST",
            path: "your twiliopath", // you will need to register with twilio
            auth: "your auto token",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(stringPayload)
            }
        };

        // create request object
        const request = https.request(requestDetails, res => {
            const status = res.statusCode;
            if (status == 200 || status == 201) {
                callback(false, { success: "done with request" });
            } else {
                callback(status, { error: `status code ${status}` });
            }
        });

        req.on("err", e => callback(e));
        // add the payload
        req.write(stringPayload);
        //end the request
        req.end();
    } else {
        callback(400, { error: "Given phone and msg is invalid" });
    }
};

module.exports = helpers;
