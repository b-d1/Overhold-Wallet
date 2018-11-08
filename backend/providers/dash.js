module.exports = {
	overhold: {
		getBalance: 'http://142.93.167.136/dashcore/balances',
		getTx: 'http://142.93.167.136/dashcore/transactions',
		sendTx: 'http://142.93.167.136/dashcore/sendTransaction',
		getUTCO: 'http://142.93.167.136/dashcore/getUnspentTransactionOutputs'
	},
	blockcypher: {
		getBalance: 'https://api.blockcypher.com/v1/dash/main/addrs/',
		getTx: 'https://api.blockcypher.com/v1/dash/main/addrs/',
		fee: ''
	},
	insight: {
		getTx: 'https://insight.dash.org/insight-api/addrs/txs',
        sendTx: 'https://insight.dash.org/insight-api/tx/send',
        getUtxo: 'https://insight.dash.org/insight-api/addrs/utxo'
	}
};

