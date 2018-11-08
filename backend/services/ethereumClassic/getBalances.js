let providers = require('../../providers/index');
let BigNumber = require('bignumber.js');
let helpers = require('../../providers/helpers');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');

let providerFunctions = {
	overhold: getOverholdBalances,
	gasTracker: getGasTrackerGetBalances,
};

async function getOverholdBalances(addresses) {
    let promises = providers.requests.getBalancesEthereum(addresses, providers.ethereumClassic.overhold.getBalance);
	let ethereumAccountBalances = {};
	
    await promises.then(balanceDataRaw => {
        let balanceData = [];
        for(let i = 0; i < balanceDataRaw.length; i++) {
            balanceData.push(JSON.parse(balanceDataRaw[i]));
        }
        let finalBalance = new BigNumber(0);
        let addressesWithBalance = [];
        finalBalance = helpers.processAddressBalances(balanceData, addressesWithBalance, finalBalance, addresses, 'result', 'getEtherFromWei', 0);
        let addressBalanceObj = {
            address: '',
            balance: 0,
            nonce: 0
        };
        helpers.checkIfAddressIsPresent(addressesWithBalance, addresses, addressBalanceObj);
        ethereumAccountBalances = helpers.getAccountBalance(finalBalance, addressesWithBalance, 'getEtherFromWei');
        return Promise.resolve(true);
    });
    let promisesNonces = providers.requests.getTransactionCountEthereumMultiple(addresses, providers.ethereumClassic.overhold.getBalance);
    await promisesNonces.then(transactionCountsRaw => {
        let transactionCounts = [];
        for(let i = 0; i < transactionCountsRaw.length; i++) {
            transactionCounts.push(JSON.parse(transactionCountsRaw[i]));
        }
        for(let i = 0; i < transactionCounts.length; i++) {
            ethereumAccountBalances.addresses[i].nonce = new BigNumber(transactionCounts[i].result, 16).toNumber();
        }
        return Promise.resolve(true);
	});
    return Promise.resolve(ethereumAccountBalances);
}

async function getGasTrackerGetBalances(addresses) {
	let promises = providers.requests.getRequestMultiple(addresses, providers.ethereumClassic.gasTracker.getBalance);
	let ethereumAccountBalances = {};
	let error = false;
	await promises.then(balanceData => {
		let finalBalance = new BigNumber(0);
		let addressesWithBalance = [];
		if (balanceData.length === 0 && addresses.length > 0) {
			error = true;
			return Promise.resolve(true);
		}
		finalBalance = helpers.processAddressBalances(balanceData, addressesWithBalance, finalBalance, addresses, 'gasTrackerEther', null, 0);
		let addressBalanceObj = {
			address: '',
			balance: 0,
			nonce: 0
		};
		helpers.checkIfAddressIsPresent(addressesWithBalance, addresses, addressBalanceObj);
		ethereumAccountBalances = helpers.getAccountBalance(finalBalance, addressesWithBalance);
		return Promise.resolve(true);
	});
	return Promise.resolve(ethereumAccountBalances);
}


async function getBalances(userCoin) {
	let resultObj = {};
	resultObj.internal = JSON.parse(JSON.stringify(userCoin.internal));
	resultObj.change = JSON.parse(JSON.stringify(userCoin.change));
	let internalBalancesReceived = false;
	let providerNames = Object.keys(providerFunctions);
	let internalAddresses = utils.getAddresses(resultObj.internal.addresses);

	for (let i = 0; i < providerNames.length; i++) {
		let pName = providerNames[i];
		if(!internalBalancesReceived) {
			await providerFunctions[pName](internalAddresses).then(result => {
				internalBalancesReceived = true;
				helpers.setResults(resultObj, result, dataUtils.coinDataTypes.internal);
				return Promise.resolve(true);
			}, err => {
				return Promise.resolve(true);
			});
		}
	}
	return Promise.resolve(resultObj);
};

module.exports = {
	getBalances
};



