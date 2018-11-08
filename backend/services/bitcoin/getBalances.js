let providers = require('../../providers/index');
let BigNumber = require('bignumber.js');
let helpers = require('../../providers/helpers');
let utils = require('../../helpers/utils');
let dataUtils = require('../../data/utils');


let providerFunctions = {
    overhold: getOverholdBalances,
    blockchainInfo: getBlockchainInfoBalances
};

async function getOverholdBalances(addresses) {
	let requestBody = {'addresses':addresses};
    let promise = providers.requests.postRequest(requestBody, providers.bitcoin.overhold.getBalance);

	return promise.then(result => {
		result = JSON.parse(result);
        if(result.status !== dataUtils.serviceStings.success){
            return Promise.reject();
        }
        let finalBalance = new BigNumber(0);
        let addressesWithBalance = [];
        finalBalance = helpers.processAddressBalances(result.addresses, addressesWithBalance, finalBalance, addresses, dataUtils.serviceStings.balance, dataUtils.serviceStings.getUnitsFromSatoshis);
        let accountBalance = helpers.getAccountBalance(finalBalance, addressesWithBalance, dataUtils.serviceStings.getUnitsFromSatoshis);
        return Promise.resolve(accountBalance);
    });
}

async function getBlockchainInfoBalances(addresses) {
	let addressesString = addresses.join('|');
	let promises = providers.requests.getRequest(`${providers.bitcoin.blockchainInfo.getBalance}${addressesString}`);

	return promises.then(result => {
		let finalBalance = new BigNumber(0);
		let addressesWithBalance = [];
		for (let i = 0; i < addresses.length; i++) {
			let balance = new BigNumber(result[addresses[i]].dataUtils.serviceStings.finalBalance);
			finalBalance = finalBalance.plus(balance);
			let addressBalance = {
				address: addresses[i],
				balance: utils.dataUtils.serviceStings.getUnitsFromSatoshis(result[addresses[i]].dataUtils.serviceStings.finalBalance)
			};
			addressesWithBalance.push(addressBalance);
		}
		let addressBalanceObj = {
			address: '',
			balance: 0
		};
		helpers.checkIfAddressIsPresent(addressesWithBalance, addresses, addressBalanceObj);
		let accountBalance = helpers.getAccountBalance(finalBalance, addressesWithBalance, dataUtils.serviceStings.getUnitsFromSatoshis);
		return Promise.resolve(accountBalance);
	});
}

async function getBalances(userCoin) {
	let resultObj = {};
	resultObj.internal = JSON.parse(JSON.stringify(userCoin.internal));
	resultObj.change = JSON.parse(JSON.stringify(userCoin.change));
	let internalBalancesReceived = false;
	let changeBalancesReceived = false;
	let providerNames = Object.keys(providerFunctions);
	let internalAddresses = utils.getAddresses(resultObj.internal.addresses);
	let changeAddresses = utils.getAddresses(resultObj.change.addresses);
	
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
		if(!changeBalancesReceived && userCoin.change.addresses.length > 0) {
			await providerFunctions[pName](changeAddresses).then(result => {
				changeBalancesReceived = true;
				helpers.setResults(resultObj, result, dataUtils.coinDataTypes.change);
				return Promise.resolve(true);
			}, 
			err => {
				return Promise.resolve(true);
			});
		}
	}
	return Promise.resolve(resultObj);
}

module.exports = {
	getBalances
};



