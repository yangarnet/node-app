const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const config = require("./config/config");
const createServer = require("./create-server");

// server container
const server = {};

// create the server
server.httpServer = http.createServer((req, res) => createServer(req, res));

// key and cert configration for https server
server.httpsServerOption = {
    key: fs.readFileSync(path.join(__dirname, "../https-key/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../https-key/cert.pem"))
};

server.httpsServer = https.createServer(server.httpsServerOption, (req, res) =>
    createServer(req, res)
);

/* the folliowing is show how to has password*/
// const crypto = require('crypto');
// const data = 'password'
// const hmac = crypto.createHmac('sha256', 'a secret').update(data).digest('hex');
// console.log(`the hashed: ${hmac}`);
/*  end of hasing password */

server.init = () => {
    // start http server
    server.httpServer.listen(config.httpPort, () => {
        console.log(`the http server running @ ${config.httpPort}\n\n`);
    });

    server.httpsServer.listen(config.httpsPort, () => {
        console.log(`the https server running @ ${config.httpsPort}\n\n`);
    });
};
module.exports = server;
