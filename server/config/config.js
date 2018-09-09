// setup env configuration
const environments = {
    development: {
        httpPort: 3000,
        httpsPort: 3001,
        hashingSecret: "HHHKKJKLGU4545HH",
        maxChecks: 5,
        twilio: {
            phone: "0405070970"
        },
        templateGlobals: {
            appName: "UptimeChecker",
            companyName: "NotARealCompany, Inc.",
            yearCreated: "2018",
            baseUrl: "http://localhost:3000/"
        }
    },
    stage: {
        httpPort: 3005,
        httpsPort: 3006,
        hashingSecret: "HHHKKJKL#$%$GU4545HH",
        maxChecks: 5
    },
    production: {
        httpPort: 5000,
        httpsPort: 5002,
        hashingSecret: "HHHK5-=--KJKLGU4545HH",
        maxChecks: 5
    }
};

const currentEnv = typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV.toLowerCase() : "";

const environmentToExport = typeof environments[currentEnv] === "object" ? environments[currentEnv] : environments.development;

module.exports = environmentToExport;
