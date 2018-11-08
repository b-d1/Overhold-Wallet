module.exports = {
	overhold: {
		general: 'http://104.248.246.196:8545/',
	},
	infura: {
		general: 'https://mainnet.infura.io'
	},
	blockcypher: {
		getBalance: 'https://api.blockcypher.com/v1/eth/main/addrs/',
	},
	etherscan: {
		getTx: 'http://api.etherscan.io/api?module=account&action=txlist&address='
	},
    ethplorer: {
        getTx: 'https://api.ethplorer.io/getAddressTransactions/'
    }
};