let cryptoPriceUrl = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,BCH,ETC,LTC,DOGE,ETH,DASH,XRP,WAVES,XCP,MAID,OMNI&tsyms=BTC,USD,EUR';
let cryptoinfoUrl = 'https://api.coinmarketcap.com/v1/ticker';
let cryptoGraphUrl = 'https://graphs2.coinmarketcap.com/currencies';
let miningFeeUrls = {
    bitcoin: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
    litecoin: 'http://142.93.167.136/litecore/estimateFees',
    dash: 'http://142.93.167.136/dashcore/estimateFees',
    ripple: 'http://67.43.224.62/Ripple'
};

module.exports = {
    cryptoPriceUrl,
    cryptoinfoUrl,
    cryptoGraphUrl,
    miningFeeUrls,
};