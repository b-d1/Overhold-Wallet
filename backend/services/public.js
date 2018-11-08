let db = require('../db/db');
let templates = require('../data/templates');
let messages = require('../data/messages');
let publicRequests = require('../providers/public');
let requests = require('../providers/requests');
let BigNumber = require('bignumber.js');
let utils = require('../helpers/utils');
let dataUtils = require('../data/utils');

async function setCoin(cryptoName, client) {
    let coin = templates.Coin;
    coin.name = cryptoName;
    return db.setDocument(coin, client);
}

async function initialSetup(client) {
    let supportedCurrencies = Object.keys(dataUtils.cryptoCurrencyKeys);
    for (const item of supportedCurrencies) {
        let cryptoName = dataUtils.cryptoCurrencyKeys[item];

        let result = await db.getDocument(cryptoName, client);

        if (result == null) {
            await setCoin(dataUtils.cryptoCurrencyKeys[item], client);
        }
    }

    return Promise.resolve(true);
}

async function getChartInfo(ipc, coinsSettings, cryptos, type) {

    let chartInfoObj = {};

    await publicRequests.getChartInfo(coinsSettings, cryptos, type).then(result => {
        chartInfoObj = result;
        return Promise.resolve(true);
    }, err => {
        return Promise.resolve(true);
    });

    if (chartInfoObj) {
        setCryptoCurrenciesChartInfo(chartInfoObj, ipc, coinsSettings, type).then(res => {
            return Promise.resolve(true);
        });
    }

    return Promise.resolve(true);

}

async function getCryptoInfo(ipc, coinsSettings) {
    let cryptoInfoArr = [];
    let cryptoInfoObj = {};

    await publicRequests.getCryptoInfo(coinsSettings).then(result => {
        cryptoInfoArr = result;
        return Promise.resolve(true);
    }, err => {
        return Promise.resolve(true);
    });


    for (let i = 0; i < cryptoInfoArr.length; i++) {
        let cryptoObj = cryptoInfoArr[i][0];
        cryptoInfoObj[cryptoObj.id] = cryptoObj;
    }

    setCryptoCurrenciesInfo(cryptoInfoObj, ipc, coinsSettings).then(res => {
        return Promise.resolve(true);
    });

    return Promise.resolve(true);

}

async function getPrices(ipc, coinsSettings) {

    let cryptoCurrencyPrices = {};
    await requests.getCryptoCurrencyPrices().then(result => {
        cryptoCurrencyPrices = result;
        return Promise.resolve(true);
    }, err => {
        return Promise.resolve(true);
    });


    setCryptoCurrenciesPrice(cryptoCurrencyPrices, ipc, coinsSettings).then(res => {
        return Promise.resolve(true);
    });

    return Promise.resolve(true);

}

async function getMiningFees(ipc, coinsSettings) {

    let miningFees = {};
    await publicRequests.getMiningFees(coinsSettings).then(result => {
        miningFees = result;
        return Promise.resolve(true);
    }, err => {
        return Promise.resolve(true);
    });

    if (miningFees) {
        setCryptoCurrenciesMiningFees(miningFees, ipc, coinsSettings).then(res => {
            return Promise.resolve(true);
        });
    }

    return Promise.resolve(true);

}

async function setCryptoCurrencyInfo(ccKey, ccInfo, client) {

    await db.getDocument(ccKey, client).then(async (result) => {

        if (!result) {
            return Promise.resolve(true);
        }

        result.info.availableSupply = ccInfo['available_supply'];
        result.info.maxSupply = ccInfo['max_supply'] ? ccInfo['max_supply'] : 'Undefined';
        result.info.totalSupply = ccInfo['total_supply'];
        result.info.percentChange7D = ccInfo['percent_change_7d'];
        result.info.percentChange1H = ccInfo['percent_change_1h'];
        result.info.percentChange24H = ccInfo['percent_change_24h'];
        result.info.volumeUSD24H = ccInfo['24h_volume_usd'];
        result.info.marketCapUSD = ccInfo['market_cap_usd'];

        await db.updateDocument(result.name, result, client).then(resultSet => {
            return Promise.resolve(true);
        });
        return Promise.resolve(true);
    });

    return Promise.resolve(true);

}

