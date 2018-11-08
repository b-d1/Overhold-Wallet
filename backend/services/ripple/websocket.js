let utils = require ('../../helpers/utils');
let db = require('../../db/db');
let privateData = require('../../data/private');
let WebSocket = require('ws');
let BigNumber = require('bignumber.js');
let signRippleTransaction = require('ripple-sign-keypairs');
let userService = require('../user');
let dataUtils = require('../../data/utils');
let messages = require('../../data/messages');

let webSocket;
let api;
let userCoin;
let publicCoin;
let ipc;

function getMiningFees() {
    if ( webSocket && webSocket.readyState === 1) {
        let miningFeesRequest = {
            id: 701,
            command: 'server_info'
        };
        webSocket.send(JSON.stringify(miningFeesRequest));
    }
}

async function setPublicData(provider, ipcPar) {
    ipc = ipcPar;
    await db.getDocument(dataUtils.cryptoCurrencyKeys.ripple, dataUtils.dbNames.global).then(result => {
        publicCoin = result;
        return Promise.resolve(true);
    });
    api = provider;
    webSocket = new WebSocket(provider);
    subscribeToWebsocket();
    webSocket.on('open', () => {

    });
    webSocket.on('error', (event) => {

    });
    return Promise.resolve(true);
}


async function makeTransaction(transactionInfo, ipcP) {
    ipc = ipcP;
    let feesBN = new BigNumber(utils.getDropsFromXRP(transactionInfo.fee));
    let amountBN = new BigNumber(utils.getDropsFromXRP(transactionInfo.amount));
    let fromAddressBalanceBN = new BigNumber(utils.getDropsFromXRP(transactionInfo.addressFrom.balance));
    let totalAmountBN = amountBN.plus(feesBN.toNumber());
    if (fromAddressBalanceBN.isGreaterThanOrEqualTo(totalAmountBN)) {
        let rippleKeyPair;
        await userService.getPrivateAddressData(transactionInfo.addressFrom.address, dataUtils.cryptoCurrencyKeys.ripple, dataUtils.coinDataTypes.internal, privateData.dataKeys.rippleKeyPair).then(keyPair => {
            rippleKeyPair = keyPair;
            return Promise.resolve(true);
        }, err => {
            return Promise.resolve(true);
        });
        if (!rippleKeyPair) {
            sendTransactionFailedStatus();
        }
        let txParams = {
            TransactionType: 'Payment',
            Account: transactionInfo.addressFrom.address,
            Destination: transactionInfo.addressTo,
            Amount: amountBN.toString(),
            Flags: transactionInfo.transactionFlags,
            Fee: feesBN.toString(),
            Sequence: transactionInfo.addressFrom.nonce
        };
        let txString = JSON.stringify(txParams);
        let txSign = signRippleTransaction(txString, rippleKeyPair);
        if (!txSign) {
            sendTransactionFailedStatus();
        }
        if (!sendTransaction(txSign.signedTransaction)) {
            sendTransaction(txSign.signedTransaction);
        }
    } else {
        sendTransactionFailedStatus();
    }
}
function subscribeToWebsocket() {
    webSocket.on('message', (event) => {
        let data = JSON.parse(event);
        if (data.status === dataUtils.serviceStings.success && data.id === 701) {
            if (data.result.info && data.result.info['validated_ledger'] && data.result.info['validated_ledger']['base_fee_xrp'] && data.result.info['load_factor']) {
                let miningFees = data.result.info['validated_ledger']['base_fee_xrp'] * data.result.info['load_factor'];
                if (publicCoin.miningFees.slow === 0 || publicCoin.miningFees.slow !== miningFees) {
                    publicCoin.miningFees.slow = miningFees;
                    publicCoin.miningFees.medium = new BigNumber(miningFees).times(1.5).toNumber();
                    publicCoin.miningFees.fast = new BigNumber(miningFees).times(2).toNumber();
                    db.updateDocument(publicCoin.name, publicCoin, dataUtils.dbNames.global).then(result => {
                        let returnMsg = {
                            type: messages.events.rippleMiningFeesSet
                        };
                        if(ipc && ipc.server && ipc.socket) {
                            utils.sendMessage(returnMsg, ipc);
                        }
                    });
                }
            }
        }
        if (data.status === dataUtils.serviceStings.success && data.id === 801) {

            if (data.result['engine_result_code'] === 0) {
                let transaction = {
                    transactionHash: data.result['tx_json'].hash,
                    transactionDate: Date.now().toString(),
                    confirmations: 0,
                    from: data.result['tx_json'].Account,
                    to: data.result['tx_json'].Destination,
                    fees: data.result['tx_json'].Fee,
                    amount: data.result['tx_json'].Amount
                };
                // read before writing in order to avoid data overwrite
                db.getDocument(dataUtils.cryptoCurrencyKeys.ripple, dataUtils.dbNames.user).then(result => {
                    userCoin = result;
                    userCoin.internal.transactions.push(transaction);
                    db.updateDocument(userCoin.name, userCoin, dataUtils.dbNames.user).then(setResult => {
                        let returnMsg = {
                            type: messages.events.transactionSent,
                            transaction: transaction
                        };
                        utils.sendMessage(returnMsg, ipc);
                    });
                    return Promise.resolve(true);
                });
            } else {
                sendTransactionFailedStatus();
            }
        }
        if (data.status === 'error') {
            if(data.id === 801) {
                let returnMsg = {
                    type: messages.events.transactionFailed,
                    message: data["error_exception"]
                };
                utils.sendMessage(returnMsg, ipc);

            }

        }
    });
}

function sendTransaction(txBlob) {
    if (webSocket.readyState === 1) {
        let transactionRequest = {
            id: 801,
            command: 'submit',
            tx_blob: txBlob
        };
        webSocket.send(JSON.stringify(transactionRequest));
        return true;
    } else {
        return false;
    }
}


function sendTransactionFailedStatus() {
    let returnMsg = {
        type: messages.events.transactionFailed
    };
    utils.sendMessage(returnMsg, ipc);
}

module.exports = {
    getMiningFees,
    setPublicData,
    makeTransaction
};