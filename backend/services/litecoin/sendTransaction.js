let utils = require("../../helpers/utils");
let providers = require('../../providers/index');
let createTransaction = require("../../helpers/createTransaction");
let errorMessages = require('../../data/messages');
let dataUtils = require('../../data/utils');

let providerFunctions = {
    overhold: sendOverholdTransaction
};


async function sendOverholdTransaction(userCoin, transactionInfo, generateAddress, pName) {

    let addressesWithBalanceInternal = utils.getAddressesWithBalance(userCoin.internal.addresses);
    let addressesWithBalanceChange = utils.getAddressesWithBalance(userCoin.change.addresses);
    let addressesWithBalance = addressesWithBalanceInternal.concat(addressesWithBalanceChange);
    let addressesString = addressesWithBalance.join();

    let urls = {
        utxo: `${providers.litecoin[pName].getUTXO}`,
        broadcastTransaction: `${providers.litecoin[pName].sendTx}`
    };

    transactionInfo.fee = utils.convertToSatoshis(transactionInfo.fee) / dataUtils.coinSettings.litecoinFeeDivisor; // satoshis per kilobyte converted to satoshis per byte
    transactionInfo.amount = utils.convertToSatoshis(transactionInfo.amount);

    let tx;
    let transferFee;
    let addressFrom;
    let errorMessage;

    await createTransaction.createUTXOBasedTransaction(addressesString, transactionInfo.addressTo, transactionInfo.amount, transactionInfo.fee, userCoin.name, urls, generateAddress, pName).then(result => {
        tx = result.tx;
        transferFee = result.transferFee;
        addressFrom = result.addressFrom;
        return Promise.resolve(true);
    }, err => {
        errorMessage = err;
        return Promise.resolve(true);
    });

    if (!tx) {
        return Promise.reject(errorMessage);
    }

    let transaction = createTransaction.parseSentTransaction(tx, transactionInfo.addressTo, transactionInfo.amount, transferFee, addressFrom);

    return Promise.resolve(transaction);
}

async function sendTransaction(userCoin, transactionInfo, generateAddress) {

    let transactionSent = false;

    let providerNames = Object.keys(providerFunctions);

    let transaction;
    let errorMessage;

    for (let i = 0; i < providerNames.length; i++) {

        let pName = providerNames[i];
        if (!transactionSent) {
            await providerFunctions[pName](userCoin, transactionInfo, generateAddress, pName).then(result => {
                transactionSent = true;
                transaction = result;
                return Promise.resolve(true);
            }, err => {
                errorMessage = err;
                return Promise.resolve(true);
            });
        }

        if (errorMessage !== errorMessages.transactionErrors.apiNotAvailable || transactionSent) {
            break;
        }
    }

    let transactionResult = {
        sent: false
    };

    if (transactionSent) {
        transactionResult.sent = true;
        transactionResult.transaction = transaction;
    } else {
        transactionResult.message = errorMessage;
    }


    return Promise.resolve(transactionResult);

}

module.exports = {
    sendTransaction
};


