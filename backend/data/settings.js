let settingsKeys = {
  coinsSettings: "CoinsSettings",
  generalSettings: "GeneralSettings"
};

let generalSettings = {
  refreshRate: 1,
  disableIntro: false
};

let coinsSettings = {
  Bitcoin: true,
  BitcoinCash: true,
  Ethereum: true,
  EthereumClassic: true,
  Dash: true,
  Omni: true,
  Litecoin: true,
  Dogecoin: true,
  Ripple: true,
  Waves: true,
  Counterparty: true,
  Maid: true
};

module.exports = {
  generalSettings,
  coinsSettings,
  settingsKeys
};
