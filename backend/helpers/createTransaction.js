let bitcoin = require('bitcoinjs-lib');
let bitcoinCash = require('bitcoinjs-lib-cash');
let coinselect = require('coinselect');
let coininfo = require('coininfo');
let utils = require('./utils');
let userService = require('../services/user');
let requests = require('../providers/requests');
let privateData = require('../data/private');
let errorMessages = require('../data/messages');
let ethereumTx = require('ethereumjs-tx');
let dataUtils = require('../data/utils');
let WavesAPI = require('../lib/waves-api');
let bchaddr = require('bchaddrjs');
let wavesInstance;

function parseSentTransaction(tx, receiveAddress, amount, transferFee, fromAddress) {

	return {
		transactionHash: tx.txid,
		transactionDate: Date.now().toString(),
		confirmations: 0,
		from: fromAddress,
		to: receiveAddress,
		fees: transferFee,
		amount: amount
	};

}

function parseSentTransactionEthereum(txid, receiveAddress, amount, transferFee, sendingAddress) {

	return {
		transactionHash: txid,
		transactionDate: Date.now().toString(),
		confirmations: 0,
		from: sendingAddress,
		to: receiveAddress,
		fees: transferFee,
		amount: amount
	};

}

async function broadcastUTXOTransaction(signedTransaction, url) {

	let tx;
	let sendRawTransactionBody = { 'rawtx': signedTransaction };

	await requests.postRequest(sendRawTransactionBody, url).then(transactionResult => {
		tx = JSON.parse(transactionResult);
		return Promise.resolve(true);
	}, err => {
		return Promise.resolve(true);
	});

	return Promise.resolve(tx);
}


async function getUnspentTransactionOutputs(addresses, url, coinName, pName) {

	let requestKey = "addresses";

	if(coinName === dataUtils.supportedCoins.bitcoinCash || pName !== 'overhold') {
        requestKey = "addrs";
	}

	// workaround for setting custom key in javascript object
	let getUtxosBody = {};
	getUtxosBody[requestKey] = addresses;

	let unspentOutputsList;
	await requests.postRequest(getUtxosBody, url).then(result => {
		unspentOutputsList = JSON.parse(result);
		return Promise.resolve(true);
	}, err => {
		return Promise.resolve(true);
	});
	return {
		unspentOutputsList
	};

}

async function obtainEthereumTransactionCount(address, offlineNonce, url) {
	let nonce;

	let successCallback = (result) => {
		let resultJSON = JSON.parse(result);
		nonce = resultJSON.result;
		return Promise.resolve(true);
	};

	let errorCallback = (error) => {
		nonce = new BigNumber(offlineNonce).toString(16);
		nonce = `0x${nonce}`;
		return Promise.resolve(true);
	};

	await requests.getTransactionCountEthereum(address, url).then(successCallback, errorCallback);

	return Promise.resolve(nonce);
}

function signEthereumTransaction(transactionInfo, nonce, privateKey, coinName) {
	let txParams = {
		nonce: nonce,
		gasPrice: transactionInfo.gasPriceHex,
		gasLimit: transactionInfo.gasLimitHex,
		to: transactionInfo.addressTo,
		from: transactionInfo.addressFrom.address,
		value: transactionInfo.valueHex,
		data: ''
	};

	txParams.chainId = coinName === dataUtils.cryptoCurrencyKeys.ethereum ? 1 : 61;

	const tx = new ethereumTx(txParams);

	tx.sign(privateKey);
	let serializedTx = tx.serialize();
	serializedTx = `0x${serializedTx.toString('hex')}`;

	return serializedTx;
}

async function broadcastEthereumTransaction(serializedTx, url) {

	let txid;
	let broadcastError;
	let successCallback = (result) => {
		let resultJSON = JSON.parse(result);
		if (!resultJSON.error && resultJSON.result) {
			txid = resultJSON.result;
		} else if (resultJSON && resultJSON.error) {
			broadcastError = errorMessages.transactionErrors.transactionBroadcastError;
		}
		return Promise.resolve(true);
	};

	let errorCallback = (error) => {
		broadcastError = errorMessages.transactionErrors.apiNotAvailable;
		return Promise.resolve(true);
	};

	await requests.sendSignedTransactionEthereum(serializedTx, url).then(successCallback, errorCallback);

	return Promise.resolve({ txid, broadcastError });

}

async function createEthereumTransaction(transactionInfo, url, coinName) {

	try {
		let nonce = await obtainEthereumTransactionCount(transactionInfo.addressFrom.address, transactionInfo.addressFrom.nonce, url);
		checkForError(nonce, errorMessages.transactionErrors.transactionSigningError);
		let privateKey = await getSinglePrivateKey(transactionInfo.addressFrom.address, coinName, privateData.dataKeys.privateKeyBuffer);
		checkForError(privateKey, errorMessages.transactionErrors.sendingAddressPrivateKeyError);
		let serializedTx = signEthereumTransaction(transactionInfo, nonce, privateKey, coinName);
		checkForError(serializedTx, errorMessages.transactionErrors.transactionSigningError);
		let { txid, broadcastError } = await broadcastEthereumTransaction(serializedTx, url);
		checkForError(txid, broadcastError);
		return Promise.resolve(txid);
	} catch (error) {
		return Promise.reject(error.message);
	}
}

