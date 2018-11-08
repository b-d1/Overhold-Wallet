let providers = require('../../providers/index')
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils'); 

let providerFunctions = {
    overhold: getOverholdBitcoreTransactions,
    blockchainInfo: getBlockchainInfoTransactions
};

async function getOverholdBitcoreTransactions(obj, addresses) {
	let requestBody = {'addresses':addresses};
    let results =  providers.requests.postRequest(requestBody, providers.bitcoin.overhold.getTx);
	
	return results.then(resultRaw => {
        let result = JSON.parse(resultRaw);
        if (result) {
            let items = result.items;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                let transaction = utils.findAndUpdateTransaction(obj.transactions, item);
                if (!transaction) {
                    for (let k = 0; k < item.vout.length; k++) {
                        if (item.vout[k].scriptPubKey.addresses) {
                            for (let index in addresses) {
                                if (item.vout[k].scriptPubKey.addresses[0] === addresses[index]) {
                                    let transactionObj = {
                                        transactionHash: item.txid,
                                        from: item.vin[0].addr,
                                        to: item.vout[k].scriptPubKey.addresses[0],
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
    }, err => {
    	return Promise.reject();
	});
}

async function getBlockchainInfoTransactions(obj, addresses) {
	let promises = addresses.map(address => providers.requests.getRequest(`${providers.bitcoin.blockchainInfo.getTx}${address}`));
	let results = Promise.all(promises);
	
	return results.then(resultArrayRaw => {
		let resultArray = resultArrayRaw;
		let result;
		if (resultArray) {
			for (let i = 0; i < resultArray.length; i++) {
				result = resultArray[i];
				let items = result.txs;
				for (let j = 0; j < items.length; j++) {
					let item = items[j];
					let transaction = utils.findAndUpdateTransactionBitcoinBlockchain(obj.transactions, item);
					if (!transaction) {
						for (let k = 0; k < item.out.length; k++) {
							for (let index in addresses) {
								if (item.out[k].addr === addresses[index]) {
									let transactionObj = {
										transactionHash: item.hash,
										from: item.inputs[0]['prev_out'].addr,
										to: item.out[0].addr,
										amount: item.out[k].value,
										fees: utils.calculateBitcoinTransactionFees(item),
										confirmations: 1,
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

	}, err => {
		return Promise.reject();
	})
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
