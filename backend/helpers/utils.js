const BigNumber = require("bignumber.js");
let WavesAPI = require("@waves/waves-api");
const CryptoJS = require("crypto-js");
const errorMessages = require("../data/messages").generalErrors;
const utils = require("../data/utils");
const db = require("../db/db");
let requestP = require("request-promise");
let bchaddr = require("bchaddrjs");

let wavesInstance;
let rippleTransactionTimeAddition = 946684800;

function encryptMnemonic(mnemonic, secretKey) {
  if (!mnemonic || typeof mnemonic !== "string") {
    throw new Error(errorMessages.invalidMnemonic);
  }

  if (!secretKey || typeof secretKey !== "string") {
    throw new Error(errorMessages.invalidSecretKey);
  }

  let enc = CryptoJS.AES.encrypt(mnemonic, secretKey).toString();
  let b64 = CryptoJS.enc.Base64.parse(enc);
  return b64.toString(CryptoJS.enc.Hex);
}

function hashPhrase(phrase) {
  return CryptoJS.SHA256(phrase).toString();
}

function getUnitsFromSatoshis(satoshi) {
  if (
    satoshi === null ||
    satoshi === undefined ||
    (typeof satoshi !== "string" && typeof satoshi !== "number")
  ) {
    throw new Error(errorMessages.invalidSatoshi);
  }

  if (typeof satoshi === "string" && isNaN(satoshi)) {
    throw new Error(errorMessages.invalidSatoshi);
  }

  let satoshiBN = new BigNumber(satoshi);
  return satoshiBN.dividedBy(utils.cryptoDivisionFactors.satoshis).toNumber();
}

function getAddresses(addressObjArr) {
  let addresses = [];

  for (let i = 0; i < addressObjArr.length; i++) {
    if (addressObjArr[i].address) {
      addresses.push(addressObjArr[i].address);
    }
  }

  return addresses;
}

function getEtherFromWei(wei) {
  if (
    wei === undefined ||
    wei === null ||
    (typeof wei !== "string" && typeof wei !== "number")
  ) {
    throw new Error(errorMessages.invalidWei);
  }

  if (typeof wei === "string" && isNaN(wei)) {
    throw new Error(errorMessages.invalidWei);
  }

  let number = new BigNumber(wei);

  return number.dividedBy(utils.cryptoDivisionFactors.wei).toNumber();
}

function getGweiFromWei(wei) {
  if (
    wei === undefined ||
    wei === null ||
    (typeof wei !== "string" && typeof wei !== "number")
  ) {
    throw new Error(errorMessages.invalidWei);
  }

  if (typeof wei === "string" && isNaN(wei)) {
    throw new Error(errorMessages.invalidWei);
  }

  let number = new BigNumber(wei);

  return number.dividedBy(utils.cryptoDivisionFactors.gwei).toNumber();
}

function getWeiFromGwei(gwei) {
  if (
    gwei === undefined ||
    gwei === null ||
    (typeof gwei !== "string" && typeof gwei !== "number")
  ) {
    throw new Error(errorMessages.invalidGWei);
  }

  if (typeof gwei === "string" && isNaN(gwei)) {
    throw new Error(errorMessages.invalidGWei);
  }

  let number = new BigNumber(gwei);

  return number.times(utils.cryptoDivisionFactors.gwei).toNumber();
}

function getNumberFromHex(hex) {
  if (
    hex === undefined ||
    hex === null ||
    typeof hex !== "string" ||
    isNaN(hex)
  ) {
    throw new Error(errorMessages.invalidHex);
  }

  return new BigNumber(hex).toNumber();
}

function getWeiFromEther(ether) {
  if (
    ether === undefined ||
    ether === null ||
    (typeof ether !== "string" && typeof ether !== "number")
  ) {
    throw new Error(errorMessages.invalidEther);
  }

  if (typeof ether === "string" && isNaN(ether)) {
    throw new Error(errorMessages.invalidEther);
  }

  let etherBN = new BigNumber(ether);
  return etherBN.times(utils.cryptoDivisionFactors.wei).toNumber();
}

