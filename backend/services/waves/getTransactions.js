let providers = require('../../providers/index');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');

let providerFunctions = {
    overhold: getOverholdTransactions
};

function getOverholdTransactions(obj, addresses) {
    let requestBody = {'addresses':addresses};
    let results =  providers.requests.postRequest(requestBody, providers.waves.overhold.getTx);
    
    return results.then(resultAPI => {
        let  resultApiJSON = JSON.parse(resultAPI);
		if(resultApiJSON.status !== "success") return Promise.reject();
        let transactions = resultApiJSON.transactions;

        for(let j = 0; j < transactions.length; j++) {
            let resultArray = transactions[j];
            let result;
            for (let i = 0; i < resultArray.length; i++) {
                result = resultArray[i];
                for (let k = 0; k < result.length; k++) {
                    let transactionResult = result[k];
                    if (transactionResult.assetId === null && (transactionResult.type === 4 || transactionResult.type === 11)) {
                        let isPresent = utils.findAndUpdateWavesTransaction(obj.transactions, transactionResult);
                        if (!isPresent) {

                        	let receiver = transactionResult.type === 11 ? transactionResult.transfers[0].recipient : transactionResult.recipient;
                        	let amount = transactionResult.type === 11 ? transactionResult.transfers[0].amount: transactionResult.amount;

                            let transactionObj = {
                                transactionHash: transactionResult.id,
                                from: transactionResult.sender,
                                to: receiver,
                                amount: amount,
                                fees: transactionResult.fee,
                                confirmations: 1,
                                transactionDate: transactionResult.timestamp + ''
                            };
                            obj.transactions.push(transactionObj);
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