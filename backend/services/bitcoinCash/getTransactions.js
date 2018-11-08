let providers = require('../../providers/index');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');
let bchaddr = require('bchaddrjs');

let providerFunctions = {
    bitprim: getBitprimTransactions
};

async function getBitprimTransactions(obj, addresses) {
    let requestBody = {addrs: addresses.join()};
    let results =  providers.requests.postRequest(requestBody, providers.bitcoinCash.bitprim.getTx);

    return results.then(resultRaw => {
        let result = JSON.parse(resultRaw);
        if (result) {
            let items = result.items;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                let transaction = utils.findAndUpdateTransaction(obj.transactions, item, true);
                if (!transaction) {
                    for (let k = 0; k < item.vout.length; k++) {
                        if (item.vout[k].scriptPubKey.addresses) {
                            for (let index in addresses) {
                                let legacyAddressTo = bchaddr.toLegacyAddress(item.vout[k].scriptPubKey.addresses[0]);
                                if (legacyAddressTo === addresses[index]) {
                                    let transactionObj = {
                                        transactionHash: item.txid,
                                        from: bchaddr.toLegacyAddress(item.vin[0].addr),
                                        to: legacyAddressTo,
                                        amount: utils.convertToSatoshis(item.vout[k].value),
                                        fees: utils.convertToSatoshis(item.fees),
                                        confirmations: item.confirmations,
                                        transactionDate: (parseInt(item.time) * 1000) + ''
                                    };
                                    obj.transactions.push(transactionObj);
                                }
                            }
                        }
                    }
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
	let changeTransactionsReceived = false;
	let providerNames = Object.keys(providerFunctions);
	let internalAddresses = utils.getAddresses(resultObj.internal.addresses);
    let changeAddresses = utils.getAddresses(resultObj.change.addresses);
    
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
		if (!changeTransactionsReceived && userCoin.change.addresses.length > 0) {
			await providerFunctions[pName](resultObj.change, changeAddresses).then(result => {
				changeTransactionsReceived = true;
				return Promise.resolve(true);
			}, err => {
				return Promise.resolve(true);
			});
		}
	}
	return Promise.resolve(resultObj);
}

module.exports = {
	getTransactions
};