import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '../../../node_modules/@angular/router';
import { mqMessages, dbPrivateKeys, dbPublicCryptoKeys, dbPublicKeys } from '../enums/common';
import { coins2, ICoin, coinsEnum } from '../globals';
import { MessagingService } from './messaging.service';
import { DatabaseService } from './database.service';
import * as global from '../globals';

const coininfo = require('coininfo');
const ethereum_address = require('ethereum-address');
const ripple_address_codec = require('ripple-address-codec');

@Injectable()
export class SharedService implements OnDestroy {

    private cryptoInfoSubscription: Subscription;
    private settingsSubscription: Subscription;
    private privateDataSubscription: Subscription;
    private dbCryptoInfoSubscription: Subscription;
    private dbSettingsSubscription: Subscription;
    private dbPrivateDataSubscription: Subscription;
    private addressGeneratedSubscription: Subscription;
    private generalSettingsUpdateSubscription: Subscription;
    private coinsSettingsUpdateSubscription: Subscription;
    private sharedSettingsUpdateSubscription: Subscription;
    private makeTransactionSubscription: Subscription;
    private clientSetSubscription: Subscription;

    public publicCryptoDataEmitter: EventEmitter<any> = new EventEmitter();
    public privateCryptoDataEmitter: EventEmitter<any> = new EventEmitter();

    satoshiFactor = 100000000;
    dropsFactor = 1000000;
    weiFactor = 1000000000000000000;
    gweiFactor = 1000000000;
    coins: ICoin[] = coins2;
    originalCoins: ICoin[] = coins2;
    privateCoins = {};
    lastPublicCoinReceived: string;
    lastPrivateCoinReceived: string;
    dbSettingsPrivateCryptoKeys = [];
    dbSettingsPublicCryptoKeys = [];
    forTransactionsPageCryptoInfo: boolean = false;


    constructor(private messagingService: MessagingService,
        private databaseService: DatabaseService,
        private router: Router) {

        databaseService.createClient();
        this.messagingService.setupWorker();
        this.databaseService.setListeners();

        this.clientSetSubscription = this.databaseService.clientSetSubject.subscribe(result => {
            this.obtainCoinsSettings();
            this.obtainGeneralSettings();
            this.obtainCoinsSettings();
            this.obtainPrivateData();
        });

        this.cryptoInfoSubscription = this.messagingService.cryptoInfoSubject.subscribe(result => {
            this.obtainCryptoInfo();
        });

        this.privateDataSubscription = this.messagingService.privateDataSubject.subscribe(result => {
            this.obtainPrivateData();
        });

        this.dbCryptoInfoSubscription = this.databaseService.cryptoInfoSubject.subscribe(result => {
            const resultAny = <any>result;
            const index = this.coins.findIndex(coin => {
                return resultAny.name === coin.name;
            });
            if (index === -1) {
                const extraIndex = this.coins.length;
                this.coins[extraIndex] = resultAny;
            } else {
                this.coins[index] = resultAny;
            }

            // Emit when last coin is received. Workaround to avoid unnecessary processing.
            if (resultAny.name === this.lastPublicCoinReceived) {
                this.publicCryptoDataEmitter.emit(this.coins)
            }
        });

        this.dbPrivateDataSubscription = this.databaseService.privateDataSubject.subscribe(result => {
            const resultAny = <any>result;
            if(resultAny.name !== dbPublicCryptoKeys.counterparty && resultAny.name !== dbPublicCryptoKeys.omni) {
                this.privateCoins[resultAny.name] = resultAny;
            }
            // Emit when last private coin is received. Workaround to avoid unnecessary processing.
            if (resultAny.name === this.lastPrivateCoinReceived) {
                this.privateCryptoDataEmitter.emit(this.privateCoins);
            }
        });

        this.dbSettingsSubscription = this.databaseService.settingsSubject.subscribe(result => {
            const resultAny = <any>result;
            if (resultAny.type === dbPrivateKeys.coinsSettings) {
                this.setDBKeys(resultAny.settings);
            }
        });

        this.coinsSettingsUpdateSubscription = this.messagingService.coinsSettingsUpdateSubject.subscribe(result => {
            if (result.type = mqMessages.CoinsSettingsUpdateSuccess) {
                this.setDBKeys(result.update);
            }
        });
    }

    setDBKeys(settingsObject) {
        this.setCoins(settingsObject);
        this.dbSettingsPublicCryptoKeys = this.dbPublicCryptoKeysFromSettings(settingsObject);
        this.dbSettingsPrivateCryptoKeys = this.dbPrivateCryptoKeysFromSettings(settingsObject);

        this.obtainCryptoInfo();
        this.obtainPrivateData();
    }

    initUser() {
        this.messagingService.sendMessage({ type: mqMessages.InitUser});
    }

