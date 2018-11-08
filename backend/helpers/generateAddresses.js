let bip39 = require('bip39');
let CryptoJS = require('crypto-js');
let privateData = require('../data/private');
let db = require('../db/db');
let dataUtils = require('../data/utils');
let userService = require('../services/user');
let bitcoinService = require('../services/bitcoin/index');
let litecoinService = require('../services/litecoin/index');
let bitcoinCashService = require('../services/bitcoinCash/index');
let dashService = require('../services/dash/index');
let dogecoinService = require('../services/dogecoin/index');
let rippleService = require('../services/ripple/index');
let ethereumService = require('../services/ethereum/index');
let ethereumClassicService = require('../services/ethereumClassic/index');
let wavesService = require('../services/waves/index');

async function getMnemonic(coinName) {
	let mnemonic = await userService.getMnemonic();

	if (coinName === dataUtils.cryptoCurrencyKeys.waves) {
		mnemonic = decryptMnemonicWaves(mnemonic, privateData.secretKey);
	} else {
		mnemonic = decryptMnemonic(mnemonic, privateData.secretKey);
	}

	return mnemonic;
}

function decryptMnemonic(mnemonic, secretKey) {
	let b64 = CryptoJS.enc.Hex.parse(mnemonic);
	var bytes = b64.toString(CryptoJS.enc.Base64);
	var dec = CryptoJS.AES.decrypt(bytes, secretKey);
	return bip39.mnemonicToSeed(dec.toString(CryptoJS.enc.Utf8));
}

function decryptMnemonicWaves(mnemonic, secretKey) {
	let b64 = CryptoJS.enc.Hex.parse(mnemonic);
	var bytes = b64.toString(CryptoJS.enc.Base64);
	var dec = CryptoJS.AES.decrypt(bytes, secretKey);
	return dec.toString(CryptoJS.enc.Utf8);
}

async function generateAddressesHelper(coinType, numAddresses, userCoin, type) {
	let coinName = userCoin.name;
	let seed = await getMnemonic(coinName);

	let derivationPath;
	let lastAddressIndex;
	let addresses;
	let pubAddresses;

	let addressIndex = userCoin[type].addressIndex;
	let isChange = type === dataUtils.coinDataTypes.change ? 1 : 0;

	let result;


	if (coinType === dataUtils.coinType.Bitcoin) {
		result = bitcoinService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.BitcoinCash) {
        result = bitcoinCashService.generateAddresses(numAddresses, seed, addressIndex, isChange);
    }else if (coinType === dataUtils.coinType.Litecoin) {
		result = litecoinService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.Dash) {
		result = dashService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.Dogecoin) {
		result = dogecoinService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.Ripple) {
		result = rippleService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.Ether) {
		result = ethereumService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.EtherClassic) {
		result = ethereumClassicService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	} else if (coinType === dataUtils.coinType.Waves) {
		result = wavesService.generateAddresses(numAddresses, seed, addressIndex, isChange);
	}

	addresses = result.addresses;
	pubAddresses = result.pubAddresses;
	derivationPath = coinType === dataUtils.coinType.Waves ? '' : result.derivationPath;
	lastAddressIndex = result.lastAddressIndex;

	return {
		addressIndex: lastAddressIndex,
		pubAddresses: pubAddresses,
		addresses: addresses,
		derivationPath
	};
}


async function generateNewAddress(coinName, type) {

    let privateClient = dataUtils.dbNames.private;
    let publicClient = dataUtils.dbNames.user;
    let privateCoin;
    let publicCoin;

	await db.getDocument(coinName, privateClient).then(result => {
        privateCoin = result;
		return Promise.resolve(true);
	});

    await db.getDocument(coinName, publicClient).then(result => {
        publicCoin = result;
        return Promise.resolve(true);
    });

	let key = coinName;
	if (coinName === dataUtils.cryptoCurrencyKeys.ethereum) {
		key = 'Ether';
	} else if (coinName === dataUtils.cryptoCurrencyKeys.ethereumClassic) {
		key = 'EtherClassic';
	}

	let resultObj;

	try {
		resultObj = await generateAddressesHelper(dataUtils.coinType[key], 1, privateCoin, type);
        privateCoin[type].addressIndex = resultObj.addressIndex;

		if (resultObj.addresses[0].WIF) {
			resultObj.pubAddresses[0].WIF = resultObj.addresses[0].WIF;
		}

		if (resultObj.addresses[0].publicKey) {
			resultObj.pubAddresses[0].publicKey = resultObj.addresses[0].publicKey;
		}

		if (resultObj.addresses[0].privateKey) {
			resultObj.pubAddresses[0].privateKey = resultObj.addresses[0].privateKey;
		}

		if (resultObj.addresses[0].keyPairs) {
			resultObj.pubAddresses[0].keyPairs = resultObj.addresses[0].keyPairs;
		}

		privateCoin[type].addresses.push(resultObj.addresses[0]);
        publicCoin[type].addresses.push(resultObj.pubAddresses[0]);


		if (dataUtils.coinType[key] !== dataUtils.coinType.Waves) {
			privateCoin[type].derivationPath = resultObj.derivationPath;
		}

	} catch (err) {
		return null;
	}

	if (resultObj) {
		await db.updateDocument(privateCoin.name, privateCoin, privateClient).then(result => {
			return Promise.resolve(true);
		});
        await db.updateDocument(publicCoin.name, publicCoin, publicClient).then(result => {
            return Promise.resolve(true);
        });

		return resultObj.pubAddresses[0];
	} else {
		return null;
	}
}

module.exports = {
	generateAddressesHelper,
	generateNewAddress
};