function convertToSatoshis(amount) {
  if (
    amount === undefined ||
    amount === null ||
    (typeof amount !== "string" && typeof amount !== "number")
  ) {
    throw new Error(errorMessages.invalidAmount);
  }

  if (typeof amount === "string" && isNaN(amount)) {
    throw new Error(errorMessages.invalidAmount);
  }

  let amountBN = new BigNumber(amount);
  return amountBN.times(utils.cryptoDivisionFactors.satoshis).toNumber();
}

function getWaveletsFromWaves(waves) {
  if (
    waves === undefined ||
    waves === null ||
    (typeof waves !== "string" && typeof waves !== "number")
  ) {
    throw new Error(errorMessages.invalidWaves);
  }

  if (typeof waves === "string" && isNaN(waves)) {
    throw new Error(errorMessages.invalidWaves);
  }

  let number = new BigNumber(waves);

  return number.times(utils.cryptoDivisionFactors.wavelets).toNumber();
}

function getWavesFromWavelets(wavelets) {
  if (
    wavelets === undefined ||
    wavelets === null ||
    (typeof wavelets !== "string" && typeof wavelets !== "number")
  ) {
    throw new Error(errorMessages.invalidWavelets);
  }

  if (typeof wavelets === "string" && isNaN(wavelets)) {
    throw new Error(errorMessages.invalidWavelets);
  }

  let number = new BigNumber(wavelets);

  return number.dividedBy(utils.cryptoDivisionFactors.wavelets).toNumber();
}

function getXRPFromDrops(drops) {
  if (
    drops === undefined ||
    drops === null ||
    (typeof drops !== "string" && typeof drops !== "number")
  ) {
    throw new Error(errorMessages.invalidDrops);
  }

  if (typeof drops === "string" && isNaN(drops)) {
    throw new Error(errorMessages.invalidDrops);
  }

  let dropsBN = new BigNumber(drops);
  return dropsBN.dividedBy(utils.cryptoDivisionFactors.drops).toNumber();
}

function getDropsFromXRP(xrp) {
  if (
    xrp === undefined ||
    xrp === null ||
    (typeof xrp !== "string" && typeof xrp !== "number")
  ) {
    throw new Error(errorMessages.invalidXRP);
  }

  if (typeof xrp === "string" && isNaN(xrp)) {
    throw new Error(errorMessages.invalidXRP);
  }

  let xrpBN = new BigNumber(xrp);
  return xrpBN.times(utils.cryptoDivisionFactors.drops).toNumber();
}

function findAndUpdateTransaction(oldTransactions, item, bitcoinCash) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.txid) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.txid;
  });

  if (!result) {
    return false;
  }

  result.confirmations = item.confirmations;
  result.from =
    bitcoinCash === true
      ? bchaddr.toLegacyAddress(item.vin[0].addr)
      : item.vin[0].addr;
  result.fees = convertToSatoshis(item.fees);
  result.transactionDate = parseInt(item.time) * 1000 + "";
  return true;
}

function findAndUpdateDogecoinTransaction(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.txid) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.txid;
  });

  if (!result) {
    return false;
  }

  result.confirmations = item.confirmations;
  result.from = item.vin[0].addr;
  result.fees = result.fees ? convertToSatoshis(item.fees) : 0;
  result.transactionDate = item.time * 1000 + "";
  return true;
}