async function createWavesTransaction(transferData, keyPair, broadcastFn) {

	try {
		wavesInstance = WavesAPI.create(WavesAPI.MAINNET_CONFIG);
		let transactionData;
		await wavesInstance.API.Node.transactions.broadcast('transfer', transferData, keyPair).then(transactionResult => {
			transactionData = JSON.parse(transactionResult.body);
			return Promise.resolve(true);
		}, err => {
			return Promise.resolve(true);
		});
		checkForError(transactionData, errorMessages.transactionErrors.transactionSigningError);

		let txid;
		let errorMessage;
		await broadcastFn(transactionData).then(result => {
			let resultJSON = JSON.parse(result);
			if (resultJSON && resultJSON.id) {
				txid = resultJSON.id;
			} else if (resultJSON && resultJSON.error) {
				errorMessage = resultJSON.message;
			}
			return Promise.resolve(true);
		}, err => {
			errorMessage = errorMessages.transactionErrors.apiNotAvailable;
			return Promise.resolve(true);
		});
		checkForError(txid, errorMessage);

		return Promise.resolve(txid);
	} catch (error) {
		return Promise.reject(error.message);
	}
}

async function getSinglePrivateKey(address, coinName, key) {
	let privateKey;

	let privateKeyAccessor = key ? key : privateData.dataKeys.privateKeyString;
	await userService.getPrivateAddressData(address, coinName, dataUtils.coinDataTypes.internal, privateKeyAccessor).then(result => {
		privateKey = result;
		return Promise.resolve(true);
	}, err => {
		return Promise.resolve(true);
	});

	return privateKey;
}

function checkForError(fieldToCheck, errorMessage) {
	if (!fieldToCheck) {
		let reason = errorMessage ? errorMessage : errorMessages.transactionErrors.apiNotAvailable;
		throw new Error(reason);
	}
}


function getInputsAndOutputs(receiveAddress, amount, feeRate, utxos) {
	let targets = [
		{
			address: receiveAddress,
			value: amount
		}
	];

	let feeRateInput = feeRate;
	feeRateInput = Math.round(feeRateInput);
	let { inputs, outputs, feeReturn } = coinselect(utxos, targets, feeRateInput);

	let inputsOutputsError;
	if (!inputs) {
		inputsOutputsError = errorMessages.transactionErrors.inputsError;
	}

	if (!outputs) {
		inputsOutputsError = errorMessages.transactionErrors.outputsError;
	}

	return { inputs, outputs, inputsOutputsError };

}

function processUnspentTransactionOutputs(data, coinName) {

	for (let i = 0; i < data.length; i++) {
		if (coinName === dataUtils.cryptoCurrencyKeys.dogecoin) {
			data[i].value = utils.convertToSatoshis(data[i].amount);
		} else {
			data[i].value = data[i].satoshis;
		}
		data[i].txId = data[i].txid;
		delete data[i].satoshis;
		delete data[i].txid;
	}

	return data;
}

async function generateUTXOBasedTransaction(inputs, outputs, coinName, network, generateAddress) {

	let txb = new bitcoin.TransactionBuilder(network);

	let inputTotal = 0;
	let outputTotal = 0;

	inputs.forEach(input => {
		txb.addInput(input.txId, input.vout);
		inputTotal += input.value;
	});

	for (let i = 0; i < outputs.length; i++) {
		let output = outputs[i];
		if (!output.address) {
			let address = await generateAddress(coinName, dataUtils.coinDataTypes.change);
			if (address) {
				output.address = address.address;
			} else {
				output.address = inputs[0].address;
			}
		}
		outputTotal += output.value;
		txb.addOutput(output.address, output.value);
	}

	let privateKeyPromises = [];

	inputs.forEach(input => {
		privateKeyPromises.push(userService.getPrivateAddressData(input.address, coinName, dataUtils.coinDataTypes.internal, privateData.dataKeys.privateKeyString));
	});

	let privateKeys;
	await Promise.all(privateKeyPromises).then(result => {
		privateKeys = result;
		return Promise.resolve(true);
	}, err => {
		return Promise.resolve(true);
	});

	let errorMessage;

	if (!privateKeys) {
		errorMessage = errorMessages.transactionErrors.sendingAddressPrivateKeyError;
		return { errorMessage };
	}

	let vin = 0;
	try {

		privateKeys.forEach((pKey) => {
			txb.sign(vin, bitcoin.ECPair.fromWIF(pKey, network));
			vin++;
		});

		let hex = txb.build().toHex();
		let addressFrom = inputs[0].address;
		let transferFee = inputTotal - outputTotal;

		return { hex, transferFee, addressFrom, errorMessage };

	} catch (error) {
		errorMessage = errorMessages.transactionErrors.transactionSigningError;
		return { errorMessage };
	}


}


