const fs = require('fs');
const path = require('path');
const helpers = require('../utils/helpers');
const util = require('util');

// using util.promisify to return new version
const openFile = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const closeFile = util.promisify(fs.close);

const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data');

// create a file in given directory
lib.create = async (dirname, filename, data) => {
    const stringData = JSON.stringify(data);
    try {
        const fd = await openFile(`${lib.baseDir}/${dirname}/${filename}.json`, 'wx');
        await writeFile(fd, stringData);
        await closeFile(fd);
        return 200;
    } catch (error) {
        return 400;
    }
};

// read data from file
lib.read = async (dirname, filename) => {
    try {
        const result = await readFile(`${lib.baseDir}/${dirname}/${filename}.json`, 'utf8');
        const parsedData = helpers.parseJsonToObject(result);
        return parsedData;
    } catch (error) {
        console.log(`error : ${error}`);
    }
};

// update(override)
lib.update = async (dirname, filename, data, callback) => {
    // open the file for read and write                         err and fd obj in the callback
    // such callback hell!
    // how to convert callback hell with async/await ???
    fs.open(`${lib.baseDir}/${dirname}/${filename}.json`, 'r+', (err, fileDescritor) => {
        if (!err && fileDescritor) {
            const stringData = JSON.stringify(data);
            fs.truncate(fileDescritor, err => {
                if (!err) {
                    fs.writeFile(fileDescritor, stringData, err => {
                        if (!err) {
                            fs.close(fileDescritor, err => {
                                if (!err) {
                                    callback(false, {
                                        success: 'update success'
                                    });
                                } else {
                                    callback(400, {
                                        error: 'error in file closing'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'error in writing file'
                            });
                        }
                    });
                } else {
                    callback(400, { error: 'error in truncating file' });
                }
            });
        } else {
            callback(400, { error: 'could not open the file for update' });
        }
    });
};

// delete

lib.delete = (dirname, filename, callback) => {
    // this is how delete a file in nodejs
    fs.unlink(`${lib.baseDir}/${dirname}/${filename}.json`, err => {
        if (!err) {
            callback(false, { success: 'delete data success' });
        } else {
            callback(400, { error: 'error delete the file' });
        }
    });
};

module.exports = lib;
