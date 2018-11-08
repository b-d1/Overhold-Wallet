const bitcoin = require("./bitcoin");
const bitcoinCash = require("./bitcoinCash");
const ethereum = require("./ethereum");
const dogecoin = require("./dogecoin");
const dash = require("./dash");
const ethereumClassic = require("./ethereumClassic");
const litecoin = require("./litecoin");
const waves = require("./waves");
const ripple = require('./ripple');
const requests = require ('./requests');






module.exports = {  
        bitcoin,
        bitcoinCash,
        ripple,
        ethereum,
        dogecoin,
        dash,
        ethereumClassic,
        litecoin,
        waves,
        requests
};
