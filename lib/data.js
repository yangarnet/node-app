
const fs = require('fs');
const path = require('path');
const helpers = require('../utils/helpers');

const lib= {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data');

// create a file in given directory
lib.create =  (dirname, filename, data, callback) => {

    // open first, then write the file
    fs.open(`${lib.baseDir}/${dirname}/${filename}.json`, 'wx', (err, fileDescritor) => {
        if(!err && fileDescritor) {
            const stringData = JSON.stringify(data);

            // writ the file
            fs.writeFile(fileDescritor, stringData, err => {
                if(!err) {
                    fs.close(fileDescritor, err => {
                        if(!err) {
                            callback(false,{success: 'create user profile success'});
                        } else {
                            callback(400, {error: 'error in closing user profile after witing'});
                        }
                    });
                } else {
                    callback(400, {error: 'error in writing user profile'})
                }
            });

        } else {
            callback(400, {error: 'error in opening user profile'});
        }
    });
};

// read data from file
lib.read = (dirname, filename, callback) => {
    fs.readFile(`${lib.baseDir}/${dirname}/${filename}.json`, 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data)
            callback(false, parsedData);
        } else {
            if (err.message.includes('no such file or directory')) {
                callback(404, {error: 'not found'})
            } else {
                callback(400, {error: 'reading file error'});
            }
        }
    })
};

// update(override)
lib.update = async (dirname, filename, data, callback) => {
    // open the file for read and write                         err and fd obj in the callback
    // such callback hell!
    // how to convert callback hell with async/await ???
    fs.open(`${lib.baseDir}/${dirname}/${filename}.json`, 'r+', (err, fileDescritor) => {
        if(!err && fileDescritor) {
            const stringData = JSON.stringify(data);
            fs.truncate(fileDescritor, err => {
                if (!err) {
                    fs.writeFile(fileDescritor, stringData, err => {
                        if(!err) {
                            fs.close(fileDescritor, err => {
                                if (!err) {
                                    callback(false, { success: 'close file done' })
                                } else {
                                    callback(400, { error: 'error in file closing' });
                                }
                            });
                        } else {
                            callback(400, { error: 'error in writing file' });
                        }
                    });
                } else {
                    callback(400,{ error: 'error in truncating file' })
                }
            });

        } else {
            callback(400, { error: 'could not open the file for update' })
        }
    });
};

// delete

lib.delete = (dirname, filename, callback) => {
    // this is how delete a file in nodejs
    fs.unlink(`${lib.baseDir}/${dirname}/${filename}.json`, err => {
        if(!err) {
            callback(false, {success: 'delete data success'});
        } else {
            callback(400, { error:'error delete the file' });
        }
    });
};

module.exports = lib;
