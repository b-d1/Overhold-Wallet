let providers = require('../../providers/index');
let BigNumber = require('bignumber.js');
let helpers = require('../../providers/helpers');
let utils = require("../../helpers/utils");
let dataUtils = require('../../data/utils');

let providerFunctions = {
    overhold: getOverholdBalances
};

async function getOverholdBalances(addresses) {
    let requestBody = {'addresses':addresses};
    let promise = providers.requests.postRequest(requestBody , providers.waves.overhold.getBalance);
   
    return promise.then(result => {
        result = JSON.parse(result);
        if(result.status !== dataUtils.serviceStings.success){
            return Promise.reject();				
        }
        let finalBalance = new BigNumber(0);
        let addressesWithBalance = [];
        finalBalance = helpers.processAddressBalances(result.addresses, addressesWithBalance, finalBalance, addresses, dataUtils.serviceStings.balance, dataUtils.serviceStings.getWavesFromWavelets);
        let accountBalance = helpers.getAccountBalance(finalBalance, addressesWithBalance, dataUtils.serviceStings.getWavesFromWavelets);
        return Promise.resolve(accountBalance);
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
}

module.exports = {
    getBalances
};



