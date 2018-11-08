export enum TransactionStatus {
    Sent,
    Pending,
    Error
};

export enum OmniPropertyID {
    OMNI = 1,
    MAID = 3
};


export enum mqMessages {
    ChartInfoSet = 'chartInfoSet',
    CryptoInfoSet = 'cryptoInfoSet',
    CryptoPricesSet = 'cryptoPricesSet',
    CryptoMiningFeesSet = 'cryptoMiningFeesSet',
    AddressesGenerated = 'cryptoAddressesGenerated',
    BalancesSet = 'balancesSet',
    TransactionsSet = 'transactionsSet',
    RippleTransactionsSet = 'rippleTransactionsSet',
    RippleBalancesSet = 'rippleBalancesSet',
    RippleMiningFeesSet = 'rippleMiningFeesSet',
    PrivateCryptoDataSet = 'privateCryptoDataSet',
    PreviousAddressesGenerated = 'cryptoPreviousAddressesGenerated',
    GenerateAddress = 'generateAddress',
    GenerateChangeAddress = 'generateChangeAddress',
    InitUser = 'initUser',
    UserDBFound = 'userDBFound',
    CloseConnection = 'closeConnection',
    AddressGenerated = 'addressGenerated',
    AddressNotGenerated = 'addressNotGenerated',
    ChangeAddressGenerated = 'changeAddressGenerated',
    MakeTransaction = 'makeTransaction',
    TransactionSent = 'transactionSent',
    TransactionFailed = 'transactionFailed',
    GeneralSettingsUpdate = 'generalSettingsUpdate',
    GeneralSettingsUpdateSuccess = 'generalSettingsUpdateSuccess',
    CoinsSettingsUpdate = 'coinsSettingsUpdate',
    CoinsSettingsUpdateSuccess = 'coinsSettingsUpdateSuccess',
    SharedSettingsUpdate = 'sharedSettingsUpdate',
    SharedSettingsUpdateSuccess = 'sharedSettingsUpdateSuccess',
    SignUpUser = 'signUpUser',
    SignInUser = 'signInUser',
    LogoutUser = 'logoutUser',
    GetPrivateKey = 'getPrivateKey',
    PrivateKeyFound = 'privateKeyFound',
    PrivateKeyNotFound = 'privateKeyNotFound',
    ChangeUsername = 'changeUsername',
    ChangePassword = 'changePassword',
    GetPin = 'getPin',
    SetPin = 'setPin',
    ChangePin = 'changePin',
    ValidatePin = 'validatePin',
    RecoverFromMnemonic = 'recoverFromMnemonic',
    GetMnemonic = 'getMnemonic',
    PinObtained = 'pinObtained',
    PinObtainingError = 'pinObtainingError',
    GetUSername = 'getUsername',
    UserRegistering = 'userRegistering'
};

export enum errorMessages {
    GetPinError = 'Obtaining user pin error!'
}

export enum dbPublicKeys {
    sharedSettings = 'SharedSettings',
    currentUser = 'userInfo'
}

export enum dbPrivateKeys {
    generalSettings = 'GeneralSettings',
    coinsSettings = 'CoinsSettings'
}

export enum dbPublicCryptoKeys {
    bitcoin = 'Bitcoin',
    litecoin = 'Litecoin',
    dogecoin = 'Dogecoin',
    dash = 'Dash',
    ethereum = 'Ethereum',
    ethereumClassic = 'EthereumClassic',
    ripple = 'Ripple',
    waves = 'Waves',
    counterparty = 'Counterparty',
    omni = 'Omni',
    maid = 'Maid'
};

export enum dbPrivateCryptoKeys {
    bitcoin = 'Bitcoin',
    litecoin = 'Litecoin',
    dogecoin = 'Dogecoin',
    dash = 'Dash',
    ethereum = 'Ethereum',
    ethereumClassic = 'EthereumClassic',
    ripple = 'Ripple',
    waves = 'Waves',
    counterparty = 'Counterparty',
    omni = 'Omni'
};

export enum addressTypes {
    internal = 'internal',
    change = 'change'
}
