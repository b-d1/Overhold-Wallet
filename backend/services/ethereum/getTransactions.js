let providers = require('../../providers/index');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');

let providerFunctions = {
    etherscan: getEtherscanTransactions,
	ehtplorer: getEthplorerTransactions
};

async function getEtherscanTransactions(obj, addresses) {
    let promises = addresses.map(address => providers.requests.getRequest(`${providers.ethereum.etherscan.getTx}${address}&startblock=0&endblock=99999999&sort=asc`));
    let results = Promise.all(promises);

    return results.then(resultArray => {
        let result;
        for (let i = 0; i < resultArray.length; i++) {
            result = resultArray[i];
            let items = result.result;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                let transaction = utils.findAndUpdateEthereumTransaction(obj.transactions, item, false);
                if (!transaction) {
                    let transactionObj = {
                        transactionHash: item.hash,
                        from: item.from,
                        to: item.to,
                        amount: parseInt(item.value),
                        fees: parseInt(item.gasPrice),
                        confirmations: parseInt(item.confirmations),
                        transactionDate: (parseInt(item.timeStamp) * 1000) + ''
                    };
                    obj.transactions.push(transactionObj);
                }
            }
        }
        return Promise.resolve(true);
    });
}

async function getEthplorerTransactions(obj, addresses) {
    let promises = addresses.map(address => providers.requests.getRequest(`${providers.ethereum.ethplorer.getTx}${address}?apiKey=freekey`));
    let results = Promise.all(promises);

    return results.then(resultArray => {
        let result;
        for (let i = 0; i < resultArray.length; i++) {
            result = resultArray[i];
            let items = result;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                let transaction = utils.findAndUpdateEthereumTransaction(obj.transactions, item, true);
                if (!transaction) {
                    let transactionObj = {
                        transactionHash: item.hash,
                        from: item.from,
                        to: item.to,
                        amount: parseInt(utils.getWeiFromEther(item.value)),
                        fees: 0,
                        confirmations: 1,
                        transactionDate: (item.timestamp * 1000) + ''
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
	getTransactions,
};