async function generateBitcoinCashTransaction(inputs, outputs, coinName, network, generateAddress) {

    let txb = new bitcoinCash.TransactionBuilder(network);

    let inputTotal = 0;
    let outputTotal = 0;

    inputs.forEach(input => {
        txb.addInput(input.txId, input.vout);
        inputTotal += input.value;
    });

    for (let i = 0; i < outputs.length; i++) {
        let output = outputs[i];
        if (!output.address) {
            let address = await generateAddress(coinName, dataUtils.coinDataTypes.change);
            if (address) {
                output.address = address.address;
            } else {
                output.address = inputs[0].address;
            }
        }
        outputTotal += output.value;
        txb.addOutput(output.address, output.value);
    }

    let privateKeyPromises = [];

	txb.enableBitcoinCash(true);
	txb.setVersion(2);
    inputs.forEach(input => {
        input.address = bchaddr.toLegacyAddress(input.address);
        privateKeyPromises.push(userService.getPrivateAddressData(input.address, coinName, dataUtils.coinDataTypes.change, privateData.dataKeys.privateKeyString));
    });

    let privateKeys;
    await Promise.all(privateKeyPromises).then(result => {
        privateKeys = result;
        return Promise.resolve(true);
    }, err => {
        return Promise.resolve(true);
    });

    let errorMessage;

    if (!privateKeys) {
        errorMessage = errorMessages.transactionErrors.sendingAddressPrivateKeyError;
        return { errorMessage };
    }

    try {
		let hashType = bitcoinCash.Transaction.SIGHASH_ALL | bitcoinCash.Transaction.SIGHASH_BITCOINCASHBIP143;
		for(let i = 0; i < privateKeys.length; i++) {
			let pKey = privateKeys[i];
			txb.sign(i, bitcoinCash.ECPair.fromWIF(pKey, network), null, hashType, inputs[i].value);
		}
        let hex = txb.build().toHex();
        let addressFrom = inputs[0].address;
        let transferFee = inputTotal - outputTotal;
        return { hex, transferFee, addressFrom, errorMessage };
    } catch (error) {
        errorMessage = errorMessages.transactionErrors.transactionSigningError;
        return { errorMessage };
    }

}

function getNetwork(coinName) {

	switch (coinName) {
	case dataUtils.cryptoCurrencyKeys.bitcoin: return bitcoin.networks.bitcoin;
	case dataUtils.cryptoCurrencyKeys.bitcoinCash: return bitcoinCash.networks.bitcoin;
	case dataUtils.cryptoCurrencyKeys.litecoin: return bitcoin.networks.litecoin;
	case dataUtils.cryptoCurrencyKeys.dogecoin: {
		let dogecoin = coininfo.dogecoin.main.toBitcoinJS();
		dogecoin.messagePrefix = dataUtils.networkConfig.dogecoin.message;
		return dogecoin;
	}
	case dataUtils.cryptoCurrencyKeys.dash: {
		let dash = coininfo.dash.main.toBitcoinJS();
		dash.messagePrefix = dataUtils.networkConfig.dash.message;
		return dash;
	}
	default: return undefined;
	}
}

// Bitcoin, BitcoinCash Litecoin, Dogecoin, Dash.
async function createUTXOBasedTransaction(addresses, receiveAddress, amount, feeRate, coinName, urls, generateAddress, pName) {

	try {
		let { unspentOutputsList } = await getUnspentTransactionOutputs(addresses, urls.utxo, coinName, pName);
		checkForError(unspentOutputsList, errorMessages.transactionErrors.apiNotAvailable);

		let utxos = processUnspentTransactionOutputs(unspentOutputsList, coinName);
		checkForError(utxos, errorMessages.transactionErrors.utxosProcessingError);

		let { inputs, outputs, inputsOutputsError } = getInputsAndOutputs(receiveAddress, amount, feeRate, utxos);
		checkForError(inputs, inputsOutputsError);
		checkForError(outputs, inputsOutputsError);

		let network = getNetwork(coinName);
		checkForError(network, errorMessages.transactionErrors.cryptoNetworkError);

		let { hex, transferFee, addressFrom, errorMessage } = coinName === dataUtils.supportedCoins.bitcoinCash ? await generateBitcoinCashTransaction(inputs, outputs, coinName, network, generateAddress) : await generateUTXOBasedTransaction(inputs, outputs, coinName, network, generateAddress);
		checkForError(hex, errorMessage);

		let broadcastedTransaction = await broadcastUTXOTransaction(hex, urls.broadcastTransaction);
		checkForError(broadcastedTransaction, errorMessages.transactionErrors.apiNotAvailable);

		return Promise.resolve({ tx: broadcastedTransaction, transferFee: transferFee, addressFrom: addressFrom });
	} catch (error) {
		return Promise.reject(error.message);
	}
}

module.exports = {
	parseSentTransaction,
	parseSentTransactionEthereum,
	getSinglePrivateKey,
	createWavesTransaction,
	createEthereumTransaction,
	createUTXOBasedTransaction
};
