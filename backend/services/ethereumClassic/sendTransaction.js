let utils = require("../../helpers/utils");
let providers = require('../../providers/index');
let createTransaction = require("../../helpers/createTransaction");
let errorMessages = require('../../data/messages');
let dataUtils = require('../../data/utils');
let BigNumber = require('bignumber.js');

let providerFunctions = {
    overhold: sendOverholdTransaction
};


async function sendOverholdTransaction(transactionInfo, pName) {

    let gasPrice = utils.getWeiFromGwei(transactionInfo.fee);
    let gasPriceBN = new BigNumber(gasPrice);

    let amountInWei = utils.getWeiFromEther(transactionInfo.amount);

    let amountBN = new BigNumber(amountInWei);
    let gasLimit = dataUtils.coinSettings.gasLimit;
    let fee = gasPriceBN.times(gasLimit);
    let totalAmount = amountBN.plus(fee);
    let fromAddressBalanceWei = utils.getWeiFromEther(transactionInfo.addressFrom.balance);
    let fromAddressBalanceBN = BigNumber(fromAddressBalanceWei);

    if (fromAddressBalanceBN.isGreaterThanOrEqualTo(totalAmount)) {

        transactionInfo.gasPriceHex = `0x${gasPriceBN.toString(16)}`;
        transactionInfo.valueHex = `0x${amountBN.toString(16)}`;
        let gasLimitHex = new BigNumber(gasLimit).toString(16);
        transactionInfo.gasLimitHex = `0x${gasLimitHex}`;

        let url = `${providers.ethereumClassic[pName].general}`;


        let errorMessage;
        let txid;

        await createTransaction.createEthereumTransaction(transactionInfo, url, dataUtils.cryptoCurrencyKeys.ethereumClassic).then(result => {
            txid = result;
        }, err => {
            errorMessage = err;
            return Promise.resolve(true);
        });

        if (!txid) {
            return Promise.reject(errorMessage);
        }

        let transaction = createTransaction.parseSentTransactionEthereum(txid, transactionInfo.addressTo, amountBN.toNumber(), fee.toNumber(), transactionInfo.addressFrom.address);

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


