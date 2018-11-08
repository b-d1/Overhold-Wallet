let providers = require('../../providers/index');
let BigNumber = require('bignumber.js');
let helpers = require('../../providers/helpers');
let utils = require("../../helpers/utils");
let dataUtils = require ('../../data/utils');

let providerFunctions = {
    rippleS2: getBalanceCommon,
    overhold: getBalanceCommon
};

function getBalanceCommon(addresses, pName) {
    let promise = providers.requests.getBalancesRipple(providers.ripple[pName].getBalance, addresses);
    return promise.then(arrObj => {
        let finalBalance = new BigNumber(0);
        let addressesWithBalance = [];
        let result;
        for (let x = 0; x < arrObj.length; x++) {
            result = JSON.parse(arrObj[x]);
            if(result.result.status === "success") {
                let balance = result.result.account_data.Balance;
                finalBalance = finalBalance.plus(utils.getXRPFromDrops(balance));
                let addressBalance = {
                    address: result.result["account_data"].Account,
                    balance: utils.getXRPFromDrops(result.result["account_data"].Balance),
                    nonce: result.result["account_data"].Sequence
                };
                addressesWithBalance.push(addressBalance);
            } else if(result.result.status === "error") {
                let addressBalance = {
                    address: result.result.account,
                    balance: 0,
                    nonce: 0
                };
                addressesWithBalance.push(addressBalance);
            }
        }
        let addressBalanceObj = {
            address: '',
            balance: 0
        };
        helpers.checkIfAddressIsPresent(addressesWithBalance, addresses, addressBalanceObj);
        let accountBalance = helpers.getAccountBalance(finalBalance, addressesWithBalance);
        return Promise.resolve(accountBalance);
    }, err => {
        return Promise.reject(err);
    });
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
        if (!internalBalancesReceived) {
            await providerFunctions[pName](internalAddresses, pName).then(result => {
                internalBalancesReceived = true;
                helpers.setResults(resultObj, result, dataUtils.coinDataTypes.internal);
                return Promise.resolve(true);
            }, err => {
                return Promise.resolve(true);
            });
        }
    }
    return Promise.resolve(resultObj);
}

module.exports = {
    getBalances
};