function calculateBitcoinTransactionFees(item) {
  if (!item || typeof item !== "object") {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  if (!item.inputs || !Array.isArray(item.inputs)) {
    throw new Error(errorMessages.transactionItemInputsNotProvided);
  }

  if (!item.inputs || !Array.isArray(item.out)) {
    throw new Error(errorMessages.transactionItemOutNotProvided);
  }

  let inValue = 0;
  let outValue = 0;
  for (let i = 0; i < item.inputs.length; i++) {
    let input = item.inputs[i];
    if (
      input &&
      input["prev_out"] &&
      input["prev_out"].value !== null &&
      input["prev_out"].value !== undefined &&
      typeof input["prev_out"].value === "number"
    ) {
      inValue += input["prev_out"].value;
    }
  }

  for (let i = 0; i < item.out.length; i++) {
    let output = item.out[i];
    if (
      output &&
      output.value !== null &&
      output.value !== undefined &&
      typeof output.value === "number"
    ) {
      outValue += output.value;
    }
  }
  if (inValue < outValue) {
    throw new Error(errorMessages.invalidTransactionFeeCalculation);
  }

  return inValue - outValue;
}

function findAndUpdateTransactionBitcoinBlockchain(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.hash) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.hash;
  });

  if (!result) {
    return false;
  }

  result.confirmations = 1;
  result.from = item.inputs[0]["prev_out"].addr;
  result.fees = calculateBitcoinTransactionFees(item);
  result.transactionDate = parseInt(item.time) * 1000 + "";
  return true;
}

function findAndUpdateTransactionBlockcypher(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.hash) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.hash;
  });

  if (!result) {
    return false;
  }

  result.confirmations = item.confirmations;
  result.from = item.inputs[0].addresses[0];
  result.fees = item.fees;
  result.transactionDate = new Date(item.confirmed).getTime() + "";
  return true;
}

function findAndUpdateEthereumTransaction(oldTransactions, item, failover) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.hash) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  if (typeof failover !== "boolean") {
    throw new Error(errorMessages.invalidFailover);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.hash;
  });

  if (!result) {
    return false;
  }

  if (!failover) {
    result.confirmations = parseInt(item.confirmations);
    result.transactionDate = parseInt(item.timeStamp) * 1000 + "";
  } else {
    result.transactionDate = item.timestamp * 1000 + "";
    result.confirmations = 1;
  }

  return true;
}

function findAndUpdateEthereumClassicTransaction(
  oldTransactions,
  item,
  provider
) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.hash) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.hash;
  });

  if (!result) {
    return false;
  }

  result.confirmations = item.confirmations;
  if (provider === "etcchain") {
    result.fee = getWeiFromEther(item.feeEther);
    result.transactionDate = item.timestamp * 1000 + "";
  } else if (provider === "gasTracker") {
    result.fee = 0;
    result.transactionDate = Date.parse(item.timestamp);
  }
  return true;
}

function findAndUpdateCounterpartyTransaction(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item["tx_hash"]) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item["tx_hash"];
  });

  if (!result) {
    return false;
  }

  result.confirmations = 1;
  if (item.timestamp) {
    result.transactionDate = item.timestamp * 1000 + "";
  }

  if (item.fee) {
    result.fees = item.fee;
  }

  return true;
}

function findAndUpdateOmnilayerTransaction(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.txid) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.txid;
  });

  if (!result) {
    return false;
  }

  result.transactionDate = item.blocktime * 1000 + "";
  result.confirmations = item.confirmations;
  result.fees = convertToSatoshis(item.fee);
  return true;
}

function findAndUpdateRippleTransaction(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.hash) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.hash;
  });

  if (!result) {
    return false;
  }
  result.fees = parseFloat(item.tx.Fee);
  result.amount = parseFloat(item.tx.Amount);
  result.confirmations = 1;
  result.transactionDate = new Date(item.date).getTime() + "";
  return true;
}

function findAndUpdateWavesTransaction(oldTransactions, item) {
  if (!oldTransactions || !Array.isArray(oldTransactions)) {
    throw new Error(errorMessages.oldTransactionsNotProvided);
  }

  if (!item || typeof item !== "object" || !item.id) {
    throw new Error(errorMessages.transactionItemNotProvided);
  }

  let result = oldTransactions.find(transaction => {
    return transaction.transactionHash === item.id;
  });

  if (!result) {
    return false;
  }

  result.transactionDate = item.timestamp + "";
  result.fee = item.fee;
  result.confirmations = 1;
  return true;
}

