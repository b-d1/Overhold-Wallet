const db = require('../db/db');
const utils = require('../helpers/utils');
const privateData = require('../data/private');
const errorMessages = require('../data/messages').userAuthSettingsErrors;
const dataUtils = require('../data/utils');
let privateClient = dataUtils.dbNames.private;


async function getMnemonic() {
    return db.getDocument(dataUtils.userInfo.name, privateClient).then(async (result) => {
        if (result.mnemonic) {
            return Promise.resolve(result.mnemonic);
        }
        return Promise.reject(errorMessages.mnemonicNotFoundError);
    })
        .catch(error => Promise.reject(errorMessages.getMnemonicError));
}

async function changeUsername(oldUsername, newUsername, password) {
    return db.getDocument(dataUtils.userInfo.name, privateClient).then(async (result) => {
        if (result) {

            if(result.password !== utils.hashPhrase(password)) {
                return Promise.reject(errorMessages.invalidPasswordError);
            }

            if(result.username !== oldUsername) {
                return Promise.reject(errorMessages.invalidOldUsernameError);
            }

            result.username = newUsername;
            return db.updateDocument(result.name, result, privateClient).then(() => {
                return Promise.resolve(true);
            });
        }
        else return Promise.reject(errorMessages.getDocumentError);
    });
}

async function changePassword(oldPassword, newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
        return Promise.reject(errorMessages.confirmPasswordError);
    }
    return db.getDocument(dataUtils.userInfo.name, privateClient).then(async (result) => {
        if(result) {

            if(result.password !== utils.hashPhrase(oldPassword)) {
                return Promise.reject(errorMessages.invalidPasswordError);
            }

            result.password = utils.hashPhrase(newPassword);
            return db.updateDocument(result.name, result, privateClient).then(() => {
                return Promise.resolve(true);
            });
        }
        else return Promise.reject(errorMessages.getDocumentError);
    }).catch(createErrorCallback());
}

async function getUsername() {
    return db.getDocument(dataUtils.userInfo.name, privateClient).then(async (result) => {
        if (result.username) {
            return Promise.resolve(result.username);
        }
        return Promise.reject(errorMessages.usernameNotFoundError);
    }).catch(error => Promise.reject(errorMessages.getUsernameError));
}


function createErrorCallback() {
    return (error) => {
        if(!error) {
            error = errorMessages.unknownError;
        }

        return Promise.reject(error);
    };
}

async function getPrivateAddressData(address, coinName, type, key) {
    let docData;
    if (type === dataUtils.coinDataTypes.change) {
        docData = await db.getDocument(coinName, dataUtils.dbNames.private).then(doc => {
            return doc.change.addresses.find(obj => {
                return obj.address === address;
            });
        });

    } else if (utils.isCoinUtxoBased(coinName)) {
        docData = await db.getDocument(coinName, dataUtils.dbNames.private).then(doc => {
            return doc.internal.addresses.find(obj => {
                return obj.address === address;
            });
        });
        // fallback for utxos from mixed addresses (internal and change), and the type is unknown. Check if address is in internal doc, and if not check in change doc.
        if (!docData) {
            docData = await db.getDocument(coinName, dataUtils.dbNames.private).then(doc => {
                return doc.change.addresses.find(obj => {
                    return obj.address === address;
                });
            });
        }
    } else {
        docData = await db.getDocument(coinName, dataUtils.dbNames.private).then(doc => {
            return doc.internal.addresses.find(obj => {
                return obj.address === address;
            });
        });
    }

    if (!docData) {
        return Promise.reject(errorMessages.getPrivateDataError);
    }

    if (key === privateData.dataKeys.privateKeyString) {
        let pKey;
        if (utils.isCoinUtxoBased(coinName) || coinName === dataUtils.cryptoCurrencyKeys.ripple) {
            pKey = docData.WIF;
        } else if (coinName === dataUtils.cryptoCurrencyKeys.waves) {
            pKey = docData.privateKey;
        } else if (coinName === dataUtils.cryptoCurrencyKeys.ethereum || coinName === dataUtils.cryptoCurrencyKeys.ethereumClassic) {
            pKey = docData.privateKeyString;
        }
        return Promise.resolve(pKey);
    } else if (key === privateData.dataKeys.privateKeyBuffer) {
        let pKey;
        if (coinName === dataUtils.cryptoCurrencyKeys.ethereum || dataUtils.cryptoCurrencyKeys.ethereumClassic) {
            pKey = Buffer.from(docData.privateKey);
        }
        return Promise.resolve(pKey);
    } else if (key === privateData.dataKeys.wavesKeyPair) { // read waves private data at once, since private and public keys are both needed.
        let keyPair = {
            publicKey: docData.publicKey,
            privateKey: docData.privateKey
        };
        return Promise.resolve(keyPair);
    } else if (key === privateData.dataKeys.rippleKeyPair) { // read the whole ripple keyPairs object.
        let keyPair = docData.keyPairs;
        return Promise.resolve(keyPair);
    }
}

module.exports = {
    getMnemonic,
    changeUsername,
    changePassword,
    getUsername,
    getPrivateAddressData,
};