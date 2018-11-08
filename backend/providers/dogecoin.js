module.exports = {
	overhold: {
		balance: 'http://142.93.167.136/dogecore/balances',
		getTx: 'http://142.93.167.136/dogecore/transactions',
        sendTx: 'http://142.93.167.136/dogecore/sendTransaction',
        getUtxo: 'http://142.93.167.136/dogecore/getUnspentTransactionOutputs'
	},
	dogechain: {
		balance: 'https://dogechain.info/api/v1/address/balance/',
		getTx: 'https://dogechain.info/tx/',
	},
	blockcypher: {
		balance: 'https://api.blockcypher.com/v1/doge/main/addrs/',
		getTx: 'https://api.blockcypher.com/v1/doge/main/addrs/'
	}
};