function calculateRippleAccountBalance(rippleObj) {
  if (!rippleObj || typeof rippleObj !== "object") {
    throw new Error(errorMessages.rippleObjNotProvidedOrInvalid);
  }

  if (
    rippleObj.balance === null ||
    rippleObj.balance === undefined ||
    typeof rippleObj.balance !== "number"
  ) {
    throw new Error(errorMessages.rippleObjBalanceNotProvidedOrInvalid);
  }

  if (!rippleObj.addresses || !Array.isArray(rippleObj.addresses)) {
    throw new Error(errorMessages.rippleObjAddressesNotProvidedOrInvalid);
  }

  let accountBalance = 0;
  for (let i = 0; i < rippleObj.addresses.length; i++) {
    let addressBalance = rippleObj.addresses[i].balance;
    if (
      addressBalance !== null &&
      addressBalance !== undefined &&
      typeof addressBalance === "number"
    ) {
      accountBalance += rippleObj.addresses[i].balance;
    }
  }
  rippleObj.balance = accountBalance;
}

function parseRippleTransactions(transactions, rippleTransactions) {
  if (!transactions || !Array.isArray(transactions)) {
    throw new Error(errorMessages.transactionsNotProvided);
  }

  if (!rippleTransactions || !Array.isArray(rippleTransactions)) {
    throw new Error(errorMessages.rippleTransactionsNotProvided);
  }

  for (let i = 0; i < transactions.length; i++) {
    let transaction = transactions[i].tx;
    let isPresent = findAndUpdateRippleTransaction(
      rippleTransactions,
      transaction
    );
    if (!isPresent) {
      let transactionObj = {
        transactionHash: transaction.hash,
        from: transaction.Account,
        to: transaction.Destination,
        amount: parseInt(transaction.Amount),
        fees: parseInt(transaction.Fee),
        confirmations: 1,
        transactionDate:
          (transaction.date + rippleTransactionTimeAddition) * 1000 + ""
      };

      rippleTransactions.push(transactionObj);
    }
  }
}

function sendMessage(message, ipc) {
  let stringMsg = JSON.stringify(message);
  ipc.server.emit(ipc.socket, "message", stringMsg);
}

function getAddressesWithBalance(addresses) {
  let validAddresses = addresses.filter(address => {
    return address.balance > 0;
  });

  validAddresses = validAddresses.map(address => address.address);

  return validAddresses;
}

function setupWavesAPI(url) {
  WavesAPI.MAINNET_CONFIG.nodeAddress = url;
  WavesAPI.TESTNET_CONFIG.nodeAddress = url;

  wavesInstance = WavesAPI.create(WavesAPI.MAINNET_CONFIG);
  return wavesInstance;
}

function getWavesInstance() {
  return wavesInstance;
}

function convertToShortCoinName(coinName) {
  switch (coinName) {
    case utils.cryptoCurrencyKeys.bitcoin:
      return "BTC";
    case utils.cryptoCurrencyKeys.bitcoinCash:
      return "BCH";
    case utils.cryptoCurrencyKeys.litecoin:
      return "LTC";
    case utils.cryptoCurrencyKeys.dogecoin:
      return "DOGE";
    case utils.cryptoCurrencyKeys.dash:
      return "DASH";
    case utils.cryptoCurrencyKeys.ripple:
      return "XRP";
    case utils.cryptoCurrencyKeys.waves:
      return "WAVES";
    case utils.cryptoCurrencyKeys.counterparty:
      return "XCP";
    case utils.cryptoCurrencyKeys.omni:
      return "OMNI";
    case utils.cryptoCurrencyKeys.maid:
      return "MAID";
    case utils.cryptoCurrencyKeys.ethereum:
      return "ETH";
    case utils.cryptoCurrencyKeys.ethereumClassic:
      return "ETC";
    default:
      return "";
  }
}

