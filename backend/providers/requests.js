let requestP = require('request-promise');
let publicEndpoints = require('./publicEndpoints');

function postRequest(body, url) {
    return requestP(
        {
            method: 'POST',
            uri: url,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

function getRequest(url) {
    return requestP({ uri: url, json: true });
}

function getRequestParam(addresses, url, param) {
    let promises = addresses.map(address => requestP(
        { uri: `${url}${address}/${param}`,
        json: true }
        ));
    return Promise.all(promises);
}

async function getRequestMultiple(addresses, url) {
        let promises = addresses.map(address => requestP(
            { uri: `${url}${address}`,
             json: true }
             ));
        return Promise.all(promises);
};


async function getBalancesRipple(url, addresses) {
    let promises = addresses.map(address =>  requestP(
        {
            method: 'POST',
            url: url,
            body:JSON.stringify({
                method: "account_info",
                params: [
                {
                    account: address,
                    strict: true,
                    ledger_index: "validated"
                }]
             }),
             headers:{'Content-Type':'application/json'}
   
        }));
    return Promise.all(promises);
};


function getBalancesEthereum(addresses, url) {
    let promises = addresses.map(address => {
        let requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, 'latest'],
            id: 1
        };
        let headers = { 'Content-Type': 'application/json' };
        return requestP(
            {
                method: 'POST',
                uri: url,
                body: JSON.stringify(requestBody),
                headers: headers
            }
        );
    });
    return Promise.all(promises);
}

function getTransactionCountEthereum(address, url) {

    let requestBody = {
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
        id: 1
    };

    let headers = { 'Content-Type': 'application/json' };


    return requestP(
        {
            method: 'POST',
            uri: url,
            body: JSON.stringify(requestBody),
            headers: headers
        }
    );
}


function getTransactionCountEthereumMultiple(addresses, url) {
    let promises = addresses.map(address => {
        let requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [address, 'latest'],
            id: 1
        };
        let headers = { 'Content-Type': 'application/json' };
        return requestP(
            {
                method: 'POST',
                uri: url,
                body: JSON.stringify(requestBody),
                headers: headers
            }
        );
    });
    return Promise.all(promises);
}

function sendSignedTransactionEthereum(rawTx, url) {
    let requestBody = {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [rawTx],
        id: 1
    };

    let headers = { 'Content-Type': 'application/json' };

    return requestP(
        {
            method: 'POST',
            uri: url,
            body: JSON.stringify(requestBody),
            headers: headers
        }
    );
}

function getEthereumGasPricesRequest(url) {

    let body = {
        'method': 'eth_gasPrice',
        'id': 0,
        'params': [],
        'jsonrpc': '2.0'
    };

    return requestP({
        method: 'POST',
        uri: url,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });
}

function getCryptoInfoRequest(currency) {
    return requestP({
        uri: `${publicEndpoints.cryptoinfoUrl}/${currency}`,
        json: true
    });
}

function getCryptoChartInfoRequest(currency, ts1, ts2) {
    return requestP({
        uri: `${publicEndpoints.cryptoGraphUrl}/${currency}/${ts1}/${ts2}`,
        json: true
    });
}

function getMiningFeesClusterRequest(currency) {
    return requestP({
        uri: publicEndpoints.miningFeeUrls[currency],
        json: true
    });
}

function getBitcoinMiningFeesRequest() {
    return requestP({
        uri: publicEndpoints.miningFeeUrls.bitcoin,
        json: true
    });
}

function getCryptoCurrencyPrices() {
    return requestP({
        uri: publicEndpoints.cryptoPriceUrl,
        json: true
    });
}

module.exports = {
    sendSignedTransactionEthereum,
    getEthereumGasPricesRequest,
    getBalancesRipple,
    getRequestMultiple,
    getRequestParam,
    getBalancesEthereum,
    getTransactionCountEthereum,
    getTransactionCountEthereumMultiple,
    getRequest,
    postRequest,
    getCryptoInfoRequest,
    getCryptoChartInfoRequest,
    getMiningFeesClusterRequest,
    getBitcoinMiningFeesRequest,
    getCryptoCurrencyPrices
};