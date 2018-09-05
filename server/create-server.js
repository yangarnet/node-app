const router = require("./router/router");

const createServer = (req, res) => router(req, res);

module.exports = createServer;
