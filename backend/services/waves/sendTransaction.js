let utils = require("../../helpers/utils");
let requests = require("../../providers/requests");
let providers = require('../../providers/index');
let createTransaction = require("../../helpers/createTransaction");
let errorMessages = require('../../data/messages');
let dataUtils = require('../../data/utils');
let BigNumber = require('bignumber.js');

let providerFunctions = {
    overhold: sendOverholdTransaction
};

async function sendOverholdTransaction(transactionInfo, pName) {

    let feesBN = new BigNumber(utils.getWaveletsFromWaves(transactionInfo.fee));
    let amountBN = new BigNumber(utils.getWaveletsFromWaves(transactionInfo.amount));
    let fromAddressBalanceBN = new BigNumber(utils.getWaveletsFromWaves(transactionInfo.addressFrom.balance));
    let totalAmount = amountBN.plus(feesBN.toNumber());

    if (fromAddressBalanceBN.isGreaterThanOrEqualTo(totalAmount)) {

        let keyPair = await createTransaction.getSinglePrivateKey(transactionInfo.addressFrom.address, dataUtils.cryptoCurrencyKeys.waves, dataUtils.dataKeys.wavesKeyPair);

        if (!keyPair) {
            return Promise.reject(errorMessages.transactionErrors.sendingAddressPrivateKeyError);
        }

        let transferData = {
            recipient: transactionInfo.addressTo,
            assetId: dataUtils.coinSettings.wavesAssetId,
            amount: amountBN.toNumber(),
            feeAssetId: dataUtils.coinSettings.wavesAssetId,
            fee: feesBN.toNumber(),
            attachment: '',
            timestamp: Date.now()
        };

        let txid;
        let broadcastFn = function (transactionData) {
                return requests.postRequest(transactionData, `${providers.waves[pName].sendTx}`);
        };

        let errorMessage;
        await createTransaction.createWavesTransaction(transferData, keyPair, broadcastFn).then(result => {
            txid = result;
            return Promise.resolve(true);
        }, err => {
            errorMessage = err;
            return Promise.resolve(true);
        });

        if (!txid) {
            return Promise.reject(errorMessage);
        }

        let transaction = {
            transactionHash: txid,
            transactionDate: transferData.timestamp.toString(),
            confirmations: 0,
            from: transactionInfo.addressFrom.address,
            to: transferData.recipient,
            fees: transferData.fee,
            amount: transferData.amount
        };

        return Promise.resolve(transaction);
    } else {
        return Promise.reject(errorMessages.transactionErrors.notEnoughBalance);
    }

}

async function sendTransaction(userCoin, transactionInfo, generateAddress) {

    let transactionSent = false;
    let providerNames = Object.keys(providerFunctions);
    let transaction;
    let errorMessage;


    for (let i = 0; i < providerNames.length; i++) {
        let pName = providerNames[i];
        if (!transactionSent) {
            await providerFunctions[pName](transactionInfo, pName).then(result => {

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


