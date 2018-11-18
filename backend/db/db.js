const Datastore = require('nedb');
const errorMessages = require('../data/messages').generalErrors;
const fs = require('fs');
const dataUtils = require('../data/utils');
const path = require('path');
let db = {};
let directory = require('../helpers/pathBuilder').getPath();
let privateDirectory = path.join(`${directory}`, 'Overhold', 'private');
let publicDirectory = path.join(`${directory}`, 'Overhold', 'public');



async function createDB() {

	db.global = new Datastore({filename: `${publicDirectory}/${dataUtils.dbNames.global}.db`, autoload: true, onload: (err) => {}});

	db.user = new Datastore({filename: `${publicDirectory}/${dataUtils.dbNames.user}.db`, autoload: true, onload: (err) => {}});

	db.private = new Datastore({filename: `${privateDirectory}/${dataUtils.dbNames.private}.db`, autoload: true,onload: (err) => {}});

}

async function getDocument(value, client) {

	console.log("GETTING DATA", value, client, db);

	return new Promise((resolve, reject) => {
		db[client].findOne({'name': value}, function (err, doc) {
			if (err) {
				return reject(err);
			}
			return resolve(doc);
		});
	});
}

async function drop(client) {
	if (!client) {
		return Promise.reject(new Error(errorMessages.clientNotProvided));
	}

	switch (client) {
	case dataUtils.dbNames.global:
		fs.unlink(`${publicDirectory}/${dataUtils.dbNames.global}.db`, (err) => {});
		break;

	case dataUtils.dbNames.user:
		fs.unlink(`${publicDirectory}/${dataUtils.dbNames.user}.db`, (err) => {});
		break;

	case dataUtils.dbNames.private:
		fs.unlink(`${privateDirectory}/${dataUtils.dbNames.private}.db`, (err) => {});
		break;

	default:
		throw new Error('Unsupported type', client);
	}

	return Promise.resolve(true);
}

async function setDocument(doc, client) {
	if (!client) {
		return Promise.reject(new Error(errorMessages.clientNotProvided));
	}

	if (!doc || Object.keys(doc).length === 0 || typeof (doc) !== 'object') {
		return Promise.reject(new Error(errorMessages.invalidDocument));
	}

	return new Promise((resolve, reject) => {
		db[client].insert(doc, function (err, newDoc) {
			if (err) {
				return reject(err);
			}
			return resolve(newDoc);
		});
	});
}

async function replaceDocument(id, newDoc, client) {
	if (!client || !id) {
		return Promise.reject(new Error(errorMessages.clientNotProvided));
	}

	if (!newDoc || Object.keys(newDoc).length === 0 || typeof (newDoc) !== 'object') {
		return Promise.reject(new Error(errorMessages.invalidDocument));
	}

	return new Promise((resolve, reject) => {
		db[client].update({ _id: id }, newDoc, function (err, numReplaced) {
			if (err) {
				return reject(err);
			}
			return resolve(numReplaced);
		});
	});
}

// update specific fields
async function updateDocument(name, doc, client) {
	if (!client || !name) {
		return Promise.reject(new Error(errorMessages.clientNotProvided));
	}

	if (!doc) {
		return Promise.reject(new Error(errorMessages.invalidDocument));
	}

	return new Promise((resolve, reject) => {
		db[client].update({ 'name': name }, doc, function (err, numReplaced) {
			if (err) {
				return reject(err);
			}
			return resolve(numReplaced);
		});
	});
}

async function removeDocument (client) {
	return new Promise(function (resolve, reject) {
	  db[client].remove({ }, { multi: true })
	})
  }

function getPath(){return directory.getPath()};

module.exports = {
	getDocument,
	setDocument,
	replaceDocument,
	updateDocument,
	removeDocument,
	drop,
	db,
	createDB,
	getPath
};