async function setCryptoCurrenciesInfo(cryptoInfoObj, ipc, coinsSettings) {
    let client = dataUtils.dbNames.global;
    if (cryptoInfoObj && Object.keys(cryptoInfoObj).length > 0) {

        let coinKeys = Object.keys(dataUtils.cryptoCurrencyKeys);

        for (let i = 0; i < coinKeys.length; i++) {

            let key = coinKeys[i];
            let coinName = dataUtils.cryptoCurrencyKeys[key];

            let cryptoInfoKey = dataUtils.chartInfoKeys[key];
            if (coinName === dataUtils.cryptoCurrencyKeys.maid) {
                cryptoInfoKey = cryptoInfoKey.toLowerCase();
            }

            if (coinsSettings[coinName] && cryptoInfoObj[cryptoInfoKey]) {
                await setCryptoCurrencyInfo(coinName, cryptoInfoObj[cryptoInfoKey], client);
            }

        }


        let returnMsg = {
            type: messages.events.cryptoInfoSet
        };

        utils.sendMessage(returnMsg, ipc);

    }
    return Promise.resolve(true);

}

async function setCryptoCurrencyChartInfo(ccKey, ccChartInfo, client, type) {
    await db.getDocument(ccKey, client).then(async (result) => {

        if(type === 'hourly') {
            let hourly = {
                volumeUsd: ccChartInfo.hourly['volume_usd'],
                priceBtc: ccChartInfo.hourly['price_btc'],
                priceUsd: ccChartInfo.hourly['price_usd']
            };
            result.info.graphInfo.hourly = hourly;
        }
        else if(type === 'daily') {
            let daily = {
                volumeUsd: ccChartInfo.daily['volume_usd'],
                priceBtc: ccChartInfo.daily['price_btc'],
                priceUsd: ccChartInfo.daily['price_usd']
            };
            result.info.graphInfo.daily = daily;
        } else if(type === 'monthly') {
            let monthly = {
                volumeUsd: ccChartInfo.monthly['volume_usd'],
                priceBtc: ccChartInfo.monthly['price_btc'],
                priceUsd: ccChartInfo.monthly['price_usd']
            };
            result.info.graphInfo.monthly = monthly;
        }

        await db.updateDocument(result.name, result, client).then(resultSet => {
            return Promise.resolve(true);
        });
        return Promise.resolve(true);
    });
    return Promise.resolve(true);
}

async function setCryptoCurrenciesChartInfo(cryptoInfoChartObj, ipc, coinsSettings, type) {
    let client = dataUtils.dbNames.global;
    let coinKeys = Object.keys(dataUtils.cryptoCurrencyKeys);
    for (let i = 0; i < coinKeys.length; i++) {
        let key = coinKeys[i];
        let coinName = dataUtils.cryptoCurrencyKeys[key];

        let chartInfoKey = dataUtils.chartInfoKeys[key];

        if (coinsSettings[coinName] && cryptoInfoChartObj[chartInfoKey]) {
            await setCryptoCurrencyChartInfo(coinName, cryptoInfoChartObj[chartInfoKey], client, type);
        }
    }

    let returnMsg = {
        type: messages.events.chartInfoSet
    };

    utils.sendMessage(returnMsg, ipc);
    return Promise.resolve(true);

}

async function setCryptoCurrencyPrice(ccKey, ccPrices, client) {

    await db.getDocument(ccKey, client).then(async (result) => {

        if (!result) {
            return Promise.resolve(true);
        }

        result.info.priceUSD = ccPrices.USD;
        result.info.priceBTC = ccPrices.BTC;
        result.info.priceEUR = ccPrices.EUR;

        await db.updateDocument(result.name, result, client).then(resultSet => {
            return Promise.resolve(true);
        });
        return Promise.resolve(true);
    });

    return Promise.resolve(true);

}

async function setCryptoCurrenciesPrice(ccPrices, ipc, coinsSettings) {

    let client = dataUtils.dbNames.global;
    if (ccPrices && ccPrices.BTC) {

        let coinKeys = Object.keys(dataUtils.cryptoCurrencyKeys);

        for (let i = 0; i < coinKeys.length; i++) {
            let coinKey = coinKeys[i];
            let coinName = dataUtils.cryptoCurrencyKeys[coinKey];

            if (coinsSettings[coinName]) {
                let shortName = utils.convertToShortCoinName(coinName);
                await setCryptoCurrencyPrice(coinName, ccPrices[shortName], client);
            }
        }

    }

    let returnMsg = {
        type: messages.events.cryptoPricesSet
    };

    utils.sendMessage(returnMsg, ipc);

    return Promise.resolve(true);

}


