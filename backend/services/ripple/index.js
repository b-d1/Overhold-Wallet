let generateAddresses = require('./getAddress');
let getBalances = require('./getBalances');
let getTransactions = require('./getTransactions');

module.exports = {
	generateAddresses:generateAddresses.generateAddresses,
	getBalances: getBalances.getBalances,
	getTransactions: getTransactions.getTransactions
};