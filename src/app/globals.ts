'use strict';
import { AccountsBalances, CryptoInfo, Fee, MiningFees } from './interfaces/common';

export interface ICoin {
    name: string;
    info: CryptoInfo;
    miningFees: Fee;
    lastChartUpdate: number;
}

// Balances of each crypto
export const accountsBalances: AccountsBalances = {
    Bitcoin: {
        balance: 0,
        addresses: []
    },
    BitcoinCash: {
        balance: 0,
        addresses: []
    },
    Litecoin: {
        balance: 0,
        addresses: []
    },
    Dogecoin: {
        balance: 0,
        addresses: []
    },
    Dash: {
        balance: 0,
        addresses: []
    },
    Ethereum: {
        balance: 0,
        addresses: []
    },
    EthereumClassic: {
        balance: 0,
        addresses: []
    },
    Ripple: {
        balance: 0,
        addresses: []
    },
    Waves: {
        balance: 0,
        addresses: []
    },
    Counterparty: {
        balance: 0,
        balanceNVST: 0,
        addresses: []
    },
    Omni: {
        balance: 0,
        addresses: [],
        balanceOMNI: 0,
        balanceMAID: 0
    }
};

export const miningFees: MiningFees = {
    Bitcoin: {
        slow: 0.00001,
        medium: 0.00002,
        fast: 0.00003
    },
    BitcoinCash: {
        slow: 0.00001,
        medium: 0.00002,
        fast: 0.00003
    },
    Omni: {
        slow: 0.00127534,
        medium: 0.00133518,
        fast: 0.00140624
    },
    Counterparty: {
        slow: 0.00127534,
        medium: 0.00133518,
        fast: 0.00140624
    },
    Ethereum: {
        slow: 0,
        medium: 0,
        fast: 0
    },
    EthereumClassic: {
        slow: 0,
        medium: 0,
        fast: 0
    },
    Ripple: {
        slow: 0.00001,
        medium: 0.000015,
        fast: 0.00002
    },
    Waves: {
        slow: 0.001,
        medium: 0.003,
        fast: 0.005
    },
    Dogecoin: {
        slow: 1,
        medium: 3,
        fast: 5
    },
    Litecoin: {
        slow: 0.00101293,
        medium: 0.00101295,
        fast: 0.00201215
    },
    Dash: {
        slow: 0.00010211,
        medium: 0.00010212,
        fast: 0.00010212
    }
};

export const coinsEnum = {
    Bitcoin: {
        name: 'Bitcoin',
        symbol: 'BTC',
        color: 'bitcoin',
        icon: 'bit'
    },
    BitcoinCash: {
        name: 'BitcoinCash',
        symbol: 'BCH',
        color: 'bitcoin',
        icon: 'bch'
    },
    Counterparty: {
        name: 'Counterparty',
        symbol: 'XCP',
        color: 'xcp',
        icon: 'xcp'
    },
    Dash: {
        name: 'Dash',
        symbol: 'DASH',
        color: 'dash',
        icon: 'dash'
    },
    Dogecoin: {
        name: 'Dogecoin',
        symbol: 'DOGE',
        color: 'doge',
        icon: 'doge'
    },
    Ethereum: {
        name: 'Ethereum',
        symbol: 'ETH',
        color: 'ether',
        icon: 'eth'
    },
    EthereumClassic: {
        name: 'EthereumClassic',
        symbol: 'ETC',
        color: 'etherclas',
        icon: 'eth_classic'
    },
    Litecoin: {
        name: 'Litecoin',
        symbol: 'LTC',
        color: 'litec',
        icon: 'lit'
    },
    Maid: {
        name: 'Maid',
        symbol: 'MAID',
        color: 'maid',
        icon: 'maid'
    },
    Omni: {
        name: 'Omni',
        symbol: 'OMNI',
        color: 'omni',
        icon: 'omni'
    },
    Ripple: {
        name: 'Ripple',
        symbol: 'XRP',
        color: 'ripl',
        icon: 'rip'
    },
    Waves: {
        name: 'Waves',
        symbol: 'WAVES',
        color: 'waves',
        icon: 'waves'
    }
};

export const coins2: ICoin[] = [
    {
        name: 'Bitcoin',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'BitcoinCash',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Counterparty',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Dash',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Dogecoin',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Ethereum',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'EthereumClassic',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Litecoin',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Maid',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Omni',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Ripple',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    },
    {
        name: 'Waves',
        info: {
            priceUSD: 0,
            priceBTC: 0,
            priceEUR: 0,
            volumeUSD24H: '',
            marketCapUSD: '',
            availableSupply: '',
            totalSupply: '',
            maxSupply: '',
            percentChange1H: '',
            percentChange24H: '',
            percentChange7D: '',
            graphInfo: {
                hourly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                daily: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]],
                },
                monthly: {
                    volumeUsd: [[0]],
                    priceBtc: [[0]],
                    priceUsd: [[0]]
                }
            }
        },
        miningFees: {
            slow: 0,
            medium: 0,
            fast: 0
        },
        lastChartUpdate: 0
    }
];

export const appSettings = {
    general: {
        'refreshRate': 1
    },
    shared: {
        'disableIntro': false
    },
    coins: {
        'Bitcoin': false,
        'BitcoinCash': false,
        'Ethereum': false,
        'EthereumClassic': false,
        'Dash': false,
        'Omni': false,
        'Litecoin': false,
        'Dogecoin': false,
        'Ripple': false,
        'Waves': false,
        'Counterparty': false,
        'Maid': false
    }
};

export const cryptoExplorersTransactions = {
    Bitcoin: 'https://www.blockchain.com/btc/tx/',
    BitcoinCash: 'https://blockdozer.com/tx/',
    Litecoin: 'https://insight.litecore.io/tx/',
    Ethereum: 'https://etherscan.io/tx/',
    EthereumClassic: 'https://gastracker.io/tx/',
    Dogecoin: 'https://dogechain.info/tx/',
    Dash: 'https://chain.so/tx/DASH/',
    Ripple: 'https://bithomp.com/explorer/',
    Waves: 'https://wavesexplorer.com/tx/'
};

export const cryptoExplorersAddresses = {
    Bitcoin: 'https://www.blockchain.com/btc/address/',
    BitcoinCash: 'https://blockdozer.com/address/',
    Litecoin: 'https://insight.litecore.io/address/',
    Ethereum: 'https://etherscan.io/address/',
    EthereumClassic: 'https://gastracker.io/addr/',
    Dogecoin: 'https://dogechain.info/address/',
    Dash: 'https://chain.so/address/DASH/',
    Ripple: 'https://bithomp.com/explorer/',
    Waves: 'https://wavesexplorer.com/address/'
};


export const secretKey = '25D0E826EA0C09B1DF8A6537BF2E20D7007FCA8F52E577B4DFB4DC5E7AEDFB7E';