async function setCryptoCurrencyMiningFees(ccKey, ccFees, client) {
    await db.getDocument(ccKey, client).then(async (result) => {
        if ((ccKey === dataUtils.cryptoCurrencyKeys.litecoin || ccKey === dataUtils.cryptoCurrencyKeys.dash) && ccFees) {
            if (ccFees[2] && ccFees[2]['10']) {
                result.miningFees.slow = ccFees[2]['10'];
            }

            if (ccFees[1] && ccFees[1]['5']) {
                result.miningFees.medium = ccFees[1]['5'];
            }

            if (ccFees[0] && ccFees[0]['2']) {
                result.miningFees.fast = ccFees[0]['2'];
            }
        }
        else if (ccKey === dataUtils.cryptoCurrencyKeys.bitcoin && ccFees) {
            result.miningFees.slow = ccFees['hourFee'];
            result.miningFees.medium = ccFees['halfHourFee'];
            result.miningFees.fast = ccFees['fastestFee'];
        }
        else if ((ccKey === dataUtils.cryptoCurrencyKeys.ethereum || ccKey === dataUtils.cryptoCurrencyKeys.ethereumClassic) && ccFees) {
            let fee = utils.getGweiFromWei(ccFees.result);

            result.miningFees.slow = new BigNumber(fee).times(0.75).toNumber();
            result.miningFees.medium = fee;
            result.miningFees.fast = new BigNumber(fee).times(1.25).toNumber();
        }
        else if (ccKey === dataUtils.cryptoCurrencyKeys.dogecoin && result.miningFees.slow === 0) {
            result.miningFees.slow = 1;
            result.miningFees.medium = 3;
            result.miningFees.fast = 5;
        } else if (ccKey === dataUtils.cryptoCurrencyKeys.waves && result.miningFees.slow === 0) {
            result.miningFees.slow = 0.001;
            result.miningFees.medium = 0.001;
            result.miningFees.fast = 0.001;
        } else if(ccKey === dataUtils.cryptoCurrencyKeys.bitcoinCash) {
            result.miningFees.slow = 4;
            result.miningFees.medium = 6;
            result.miningFees.fast = 8;
        }

        await db.updateDocument(result.name, result, client).then(resultSet => {
            return Promise.resolve(true);
        });

        return Promise.resolve(true);

    });

    return Promise.resolve(true);
}

async function setCryptoCurrenciesMiningFees(ccFees, ipc, coinsSettings) {
    let client = dataUtils.dbNames.global;
    let keys = Object.keys(dataUtils.cryptoCurrencyKeys);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let coinName = dataUtils.cryptoCurrencyKeys[key];
        if (coinsSettings[coinName]) {

            let fees = {};
            if (coinName === dataUtils.cryptoCurrencyKeys.ripple) {
                continue;
            } else if (coinName === dataUtils.cryptoCurrencyKeys.dogecoin || coinName === dataUtils.cryptoCurrencyKeys.waves) {
                // do nothing, do not change
            }  else {
                fees = ccFees[key];
            }
            await setCryptoCurrencyMiningFees(coinName, fees, client);
        }

    }

    let returnMsg = {
        type: messages.events.cryptoMiningFeesSet
    };

    utils.sendMessage(returnMsg, ipc);
    return Promise.resolve(true);

}

// Algorithm for obtaining chart data from CoinMarketCap Graphs iteratively.
function getChartData(coinsSettings, ipc) {

    if (coinsSettings && ipc.socket) {
        let cryptos = Object.values(dataUtils.chartInfoKeys);
        let types = Object.values(dataUtils.chartDataTypes);
        let k = 20000;
        for(let x = 0; x < types.length; x++) {
            let type = types[x];
            let i = 0;
            let j = 3;
            for (let t = 0; t < 4; t++) {
                setTimeout(() => {
                    getChartInfo(ipc, coinsSettings, cryptos.slice(i, j), type).then();
                    i += 3;
                    j += 3;
                }, (t * k) + (x * 60000));
            }
        }
    }

}


module.exports = {
    getChartData,
    initialSetup,
    getChartInfo,
    getCryptoInfo,
    getPrices,
    getMiningFees
};