    generateNewAddress(userCoin, addressType) {
        this.messagingService.sendMessage({ type: mqMessages.GenerateAddress, name: userCoin, addressType: addressType });
    }

    updateGeneralSettings(generalSettings) {
        this.messagingService.sendMessage({ type: mqMessages.GeneralSettingsUpdate, obj: generalSettings });
    }

    updateCoinsSettings(coinsSettings) {
        this.messagingService.sendMessage({ type: mqMessages.CoinsSettingsUpdate, obj: coinsSettings });
    }

    updateSharedSettings(sharedSettings) {
        this.messagingService.sendMessage({ type: mqMessages.SharedSettingsUpdate, obj: sharedSettings });
    }

    changeUsername(oldUsername, newUsername, password) {
        this.messagingService.sendMessage(
            { type: mqMessages.ChangeUsername, oldUsername: oldUsername, newUsername: newUsername, password: password }
        );
    }

    changePassword(oldPassword, newPassword, confirmNewPassword) {
        this.messagingService.sendMessage(
            { type: mqMessages.ChangePassword, oldPassword: oldPassword, newPassword: newPassword, confirmNewPassword: confirmNewPassword }
        );
    }

    recoverFromMnemonic(mnemonic) {
        this.messagingService.checkIfUserExists({ type: mqMessages.RecoverFromMnemonic, mnemonic: mnemonic });
    }

    getMnemonic() {
        this.messagingService.sendMessage({ type: mqMessages.GetMnemonic });
    }

    obtainPrivateData() {
        const keysLength = this.dbSettingsPrivateCryptoKeys.length;
        this.privateCoins = {};
        for (let i = 0; i < keysLength; i++) {
            this.databaseService.readPrivateData(this.dbSettingsPrivateCryptoKeys[i]);
        }
    }

    obtainCryptoInfo() {
        if (this.router.url === '/app/transactions') {
            this.forTransactionsPageCryptoInfo = true;
            const helperCryptoKeysList = JSON.parse(JSON.stringify(this.dbSettingsPublicCryptoKeys));
            if (helperCryptoKeysList.includes('Omni') && !helperCryptoKeysList.includes('Maid')) {
                helperCryptoKeysList.push('Maid');
            }
            const keysLength = helperCryptoKeysList.length;
            for (let i = 0; i < keysLength; i++) {
                this.databaseService.readPublicData(helperCryptoKeysList[i]);
            }
        } else {
            const keysLength = this.dbSettingsPublicCryptoKeys.length;
            if (this.forTransactionsPageCryptoInfo) {
                if (this.coins.length - keysLength === 2) {
                    this.coins.splice(-2, 2);
                    // console.log('+2 -> DIFFERENCE:', this.coins.length-keysLength);
                } else if (this.coins.length - keysLength === 1) {
                    this.coins.splice(-1, 1);
                    // console.log('+1 -> DIFFERENCE:', this.coins.length-keysLength);
                }
            }

            this.forTransactionsPageCryptoInfo = false;
            for (let i = 0; i < keysLength; i++) {
                this.databaseService.readPublicData(this.dbSettingsPublicCryptoKeys[i]);
            }
        }
    }

    obtainGeneralSettings() {
        this.databaseService.readSettings(dbPrivateKeys.generalSettings);
    }

    obtainCoinsSettings() {
        this.databaseService.readSettings(dbPrivateKeys.coinsSettings);
    }

    readCurrentUser() {
        this.databaseService.readCurrentUser(dbPublicKeys.currentUser);
    }

    setCoins(coinsSettingsObject) {
        let settingsFilteredCoins = [];
        const selectedCoins = this.dbPublicCryptoKeysFromSettings(coinsSettingsObject);
        settingsFilteredCoins = this.originalCoins.filter(coin => {
            if (selectedCoins.includes(coin.name)) {
                return coin;
            }
        });
        this.coins = settingsFilteredCoins;
    }

    dbPublicCryptoKeysFromSettings(coins) {
        const approvedCoins = [];
        for (const key in coins) {

            if (key === 'name') {
                continue;
            }

            if (coins[key] === true) {
                approvedCoins.push(key);
            }
        }
        this.lastPublicCoinReceived = approvedCoins[approvedCoins.length - 1];
        return approvedCoins;
    }

    dbPrivateCryptoKeysFromSettings(coins) {
        const approvedCoins = [];
        for (const key in coins) {

            if (key === 'name') {
                continue;
            }

            if (coins[key] === true && key !== dbPublicCryptoKeys.maid && key !== dbPublicCryptoKeys.omni && key !== dbPublicCryptoKeys.counterparty) {
                approvedCoins.push(key);
            }
        }

        this.lastPrivateCoinReceived = approvedCoins[approvedCoins.length - 1];
        return approvedCoins;
    }

    getSelectedCoinsInSettings(coins) {
        coins = coins.filter(coin => {
            if (this.dbSettingsPrivateCryptoKeys.includes(coin.name)) {
                return coin;
            }
        });

        return coins;
    }

