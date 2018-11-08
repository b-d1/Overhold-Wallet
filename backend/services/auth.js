const db = require('../db/db');
const dataUtils = require('../data/utils');
const utils = require('../helpers/utils');
const errorMessages = require('../data/messages').userAuthSettingsErrors;
const privateData = require('../data/private');
const bip39 = require('bip39');
let privateClient = dataUtils.dbNames.private;
let userClient = dataUtils.dbNames.user;

function login(username, password) {
	return db.getDocument(dataUtils.userInfo.name, privateClient).then(async (result) => {

		if(result) {
            if (result.username !== username) {
                return Promise.reject(errorMessages.usernameNotFoundError);
            }

            if (utils.hashPhrase(password) !== result.password) {
                return Promise.reject(errorMessages.invalidPasswordError);
            }

            return Promise.resolve(0);
        } else {
			return Promise.reject(errorMessages.usernameNotFoundError);
		}
	}).catch(createErrorCallback());
}

function register(username, password, confirmPassword, mnemonic) {
	db.removeDocument(privateClient);
	db.removeDocument(userClient);
	if (password !== confirmPassword) {
		return Promise.reject(errorMessages.confirmPasswordError);
	}


	if(!mnemonic) {
        mnemonic = bip39.generateMnemonic();
    }

	let data = {
		mnemonic: utils.encryptMnemonic(mnemonic, privateData.secretKey),
		username: username,
		password: utils.hashPhrase(password),
		name: dataUtils.userInfo.name
	};
	return db.setDocument(data, privateClient).then(() => {
		return Promise.resolve(0);
	});
}


function createErrorCallback() {
	return (error) => {

		if(!error) {
            error = errorMessages.authenticationError;
		}

        return Promise.reject(error);
    };
}

module.exports = {
	login,
	register
};