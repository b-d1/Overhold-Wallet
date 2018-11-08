let db = require('../db/db');
let utils = require('../helpers/utils');
let templates = require('../data/templates');
let messages = require('../data/messages');
let services = require('./index');
let generateAddressesUtils = require('../helpers/generateAddresses');
const dataUtils = require('../data/utils');
let ipc;

let errorMessages = messages.generalErrors;
let events = messages.events;

async function setupPublicUserInfo() {
    let supportedCurrencies = Object.values(dataUtils.supportedCoins);
    let client = dataUtils.dbNames.user;

    for (let i = 0; i < supportedCurrencies.length; i++) {
        let coinName = supportedCurrencies[i];
        await utils.getUserCoin(coinName, client).then(async (result) => {
            if (!result) {
                let userCoin = JSON.parse(JSON.stringify(templates.UserCoin));
                userCoin.name = coinName;
                await db.setDocument(userCoin, client).then(res => {
                    return Promise.resolve(true);
                });

            }
            return Promise.resolve(true);
        });
    }

}

async function setupPrivateUserInfo() {
    let supportedCurrencies = Object.values(dataUtils.supportedCoins);
    let client = dataUtils.dbNames.private;

    for (let i = 0; i < supportedCurrencies.length; i++) {
        let coinName = supportedCurrencies[i];
        await utils.getUserCoin(coinName, client).then(async (result) => {
            if (!result) {
                let userCoin = JSON.parse(JSON.stringify(templates.CoinPrivateInfo));
                userCoin.name = coinName;

                await db.setDocument(userCoin, client).then(res => {
                    return Promise.resolve(true);
                });

            }
            return Promise.resolve(true);
        });
    }
}

async function getBalances(client, ipcP, coinsSettings) {
    ipc = ipcP;
    let supportedCurrencies = Object.values(dataUtils.supportedCoins);
    for (let i = 0; i < supportedCurrencies.length; i++) {
        let coinName = supportedCurrencies[i];
        if (coinsSettings[coinName]) {
            await utils.getUserCoin(coinName, client).then(async (result) => {
                let userCoin = result;
                if (userCoin && userCoin.internal.addresses && userCoin.internal.addresses.length > 0) {
                    await getBalancesHelper(userCoin, client);
                }
                return Promise.resolve(true);
            });
        }
    }
    return Promise.resolve(true);
}

async function getTransactions(client, ipcP, coinsSettings) {
    ipc = ipcP;

    let supportedCurrencies = Object.values(dataUtils.supportedCoins);

    for (let i = 0; i < supportedCurrencies.length; i++) {
        let coinName = supportedCurrencies[i];
        if (coinsSettings[coinName]) {
            await utils.getUserCoin(coinName, client).then(async (result) => {
                let userCoin = result;
                if (userCoin && userCoin.internal.addresses && userCoin.internal.addresses.length > 0) {
                    await getTransactionsHelper(userCoin, client);
                }
                return Promise.resolve(true);
            });
        }

    }

    return Promise.resolve(true);
}


async function generateAddresses(ipcP) {
    ipc = ipcP;

    let clientPrivate = dataUtils.dbNames.private;
    let clientPublic = dataUtils.dbNames.user;
    let supportedCurrencies = Object.values(dataUtils.supportedCoins);

    for (let i = 0; i < supportedCurrencies.length; i++) {
        let coinName = supportedCurrencies[i];
        let userCoinPrivate = await utils.getUserCoin(coinName, clientPrivate);
        let userCoinPublic = await utils.getUserCoin(coinName, clientPublic);

        if (!userCoinPrivate) continue;

        if (userCoinPrivate.internal.addresses && userCoinPrivate.internal.addresses.length > 0) continue;
        userCoinPrivate.internal.addressIndex = 0;
        let key = utils.getCoinTypeFromCoinName(coinName);

        try {
            let resultObj = await generateAddressesUtils.generateAddressesHelper(dataUtils.coinType[key], 1, userCoinPrivate, dataUtils.coinDataTypes.internal);
            userCoinPrivate.internal.addressIndex = resultObj.addressIndex;
            userCoinPrivate.internal.addresses = resultObj.addresses;
            userCoinPublic.internal.addresses = resultObj.pubAddresses;

            if (dataUtils.coinType[key] !== dataUtils.coinType.Waves) {
                userCoinPrivate.internal.derivationPath = resultObj.derivationPath;
            }

        } catch (err) {

        }

        await db.updateDocument(userCoinPrivate.name, userCoinPrivate, clientPrivate).then(coinPrivateRes => {
            return Promise.resolve(true);
        });

        await db.updateDocument(userCoinPublic.name, userCoinPublic, clientPublic).then(coinPublicRes => {
            return Promise.resolve(true);
        });

    }

    let returnMsg = {
        type: events.cryptoAddressesGenerated
    };

    utils.sendMessage(returnMsg, ipc);
    return Promise.resolve(true);

}

