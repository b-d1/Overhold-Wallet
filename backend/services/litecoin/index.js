let generateAddresses = require('./getAddress');
let getBalances = require('./getBalances');
let getTransactions = require('./getTransactions');
let sendTransaction = require('./sendTransaction');

module.exports = {
	generateAddresses:generateAddresses.generateAddresses,
	getBalances: getBalances.getBalances,
	getTransactions: getTransactions.getTransactions,
	sendTransaction: sendTransaction.sendTransaction
};