    getUsername() {
        this.messagingService.sendMessage({ type: mqMessages.GetUSername });
    }

    ngOnDestroy() {
        this.cryptoInfoSubscription.unsubscribe();
        this.settingsSubscription.unsubscribe();
        this.privateDataSubscription.unsubscribe();
        this.dbCryptoInfoSubscription.unsubscribe();
        this.dbSettingsSubscription.unsubscribe();
        this.dbPrivateDataSubscription.unsubscribe();
        this.addressGeneratedSubscription.unsubscribe();
        this.makeTransactionSubscription.unsubscribe();
        this.generalSettingsUpdateSubscription.unsubscribe();
        this.coinsSettingsUpdateSubscription.unsubscribe();
        this.sharedSettingsUpdateSubscription.unsubscribe();
    }

    public getEtherFromWei(wei) {
        const number = new BigNumber(wei);

        return number.dividedBy(this.weiFactor).toNumber();
    }

    public getEtherFromGwei(gwei) {
        const number = new BigNumber(gwei);

        return number.dividedBy(this.gweiFactor).toNumber();
    }


    public getWeiFromEther(ether) {
        const number = new BigNumber(ether);

        return number.times(this.weiFactor);
    }

    private getXRPFromDrops(drops: number) {
        const dropsBN = new BigNumber(drops);
        return dropsBN.dividedBy(this.dropsFactor).toNumber();
    }

    private convertToBitcoins(satoshis: number) {
        const satoshiBN = new BigNumber(satoshis);
        return satoshiBN.dividedBy(this.satoshiFactor).toNumber();
    }


    getRealAmount(name: string, amount: number): any {
        switch (name) {
            case coinsEnum.Ripple.name:
                return this.getXRPFromDrops(amount);
            case coinsEnum.Ethereum.name:
            case coinsEnum.EthereumClassic.name: {
                return this.getEtherFromWei(amount);
            }
            default:
                return this.convertToBitcoins(amount);
        }
    }

    getCoinBalanceString(name: string) {
        switch (name) {
            case coinsEnum.Omni.name:
                return 'balanceOMNI';
            case coinsEnum.Counterparty.name:
                return 'balanceXCP';
            case coinsEnum.Maid.name:
                return 'balanceMAID';
            default:
                return 'balance';
        }
    }

    checkLitecoinValidAddress(address: string) {
        try {
            bitcoin.address.toOutputScript(address, bitcoin.networks.litecoin);
        } catch (err) {
            if (err instanceof Error) return false;
        }
        return true;
    }

    checkDogeValidAddress(address: string) {
        try {
            bitcoin.address.toOutputScript(address, coininfo.dogecoin.main.toBitcoinJS());
        } catch (err) {
            if (err instanceof Error) return false;
        }
        return true;
    }

    checkDashValidAddress(address: string) {
        try {
            bitcoin.address.toOutputScript(address, coininfo.dash.main.toBitcoinJS());
        } catch (err) {
            if (err instanceof Error) return false;
        }
        return true;
    }


    checkValidAddress(address: string) {
        try {
            bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
        } catch (err) {
            if (err instanceof Error) return false;
        }
        return true;
    }

    checkEthereumValidAddress(address: string) {

        if (ethereum_address.isAddress(address)) {
            return true;
        } else {
            return false;
        }

    }

    checkRippleValidAddress(address: string) {
        if (ripple_address_codec.isValidAddress(address)) {
            return true;
        } else {
            return false;
        }
    }

    getAddressesWithBalance(amount, coinObject, name) {

        const addresses = coinObject.internal.addresses;

        const addressesWithBalance = addresses.filter(address => {
            return address[this.getCoinBalanceString(name)] >= amount;
        });
        return addressesWithBalance;
    }

    public makeTransaction(currencyName, addressTo, amount, speed, addressFrom, fee, transactionFlags) {

        const transactionObject = {
            name: currencyName,
            addressTo: addressTo,
            amount: amount,
            speed: speed,
            addressFrom: addressFrom,
            fee: fee
        };

        if (transactionFlags) {
            transactionObject['transactionFlags'] = transactionFlags;
        }

        this.messagingService.sendMessage({ type: mqMessages.MakeTransaction, transactionInfo: transactionObject });
    }

    public isCoinUtxoBased(coinName) {
        if (coinName === global.coinsEnum.Bitcoin.name ||
            coinName === global.coinsEnum.BitcoinCash.name ||
            coinName === global.coinsEnum.Litecoin.name ||
            coinName === global.coinsEnum.Dash.name ||
            coinName === global.coinsEnum.Omni.name ||
            coinName === global.coinsEnum.Dogecoin.name ||
            coinName === global.coinsEnum.Counterparty.name ||
            coinName === global.coinsEnum.Maid.name) {
            return true;
        }
        return false;
    }

}

