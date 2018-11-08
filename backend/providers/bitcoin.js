module.exports = {
	overhold: {
		getBalance: 'http://142.93.167.136/bitcore/balances',
        getTx: 'http://142.93.167.136/bitcore/transactions',
		sendTx: 'http://142.93.167.136/bitcore/sendTransaction',
		getUTXO: 'http://142.93.167.136/bitcore/getUnspentTransactionOutputs'
	},
	blockchainInfo: {
		getBalance: 'https://blockchain.info/balance?active=',
		getTx: 'https://blockchain.info/rawaddr/',
	}
};