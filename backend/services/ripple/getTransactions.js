let providers = require('../../providers/index');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');

let providerFunctions = {
	rippleS2: getRippleDataTransactions
};

function getRippleDataTransactions(obj, addresses) {
let promise = providers.requests.getRequestParam(addresses, providers.ripple.rippleS2.getTx, 'transactions');

return promise.then(arrObj => {
	for(let i = 0; i < arrObj.length; i++) {
		if(arrObj[i].result === dataUtils.serviceStings.success) {
            let result = arrObj[i].transactions;
            for (let x = 0; x < result.length; x++) {
                let item = result[x];
                let transaction = utils.findAndUpdateRippleTransaction(obj.transactions, item);
                if (!transaction) {
                    let transactionObj = {
                        transactionHash: item.hash,
                        from: item.tx.Account,
                        to: item.tx.Destination,
                        amount: item.tx.Amount,
                        fees: item.tx.Fee,
                        confirmations: 1,
                        transactionDate: new Date(item.date).getTime() + ''
                    };
                    obj.transactions.push(transactionObj);
                }
            }
        }
    }
    return Promise.resolve(true);
}, err => {
	return Promise.reject();
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
}

module.exports = {
	getTransactions
};