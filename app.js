
const server = require('./server/server');
const worker = require('./worker/worker');

const app = {};

app.init = () => {
    // start server
    server.init();
    // star worker
    ///worker.init();
};

app.init();

module.exports = app;
