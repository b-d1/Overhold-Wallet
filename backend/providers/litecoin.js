module.exports = {

	overhold: {
		getBalance: 'http://142.93.167.136/litecore/balances',
		getTx: 'http://142.93.167.136/litecore/transactions',
        sendTx: 'http://142.93.167.136/litecore/sendTransaction',
        getUTXO: 'http://142.93.167.136/litecore/getUnspentTransactionOutputs'
	},
	blockcypher: {
		getBalance: 'https://api.blockcypher.com/v1/ltc/main/addrs/',
		getTx: 'https://blockchain.info/rawaddr/',
		fee: '',
	},
	nodeLTC: {
		balance: '',
	}
};