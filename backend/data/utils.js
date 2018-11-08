// All supported coins - full and explorer support
let cryptoCurrencyKeys = {
  bitcoin: "Bitcoin",
  bitcoinCash: "BitcoinCash",
  litecoin: "Litecoin",
  dogecoin: "Dogecoin",
  dash: "Dash",
  ethereum: "Ethereum",
  ethereumClassic: "EthereumClassic",
  ripple: "Ripple",
  waves: "Waves",
  counterparty: "Counterparty",
  omni: "Omni",
  maid: "Maid"
};

// Only fully supported coins
let supportedCoins = {
  bitcoin: "Bitcoin",
  bitcoinCash: "BitcoinCash",
  litecoin: "Litecoin",
  dogecoin: "Dogecoin",
  dash: "Dash",
  ethereum: "Ethereum",
  ethereumClassic: "EthereumClassic",
  ripple: "Ripple",
  waves: "Waves"
};

let chartInfoKeys = {
  bitcoin: "bitcoin",
  bitcoinCash: "bitcoin-cash",
  litecoin: "litecoin",
  dogecoin: "dogecoin",
  dash: "dash",
  ethereum: "ethereum",
  ethereumClassic: "ethereum-classic",
  ripple: "ripple",
  waves: "waves",
  counterparty: "counterparty",
  omni: "omni",
  maid: "maidSafeCoin"
};

let chartDataTypes = {
  hourly: "hourly",
  daily: "daily",
  monthly: "monthly"
};

let userInfo = {
  name: "userInfo"
};

let dataKeys = {
  privateKeyString: "privateKeyString",
  privateKeyBuffer: "privateKeyBuffer",
  wavesKeyPair: "wavesKeyPair",
  rippleKeyPair: "rippleKeyPair"
};

let cryptoDivisionFactors = {
  satoshis: 100000000,
  wavelets: 100000000,
  drops: 1000000,
  wei: 1000000000000000000,
  gwei: 1000000000
};

let coinType = {
  Bitcoin: 0,
  BitcoinCash: 145,
  Litecoin: 2,
  Dogecoin: 3,
  Dash: 5,
  Counterparty: 9,
  Ripple: 144,
  Waves: 150,
  Omnilayer: 169,
  Ether: 60,
  EtherClassic: 61
};

let addressObj = {
  purpose: 44,
  coinType: coinType.Bitcoin,
  account: 0,
  change: 0
};

let coinDataTypes = {
  internal: "internal",
  change: "change"
};

let networkConfig = {
  dogecoin: {
    message: "\x19Dogecoin Signed Message:\n"
  },
  dash: {
    message: "\x19Dash Signed Message:\n"
  }
};

// temporary
let wavesNodeUrl = 'http://5.189.136.6:6869';

// temporary
let etcProviderNames = {
	etcchain: 'etcchain',
	gasTracker: 'gasTracker'
};

let apiSettings = {
	apiFailNumTries: 10
};

let dbHelper = {
	coinName: 'name',
	type: 'type',
	userDatabase: 'userDatabase',
	username: 'username',
	userId: 'userId',
	mnemonic: 'mnemonic',
};

let coinSettings = {
	gasLimit: 300000,
	omniAverageTransactionSizeB: 400,
	counterpartyAverageTransactionSizeB: 250,
	toSatoshisPerByteDivisor: 1000,
	dogeFeeDivisor: 250,
	litecoinFeeDivisor: 250,
	omniAssetId: 'OMNI',
	maidAssetId: 'MAID',
	wavesAssetId: 'WAVES',
	counterpartyAssetId: 'XCP',
	omniPropertyId: 1,
	maidPropertyId: 3,
	omniPublicApiFunct: 'serverCallOmniPublicApi'
};

let apiRefreshRates = {
	'1': 180000,
	'2': 600000,
	'3': 1200000,
	'4': 1800000,
	'5': 600000
};

let dbNames = {
	global: 'global',
	user: 'user',
	private: 'private'
};



let serviceStings = {
	balance: 'balance',
	getUnitsFromSatoshis: 'getUnitsFromSatoshis',
	finalBalance: 'final_balance',
	success: 'success',
	generateAddressNumber: 'number',
	generateAddressWif: 'WIF',
	address: 'address',
	addressPrivateKey: 'privateKey',
	addressPublicKey: 'publicKey',
	number: 'number',
	getWavesFromWavelets: 'getWavesFromWavelets',
	accountData: 'account_data',
	keyPairs: 'keyPairs'
 };

module.exports = {
	cryptoCurrencyKeys,
	supportedCoins,
	cryptoDivisionFactors,
	coinType,
	addressObj,
	coinDataTypes,
	networkConfig,
	wavesNodeUrl,
	etcProviderNames,
	apiSettings,
	coinSettings,
	apiRefreshRates,
	dbNames,
	dbHelper,
    userInfo,
	dataKeys,
	chartInfoKeys,
	chartDataTypes,
	serviceStings
};