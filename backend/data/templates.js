let GraphData = {
  volumeUsd: [[0]],
  priceBtc: [[0]],
  priceUsd: [[0]]
};

let CoinInfo = {
  priceUSD: "",
  priceBTC: "",
  priceEUR: "",
  volumeUSD24H: "",
  marketCapUSD: "",
  availableSupply: "",
  maxSupply: "",
  totalSupply: "",
  percentChange1H: "",
  percentChange24H: "",
  percentChange7D: "",
  graphInfo: {
    hourly: GraphData,
    daily: GraphData,
    monthly: GraphData
  }
};

let Fees = {
  slow: 0,
  medium: 0,
  fast: 0
};

let Coin = {
  name: "",
  info: CoinInfo,
  miningFees: Fees,
  lastChartUpdate: 0
};

let Transaction = {
  txid: "",
  timestamp: "",
  confirmations: 0,
  from: "",
  to: "",
  fees: 0,
  amount: 0
};

let AddressBalance = {
  address: "",
  balance: 0
};

let DataType = {
  addresses: [],
  transactions: [],
  balance: 0
};

let UserCoin = {
  name: "",
  isDisabled: false,
  internal: DataType,
  change: DataType
};

let KeyPair = {
  privateKey: "",
  publicKey: "",
  address: ""
};

let AddressObject = {
  address: ""
};

let UserPrivateInfo = {
  username: "",
  password: "",
  mnemonic: "",
  pin: ""
};

let PrivateDataTyoe = {
  addresses: [],
  derivationPath: "",
  addressIndex: 0
};

let CoinPrivateInfo = {
  internal: PrivateDataTyoe,
  change: PrivateDataTyoe,
  name: ""
};

module.exports = {
  GraphData,
  CoinInfo,
  Fees,
  Coin,
  Transaction,
  AddressBalance,
  DataType,
  UserCoin,
  KeyPair,
  AddressObject,
  UserPrivateInfo,
  CoinPrivateInfo
};
