export interface PrivateCryptoCurrencies {
    Bitcoin: PrivateCryptoCurrency;
    BitcoinCash: PrivateCryptoCurrency;
    Litecoin: PrivateCryptoCurrency;
    Dogecoin: PrivateCryptoCurrency;
    Dash: PrivateCryptoCurrency;
    Ethereum: PrivateCryptoCurrency;
    EthereumClassic: PrivateCryptoCurrency;
    Waves: PrivateCryptoCurrency;
    Ripple: PrivateCryptoCurrency;
    Omni: PrivateCryptoCurrency;
    Counterparty: PrivateCryptoCurrency;
}

export interface PrivateCryptoCurrency {
    coinName: string;
    isDisabled: boolean;
    internal: PrivateInfoPart;
    change: PrivateInfoPart;
}

export interface PrivateInfoPart {
    addresses: AddressBalance[];
    transactions: Transaction[];
    addressIndex: number;
    derivationPath: string;
    balance: number;
    balanceXCP?: number;
    balanceBTC?: number;
    balanceNVST?: number;
    balanceOMNI?: number;
    balanceMAID?: number;
}

export interface Fee {
    slow: number;
    medium: number;
    fast: number
};

export interface MiningFees {
    Bitcoin?: Fee;
    BitcoinCash?: Fee;
    Litecoin?: Fee;
    Dash?: Fee;
    Dogecoin?: Fee;
    Ethereum: Fee;
    EthereumClassic: Fee;
    Ripple?: Fee;
    Waves?: Fee;
    Counterparty?: Fee;
    Omni?: Fee;
};

export interface AccountsBalances {
    Bitcoin?: AccountBalance;
    BitcoinCash?: AccountBalance;
    Litecoin?: AccountBalance;
    Dash?: AccountBalance;
    Dogecoin?: AccountBalance;
    Ethereum: AccountBalance;
    EthereumClassic?: AccountBalance;
    Ripple?: AccountBalance;
    Waves?: AccountBalance;
    Counterparty?: AccountBalance;
    Omni?: AccountBalance;
};

export interface AccountBalance {
    balance: number;
    balanceNVST?: number; // For Counterparty
    balanceXCP?: number; // For Counterparty
    balanceOMNI?: number; // For Omni
    balanceMAID?: number;
    balanceBTC?: number;
    addresses: AddressBalance[];
};

export interface AddressBalance {
    address: string;
    balance: number;
    nonce?: number; //  For ethereum addresses
    balanceNVST?: number; // For Counterparty
    balanceXCP?: number; // For Counterparty
    balanceOMNI?: number; // For Omni
    balanceMAID?: number;
    balanceBTC?: number;
};

export interface Transaction {
    transactionHash: string;
    transactionDate: string;
    confirmations: number;
    from: string;
    to: string;
    fees: number;
    amount: number;
    asset?: string; // Counterparty and XCP
};

export interface CryptoInfo {
    priceBTC: number;
    priceUSD: number;
    priceEUR: number;
    volumeUSD24H: string;
    marketCapUSD: string;
    availableSupply: string;
    totalSupply: string;
    maxSupply: string;
    percentChange1H: string;
    percentChange24H: string;
    percentChange7D: string;
    graphInfo: {
        hourly: CryptoGraphData,
        daily: CryptoGraphData,
        monthly: CryptoGraphData,
    };
};

export interface CryptoGraphData {
    volumeUsd: Array<Array<number>>;
    priceBtc: Array<Array<number>>;
    priceUsd: Array<Array<number>>;
};
