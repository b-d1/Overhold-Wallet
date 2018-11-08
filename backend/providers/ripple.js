module.exports = {
	rippleS2: {
		getBalance: 'https://s2.ripple.com:51234',
		getTx: 'https://data.ripple.com/v2/accounts/',
		websocket: 'wss://s2.ripple.com'
	},
	overhold: {
		getBalance: 'http://104.248.46.224:5005',
		getTx: 'https://blockchain.info/rawaddr/',
        websocket: 'ws://104.248.46.224:8087'
	}
};