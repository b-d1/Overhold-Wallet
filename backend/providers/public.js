let requests = require('./requests');
let ethereum = require('./ethereum');
let ethereumClassic = require('./ethereumClassic');


let utils = require('../helpers/utils');
const dataUtils = require('../data/utils');

function getCryptoInfo(coinsSettings) {
	let cryptos = Object.values(dataUtils.chartInfoKeys).map(cryptoKey => cryptoKey.toLowerCase());

	let promisesArr = [];

	for (let i = 0; i < cryptos.length; i++) {
		let coinName = cryptos[i];

		if (coinsSettings[utils.convertChartApiToGlobalCoinConvention(coinName)]) {
			promisesArr.push(requests.getCryptoInfoRequest(coinName));
		}
	}

	return Promise.all(promisesArr);

}

async function getChartInfo(coinsSettings, cryptos, type ) {

	let times = getHourlyDailyMonthlyTimes();

	let resultObjGlob = {};

	for (let i = 0; i < cryptos.length; i++) {
		if (coinsSettings[utils.convertChartApiToGlobalCoinConvention(cryptos[i])]) {
			let promisesArr = [];
			if(type === dataUtils.chartDataTypes.hourly) {
                promisesArr.push(requests.getCryptoChartInfoRequest(cryptos[i], times.ts1Hourly, times.ts2Hourly));
            } else if(type === dataUtils.chartDataTypes.daily) {
                promisesArr.push(requests.getCryptoChartInfoRequest(cryptos[i], times.ts1Daily, times.ts2Daily));
            } else if(type === dataUtils.chartDataTypes.monthly) {
                promisesArr.push(requests.getCryptoChartInfoRequest(cryptos[i], times.ts1Monthly, times.ts2Monthly));
            }
			let resultObj = {
				hourly: {},
				daily: {},
				monthly: {}
			};
			await Promise.all(promisesArr).then(result => {
				resultObj[type] = result[0];
                return Promise.resolve(true);
			}, err => {
                return Promise.resolve(true);
			});
			resultObjGlob[cryptos[i]] = resultObj;
		}

	}

	return Promise.resolve(resultObjGlob);

}

async function getMiningFees(coinsSettings) {

	let miningFeesObj = {};

	if (coinsSettings.Litecoin) {
		await requests.getMiningFeesClusterRequest('litecoin').then(result => {
		    miningFeesObj['litecoin'] = result;
			return Promise.resolve(true);
		}, err => {
            return Promise.resolve(true);
		});
	}

	if (coinsSettings.Dash) {
		await requests.getMiningFeesClusterRequest('dash').then(result => {
            miningFeesObj['dash'] = result;
			return Promise.resolve(true);
		}, err => {
            return Promise.resolve(true);
		});
	}

	if (coinsSettings.Bitcoin) {
		await requests.getBitcoinMiningFeesRequest().then(result => {
            miningFeesObj['bitcoin'] = result;
			return Promise.resolve(true);
		}, err => {
            return Promise.resolve(true);
		});
	}

	if (coinsSettings.Ethereum) {
		await requests.getEthereumGasPricesRequest(ethereum.overhold.general).then(result => {
            miningFeesObj['ethereum'] = JSON.parse(result);
			return Promise.resolve(true);
		}, err => {
            return Promise.resolve(true);
		});
	}

    if (coinsSettings.EthereumClassic) {
        await requests.getEthereumGasPricesRequest(ethereumClassic.overhold.general).then(result => {
            miningFeesObj['ethereumClassic'] = JSON.parse(result);
            return Promise.resolve(true);
        }, err => {
            return Promise.resolve(true);
        });
    }

    return Promise.resolve(miningFeesObj);

}

function getHourlyDailyMonthlyTimes() {
	let ts2Hourly = Math.floor(new Date().getTime() / 1000);
	let ts1Hourly = ts2Hourly - (60 * 60);
	let ts2HourlySt = ts2Hourly.toString() + '000';
	let ts1HourlySt = ts1Hourly.toString() + '000';

	let ts2Daily = Math.floor(new Date().getTime() / 1000);
	let ts1Daily = ts2Daily - (24 * 60 * 60);
	let ts2DailySt = ts2Daily.toString() + '000';
	let ts1DailySt = ts1Daily.toString() + '000';

	let ts2Monthly = Math.floor(new Date().getTime() / 1000);
	let ts1Monthly = ts2Monthly - (30 * 24 * 60 * 60);
	let ts2MonthlySt = ts2Monthly.toString() + '000';
	let ts1MonthlySt = ts1Monthly.toString() + '000';

	return {
		ts1Hourly: ts1HourlySt,
		ts2Hourly: ts2HourlySt,
		ts1Daily: ts1DailySt,
		ts2Daily: ts2DailySt,
		ts1Monthly: ts1MonthlySt,
		ts2Monthly: ts2MonthlySt
	};
}



module.exports = {
	getMiningFees,
	getChartInfo,
	getCryptoInfo
};