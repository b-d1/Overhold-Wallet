let providers = require('../../providers/index');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');

let providerFunctions = {
    gasTracker: getGasTrackerTransactions,
};

async function getGasTrackerTransactions(obj, addresses) {
    let promises = addresses.map(address => providers.requests.getRequest(`${providers.ethereumClassic.gasTracker.getTx}${address}/transactions`));
    let results = Promise.all(promises);
    
    return results.then(resultArray => {
        let newResultArray = resultArray;
        let items;
        for (let i = 0; i < newResultArray.length; i++) {
            items = newResultArray[i]['items'];
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                let transaction = utils.findAndUpdateEthereumClassicTransaction(obj.transactions, item, dataUtils.etcProviderNames.gasTracker);
                if (!transaction) {
                    let transactionObj = {
                        transactionHash: item.hash,
                        from: item.from,
                        to: item.to,
                        amount: item.value.wei,
                        fees: 0,
                        confirmations: item.confirmations,
                        transactionDate: Date.parse(item.timestamp)
                    };
                    obj.transactions.push(transactionObj);
                }
            }
        }
        return Promise.resolve(true);
    });
}

async function getTransactions(userCoin) {
    let resultObj = {};
    resultObj.internal = JSON.parse(JSON.stringify(userCoin.internal));
    resultObj.change = JSON.parse(JSON.stringify(userCoin.change));
    let internalTransactionsReceived = false;
    let providerNames = Object.keys(providerFunctions);
    let internalAddresses = utils.getAddresses(resultObj.internal.addresses);

    for (let i = 0; i < providerNames.length; i++) {
        let pName = providerNames[i];
        if (!internalTransactionsReceived) {
            await providerFunctions[pName](resultObj.internal, internalAddresses).then(result => {
                internalTransactionsReceived = true;
                return Promise.resolve(true);
            }, err => {
                return Promise.resolve(true);
            });
        }
    }
    return Promise.resolve(resultObj);
};

module.exports = {
    getTransactions
};