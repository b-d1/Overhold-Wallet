let WavesAPI = require('@waves/waves-api');
let dataUtils = require('../../data/utils');
let templates = require('../../data/templates');
let errorMessages = require('../../data/messages').generalErrors;

function generateAddresses(num, seed, addressIndex, change) {
	if (!seed) {
		return new Error(errorMessages.invalidInput);
	}

	if (typeof (change) !== dataUtils.serviceStings.number) {
		return new Error(errorMessages.invalidInput);
	}

	if (!num || typeof (num) !== dataUtils.serviceStings.number) {
		return new Error(errorMessages.invalidNumberAddresses);
	}

	if (typeof (addressIndex) !== dataUtils.serviceStings.number) {
		return new Error(errorMessages.invalidAddressIndex);
	}
	
	let addresses = [];
	let pubAddresses = [];
  
	WavesAPI.MAINNET_CONFIG.nodeAddress = dataUtils.wavesNodeUrl;
	let wavesInstance = WavesAPI.create(WavesAPI.MAINNET_CONFIG);
	let lastAddressIndex = addressIndex;
  
	for (let i = 0; i < num; i++) {
		wavesInstance.constants.INITIAL_NONCE = lastAddressIndex++;

		let keyPair = wavesInstance.Seed.fromExistingPhrase(seed);
		let address = keyPair.address;
		addresses.push({ 'address': address, 'privateKey': keyPair.keyPair.privateKey, 'publicKey': keyPair.keyPair.publicKey });
        
		let addressBalance = Object.assign({}, templates.AddressBalance);
		addressBalance.address = address;
		pubAddresses.push(addressBalance);
	}
  
	return {
		addresses,
		pubAddresses,
		lastAddressIndex,
	};
}
  
module.exports = {
	generateAddresses
};
