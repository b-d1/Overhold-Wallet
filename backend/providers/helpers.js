let utils = require('../helpers/utils');
let BigNumber = require('bignumber.js');

function processAddressBalances(balanceData, addressesWithBalance, finalBalance, addresses, balanceField, convertFunct, nonce) {
	for (let i = 0; i < balanceData.length; i++) {
		let balance;
		if (balanceField) {

			if (balanceField === 'gasTrackerEther') {
				balance = balanceData[i]['balance']['ether'];
			} else {
				balance = balanceData[i][balanceField];
			}
		} else {
			balance = balanceData[i] === null ? 0 : balanceData[i];
		}

		let balanceBN = new BigNumber(balance);
		finalBalance = finalBalance.plus(balanceBN);
		let addressBalance = {
			address: addresses[i]
		};

		if (convertFunct) {
			addressBalance.balance = utils[convertFunct](balance);
		} else {
			addressBalance.balance = balance;
		}

		if (nonce !== null && nonce !== undefined) {
			addressBalance.nonce = nonce;
		}

		addressesWithBalance.push(addressBalance);
	}
	return finalBalance;
}


function getAccountBalance(finalBalance, addressesWithBalance, converterFunct) {
	let balanceNumber = finalBalance.toNumber();
	let accountBalance = {
		addresses: addressesWithBalance
	};

	if (converterFunct) {
		accountBalance.balance = utils[converterFunct](balanceNumber);
	} else {
		accountBalance.balance = balanceNumber;
	}

	return accountBalance;
}


function checkIfAddressIsPresent(addressesWithBalance, addresses, addressBalanceObj) {
	for (let i = 0; i < addresses.length; i++) {
		let address = addresses[i];
		let accountBalance = addressesWithBalance.find(acBalanceAddress => {
			return acBalanceAddress.address === address;
		});

		if (!accountBalance) {
			addressBalanceObj.address = address;
			addressesWithBalance.push(addressBalanceObj);
		}
	}
}


async function getProviderBalances(providerObj, apiName) {

	let resultObj = {};
	resultObj.internal = JSON.parse(JSON.stringify(providerObj.internal));
	resultObj.change = JSON.parse(JSON.stringify(providerObj.change));
	let internalBalancesReceived = false;
	let changeBalancesReceived = false;
	let providerNames = Object.keys(balanceProviders[apiName]);
	for (let i = 0; i < providerNames.length; i++) {
		count = i;
		let pName = providerNames[i];
		if (!internalBalancesReceived) {
			await balanceProviders[apiName][pName].getBalances(resultObj.internal).then(result => {
				// console.log(apiName + " balances recieved internal", result);
				internalBalancesReceived = true;
				setResults(resultObj, result, 'internal');
				return Promise.resolve(true);
			}, err => {
				return Promise.resolve(true);
			});
		}
		if (!changeBalancesReceived) {
			await balanceProviders[apiName][pName].getBalances(resultObj.change).then(result => {
				changeBalancesReceived = true;
				setResults(resultObj, result, 'change');
				return Promise.resolve(true);
			}, err => {
				// console.log("ERROR WHILE OBTAINING CHANGE BALANCES", err);
				return Promise.resolve(true);
			});
		}
	}
	return Promise.resolve(resultObj);
}

function setResults(resultObj, result, type) {
	resultObj[type].addresses = result.addresses;

	if (result.balance || result.balance === 0) {
		resultObj[type].balance = result.balance;
	}

	if (result.balanceBTC || result.balanceBTC === 0) {
		resultObj[type].balanceBTC = result.balanceBTC;
	}

	if (result.balanceOMNI || result.balanceOMNI === 0) {
		resultObj[type].balanceOMNI = result.balanceOMNI;
	}

	if (result.balanceMAID || result.balanceMAID === 0) {
		resultObj[type].balanceMAID = result.balanceMAID;
	}

	if (result.balanceXCP || result.balanceXCP === 0) {
		resultObj[type].balanceXCP = result.balanceXCP;
	}

	if (result.balanceNVST || result.balanceNVST === 0) {
		resultObj[type].balanceNVST = result.balanceNVST;
	}
}

module.exports = {
    processAddressBalances,
    getAccountBalance,
    checkIfAddressIsPresent,
    getProviderBalances,
    setResults
};

