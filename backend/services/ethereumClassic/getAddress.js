let hdkey = require('ethereumjs-wallet/hdkey');
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
  
	let addressObj = Object.assign({}, dataUtils.addressObj);
	addressObj.coinType = dataUtils.coinType.EtherClassic;
	addressObj.change = change;
  
	let root = new hdkey.fromMasterSeed(seed);
	let lastAddressIndex = addressIndex;
  
	let defaultPath = `m/${addressObj.purpose}'/${addressObj.coinType}'/${addressObj.account}'/${addressObj.change}/`;

	let path;
  
	for (let i = 0; i < num; i++) {
		path = defaultPath + (lastAddressIndex++);
		let node = root.derivePath(path);
  
		let wallet = node.getWallet();
		let address = wallet.getAddressString();

		let buffArr = [];
		let privateKey = wallet.getPrivateKey();

		for(const value of privateKey.values()) {
			buffArr.push(value);
		}
      
		addresses.push({ 'address': address, 'privateKey': buffArr, 'privateKeyString': wallet.getPrivateKeyString() });
      
		let addressBalance = Object.assign({}, templates.AddressBalance);
		addressBalance.address = address;
		pubAddresses.push(addressBalance);
	}
  
	return {
		addresses,
		pubAddresses,
		lastAddressIndex,
		derivationPath: path,
	};
}
  
module.exports = {
	generateAddresses
};