function convertChartApiToGlobalCoinConvention(coinName) {
  switch (coinName) {
    case "bitcoin":
      return utils.cryptoCurrencyKeys.bitcoin;
    case "bitcoin-cash":
      return utils.cryptoCurrencyKeys.bitcoinCash;
    case "litecoin":
      return utils.cryptoCurrencyKeys.litecoin;
    case "dogecoin":
      return utils.cryptoCurrencyKeys.dogecoin;
    case "dash":
      return utils.cryptoCurrencyKeys.dash;
    case "ethereum":
      return utils.cryptoCurrencyKeys.ethereum;
    case "ethereum-classic":
      return utils.cryptoCurrencyKeys.ethereumClassic;
    case "ripple":
      return utils.cryptoCurrencyKeys.ripple;
    case "waves":
      return utils.cryptoCurrencyKeys.waves;
    case "counterparty":
      return utils.cryptoCurrencyKeys.counterparty;
    case "omni":
      return utils.cryptoCurrencyKeys.omni;
    case "maidSafeCoin":
      return utils.cryptoCurrencyKeys.maid;
    case "maidsafecoin":
      return utils.cryptoCurrencyKeys.maid;
  }
}

function getCoinTypeFromCoinName(coinName) {
  let key = coinName;
  if (coinName === utils.cryptoCurrencyKeys.ethereum) {
    key = "Ether";
  } else if (coinName === utils.cryptoCurrencyKeys.ethereumClassic) {
    key = "EtherClassic";
  } else if (coinName === utils.cryptoCurrencyKeys.omni) {
    key = "Omnilayer";
  }
  return key;
}

function getCamelCase(word) {
  if (word === utils.cryptoCurrencyKeys.ethereumClassic) {
    return "ethereumClassic";
  } else if (word === utils.cryptoCurrencyKeys.bitcoinCash) {
    return "bitcoinCash";
  } else {
    return word.toLowerCase();
  }
}

async function getUserCoin(coinName, client) {
  let userCoin;
  await db.getDocument(coinName, client).then(
    result => {
      userCoin = result;
      return Promise.resolve(true);
    },
    err => {
      return Promise.resolve(true);
    }
  );
  return Promise.resolve(userCoin);
}

function isCoinUtxoBased(coinName) {
  return (
    coinName === utils.cryptoCurrencyKeys.bitcoin ||
    coinName === utils.cryptoCurrencyKeys.bitcoinCash ||
    coinName === utils.cryptoCurrencyKeys.litecoin ||
    coinName === utils.cryptoCurrencyKeys.dash ||
    coinName === utils.cryptoCurrencyKeys.dogecoin ||
    coinName === utils.cryptoCurrencyKeys.omni ||
    coinName === utils.cryptoCurrencyKeys.counterparty
  );
}

function sendClusterRequest(addresses, url) {
  return requestP({
    method: "POST",
    uri: url,
    body: JSON.stringify({ addresses: addresses }),
    headers: { "Content-Type": "application/json" }
  });
}
module.exports = {
  encryptMnemonic,
  getAddresses,
  getUnitsFromSatoshis,
  hashPhrase,
  getEtherFromWei,
  getGweiFromWei,
  getWeiFromGwei,
  getNumberFromHex,
  getWeiFromEther,
  convertToSatoshis,
  getWaveletsFromWaves,
  getWavesFromWavelets,
  getXRPFromDrops,
  getDropsFromXRP,
  findAndUpdateTransaction,
  findAndUpdateDogecoinTransaction,
  calculateBitcoinTransactionFees,
  findAndUpdateTransactionBitcoinBlockchain,
  findAndUpdateTransactionBlockcypher,
  findAndUpdateEthereumTransaction,
  findAndUpdateEthereumClassicTransaction,
  findAndUpdateCounterpartyTransaction,
  findAndUpdateOmnilayerTransaction,
  findAndUpdateRippleTransaction,
  findAndUpdateWavesTransaction,
  calculateRippleAccountBalance,
  parseRippleTransactions,
  sendMessage,
  getAddressesWithBalance,
  setupWavesAPI,
  getWavesInstance,
  convertChartApiToGlobalCoinConvention,
  getCoinTypeFromCoinName,
  getCamelCase,
  getUserCoin,
  isCoinUtxoBased,
  convertToShortCoinName,
  sendClusterRequest
};