async function makeTransaction(transactionInfo, client, ipcP) {

    let coinName = transactionInfo.name;
    let userCoin = await utils.getUserCoin(coinName, client);

    if (!userCoin) {
        let returnMsg = {
            type: events.transactionFailed,
            message: errorMessages.internalError
        };
        utils.sendMessage(returnMsg, ipcP);
        return;
    }
    let supportedCurrency = utils.getCamelCase(userCoin.name);

    let changeAddressCallback = (coinName, type) => {
        return generateAddressesUtils.generateNewAddress(coinName, type);
    };

    services[supportedCurrency].sendTransaction(userCoin, transactionInfo, changeAddressCallback).then(async (result) => {
        let returnMsg;
        if (result.sent === false) {
            returnMsg = {
                type: events.transactionFailed,
                message: result.message
            };
            utils.sendMessage(returnMsg, ipcP);
        } else {

            userCoin = await utils.getUserCoin(coinName, client);
            userCoin.internal.transactions.push(result.transaction);
            db.updateDocument(userCoin.name, userCoin, client).then(resultSet => {
                returnMsg = {
                    type: events.transactionSent,
                    transaction: result.transaction
                };

                utils.sendMessage(returnMsg, ipcP);
            });
        }

    });

}

async function getTransactionsHelper(userCoin, client) {

    let supportedCurrency = utils.getCamelCase(userCoin.name);
    if (supportedCurrency === dataUtils.cryptoCurrencyKeys.ripple) return;

    services[supportedCurrency].getTransactions(userCoin).then(async (resultGl) => {

        if (resultGl.internal.transactions.length > userCoin.internal.transactions.length || resultGl.change.transactions.length > userCoin.change.transactions.length) {
            userCoin.internal = resultGl.internal;
            userCoin.change = resultGl.change;
            await db.updateDocument(userCoin.name, userCoin, client).then(result => {

                let returnMsg = {
                    type: events.transactionsSet
                };

                utils.sendMessage(returnMsg, ipc);
                return Promise.resolve(true);
            });
        }
        return Promise.resolve(true);
    });

    return Promise.resolve(true);
}

async function getBalancesHelper(userCoin, client) {

    let supportedCurrency = utils.getCamelCase(userCoin.name);
    if (supportedCurrency === dataUtils.cryptoCurrencyKeys.ripple) return;

    services[supportedCurrency].getBalances(userCoin).then(async (result) => {
        if (JSON.stringify(userCoin.internal.addresses) !== JSON.stringify(result.internal.addresses) || JSON.stringify(userCoin.change.addresses) !== JSON.stringify(result.change.addresses)) {
            if(result.internal.addresses.length === 0) return Promise.resolve(true);
            userCoin.internal = result.internal;
            userCoin.change = result.change;
            await db.updateDocument(userCoin.name, userCoin, client).then(result => {
                let returnMsg = {
                    type: events.balancesSet
                };
                utils.sendMessage(returnMsg, ipc);
                return Promise.resolve(true);
            });
        }
        return Promise.resolve(true);
    });

    return Promise.resolve(true);

}

module.exports = {
    setupPublicUserInfo,
    setupPrivateUserInfo,
    getBalances,
    getTransactions,
    generateAddresses,
    makeTransaction
};