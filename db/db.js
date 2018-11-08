const Datastore = require('nedb');
const path = require('path');
let db = {};
let directory = require('./pathBuilder').getPath();
let privateDirectory = path.join(`${directory}`, 'Overhold', 'private');
let publicDirectory = path.join(`${directory}`, 'Overhold', 'public');
const dataUtils = require('./dataUtils');

async function createDB() {
    db.global = new Datastore({
        filename: `${publicDirectory}/${dataUtils.dbNames.global}.db`, autoload: true, onload: (err) => {
        }
    });

    db.user = new Datastore({ filename: `${publicDirectory}/${dataUtils.dbNames.user}.db`, autoload: true, onload: (err) => {  } });

    db.private = new Datastore({
        filename: `${privateDirectory}/${dataUtils.dbNames.private}.db`, autoload: true,
        onload: (err) => {}
    });

}

async function createDBsPromise() {
    await createConnectionPromise(`${publicDirectory}/${dataUtils.dbNames.global}.db`, `${dataUtils.dbNames.global}`).then(res => {
        return Promise.resolve(true);
    });

    await createConnectionPromise(`${publicDirectory}/${dataUtils.dbNames.user}.db`, `${dataUtils.dbNames.user}`).then(res => {
        return Promise.resolve(true);
    });

    await createConnectionPromise(`${privateDirectory}/${dataUtils.dbNames.private}.db`, 'private').then(res => {
        return Promise.resolve(true);
    });
    return Promise.resolve(true);
}

async function createConnectionPromise(filename, obj) {

    return new Promise((resolve, reject) => {
        db[obj] = new Datastore({
            filename: filename, autoload: true,
            onload: (err) => {
                if(!err) {
                    return resolve(true);
                } else {
                    return createConnectionPromise(filename, obj);
                }
            }
        });
    });

}

async function getDocument(value, client) {

    return new Promise((resolve, reject) => {
        db[client].findOne({'name': value}, function (err, doc) {
            if (err) {
                return reject(err);
            }
            return resolve(doc);
        });
    });
}

module.exports = {
    createDB,
    getDocument,
    createDBsPromise
};
