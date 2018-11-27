import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';
import * as global from '../../../globals';
import { AccountsBalances, AddressBalance, MiningFees } from '../../../interfaces/common';
import { MessagingService } from '../../../providers/messaging.service';
import { NotifyRouteService } from '../../../providers/notify-route.service';
import { SharedService } from '../../../providers/shared.service';


const BigNumber = require('bignumber.js');


@Component({
    selector: 'transfer-page',
    templateUrl: './transfer-page.component.html',
    styleUrls: [
        './transfer-page.component.scss'
    ],
    host: {
        class: 'view'
    }
})
export class TransferPageComponent implements OnInit, OnDestroy {

    address = '';
    amount: number;
    fees: number;
    step = 1;
    speed = 1;
    privateCryptoData = {};
    accountsBalances: AccountsBalances;
    miningFees: MiningFees;
    invalidReceiverAddress: boolean;
    invalidBalance: boolean;
    noAddressesWithRequiredBalance: boolean;
    amountNotPresent: boolean;
    receiverAddressNotPresent: boolean;
    addressFrom: AddressBalance;
    offlineTransaction = false;
    sendingTransaction = false;
    validAddresses = [];
    transactionFlagsXRP: string;
    crypto;
    addressWithMaxBalance;
    transactionId: string;
    transactionError: string;
    currencies = [
        { type: 'usd', name: 'USD' },
        { type: 'eur', name: 'EUR' },
        { type: 'btc', name: 'BTC' }
    ];
    openQRwindow: Boolean = false;
    coins: global.ICoin[] = global.coins2;
    currentCurrency = this.coins[0];
    private subscription: Subscription;
    private publicCryptoData: Subscription;
    private privateDataSubscription: Subscription;
    private makeTransactionSubscription: Subscription;

    constructor(
        private el: ElementRef,
        private notifyRouteService: NotifyRouteService,
        private router: Router,
        private avRoute: ActivatedRoute,
        public sharedService: SharedService,
        private messagingService: MessagingService,
        private ref: ChangeDetectorRef
    ) {

    }

    ngOnInit() {
        this.avRoute.paramMap
            .subscribe((params: ParamMap) => {
                if (params.get('crypto')) {
                    this.currentCurrency = this.coins.find(coin => coin.name.toLowerCase() === params.get('crypto').toLowerCase())
                        || this.coins[0];
                }
            });
        const menu = $('.transfer.main_wrap .left_menu');
        menu.css('transition', 'background-image 1s');

        const content = $(this.el.nativeElement).find('.content');
        content.css('transition', 'background-color 1s');
        content.css('background', 'transparent');

        $(this.el.nativeElement).addClass('fadeIn animated speed700');

        this.subscription = this.notifyRouteService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'animateDestroy') {
                $(this.el.nativeElement).addClass('fadeOutRight animated speed700');
            }
            if (res.hasOwnProperty('option') && res.option === 'transferSecurity') {
                this.step = 3;
            }
        });

        this.accountsBalances = global.accountsBalances;

        this.miningFees = global.miningFees;

        this.publicCryptoData = this.sharedService.publicCryptoDataEmitter.subscribe(result => {
            this.coins = result;
            this.filterCoins();
            this.currentCurrency =
                this.coins.find(coin => coin.name.toLowerCase() === this.currentCurrency.name.toLowerCase()) || this.coins[0];
            this.ref.detectChanges();

        });

        this.privateDataSubscription = this.sharedService.privateCryptoDataEmitter.subscribe(result => {
            this.privateCryptoData = result;
            this.ref.detectChanges();
        });

        this.makeTransactionSubscription = this.messagingService.makeTransactionSubject.subscribe(result => {
            this.sendingTransaction = false;
            if (result.sent === false) {
                this.step = 7;
                this.transactionError = result.message;
            } else if (result.sent === true) {
                this.step = 3;
                this.transactionId = result.transaction.transactionHash;
            }
            this.ref.detectChanges();
        });

        this.sharedService.obtainCryptoInfo();
        this.sharedService.obtainPrivateData();
    }

    ngOnDestroy() {
        if (this.subscription) { this.subscription.unsubscribe(); }
        if (this.publicCryptoData) { this.publicCryptoData.unsubscribe(); }
        if (this.privateDataSubscription) { this.privateDataSubscription.unsubscribe(); }
        if (this.makeTransactionSubscription) { this.makeTransactionSubscription.unsubscribe(); }
    }

    nextStep() {
        if (this.step === 1) {
            // address and amount check
            this.invalidBalance = false;
            this.invalidReceiverAddress = false;

            if (!this.amount) {
                this.amountNotPresent = true;
                return;
            }

            this.amountNotPresent = false;

            if (!this.address) {
                this.receiverAddressNotPresent = true;
                return;
            }

            this.receiverAddressNotPresent = false;

            if (!this.checkIfAddressIsValid()) {
                this.invalidReceiverAddress = true;
                return;
            }

            if (!this.checkIfAmountIsValid()) {
                this.invalidBalance = true;
                return;
            }

            this.noAddressesWithRequiredBalance = false;
            if(!this.sharedService.isCoinUtxoBased(this.currentCurrency.name)) {
                this.validAddresses = this.getAddressesWithBalance();

                // Filtering to avoid the same sender and receiver address, it may be removed based on the desired behaviour
                const filteredAddresses = this.filterValidAddresses(this.validAddresses, this.address);
                if (filteredAddresses.length === 0) {
                    this.addressWithMaxBalance = this.getAddressWithMaxBalance(this.getAddresses(), this.address);
                    this.noAddressesWithRequiredBalance = true;
                    return;
                }
                this.validAddresses = filteredAddresses;
                this.addressFrom = this.validAddresses[0];
            }

            if (this.currentCurrency.name === global.coinsEnum.Bitcoin.name ||
                this.currentCurrency.name === global.coinsEnum.BitcoinCash.name ||
                this.currentCurrency.name === global.coinsEnum.Litecoin.name ||
                this.currentCurrency.name === global.coinsEnum.Dogecoin.name ||
                this.currentCurrency.name === global.coinsEnum.Dash.name) {
                this.step = 6;
            } else {
                this.step = 4;
            }

            return;
        }

        if (this.step === 4) {
            this.step = 6;
            return;
        }
    }

    sendTransaction(event) {

        event.target.disabled = true;
        let transactionFlags;
        if (this.currentCurrency.name === global.coinsEnum.Ripple.name) {
            if (!this.transactionFlagsXRP) {
                transactionFlags = 2147483648;
            } else {
                transactionFlags = parseInt(this.transactionFlagsXRP);
            }
        }

        this.sharedService.makeTransaction(
            this.currentCurrency.name, this.address, this.amount, this.speed, this.addressFrom,
            this.getCoinMiningFees(this.currentCurrency.name), transactionFlags);
        this.sendingTransaction = true;
        // this.step = 3;
    }

    cancel() {
        this.step = 1;
    }

    onSuccess() {
        this.nextStep();
    }

    onTransactionEnded() {
        this.router.navigate(['/app/main']);
    }

    toggleQRWindow(): void {
        this.openQRwindow = !this.openQRwindow;
    }

    private getCoinSymbol(name: string): string {
        return global.coinsEnum[name].symbol;
    }

    private getCoinIcon(name: string): string {
        return global.coinsEnum[name].icon;
    }

    private getCoinColor(name: string): string {
        return global.coinsEnum[name].color;
    }

    private getCoinBalance(name: string): number {
        if (this.privateCryptoData && this.privateCryptoData[name]) {
            if (name !== global.coinsEnum.Counterparty.name && name !== global.coinsEnum.Omni.name) {
                return this.privateCryptoData[name].internal.balance + this.privateCryptoData[name].change.balance;
            } else if (name === global.coinsEnum.Counterparty.name) {
                return this.privateCryptoData[name].internal.balanceXCP + this.privateCryptoData[name].change.balanceXCP;
            } else if (name === global.coinsEnum.Omni.name) {
                return this.privateCryptoData[name].internal.balanceOMNI + this.privateCryptoData[name].change.balanceOMNI;
            }
        } else if (this.privateCryptoData
            && this.privateCryptoData[global.coinsEnum.Omni.name]
            && name === global.coinsEnum.Maid.name) {
            return this.privateCryptoData[global.coinsEnum.Omni.name].internal.balanceMAID +
                this.privateCryptoData[global.coinsEnum.Omni.name].change.balanceMAID;
        } else {
            return 0;
        }
    }

    private getCoinMiningFees(name: string) {

        if (name === global.coinsEnum.Omni.name ||
            name === global.coinsEnum.Counterparty.name ||
            name === global.coinsEnum.Maid.name) {
            name = global.coinsEnum.Bitcoin.name
        }

        if (name === global.coinsEnum.Ripple.name ||
            name === global.coinsEnum.Waves.name ||
            name === global.coinsEnum.Dogecoin.name) {
            return global.miningFees[name][this.getLabelFromSpeed()];
        }

        const index = this.coins.findIndex(coin => {
            return name === coin.name;
        });

        return this.coins[index].miningFees[this.getLabelFromSpeed()];
    }

    private getLabelFromSpeed() {
        if (this.speed === 1) { return 'slow'; }
        if (this.speed === 2) { return 'medium'; }
        if (this.speed === 3) { return 'fast'; }
    }

    private isCoinBitcoinBased() {
        if (this.currentCurrency.name === global.coinsEnum.Bitcoin.name ||
            this.currentCurrency.name === global.coinsEnum.BitcoinCash.name ||
            this.currentCurrency.name === global.coinsEnum.Omni.name ||
            this.currentCurrency.name === global.coinsEnum.Counterparty.name ||
            this.currentCurrency.name === global.coinsEnum.Maid.name) {
            return true;
        }
        return false;
    }

    private isCoinEthereumBased() {
        if (this.currentCurrency.name === global.coinsEnum.Ethereum.name ||
            this.currentCurrency.name === global.coinsEnum.EthereumClassic.name) {
            return true;
        }
        return false;
    }

    private notBitcoinOrEthereumBasedCoin() {
        if (!this.isCoinBitcoinBased() && !this.isCoinEthereumBased()) {
            return true;
        }
        return false;
    }

    private convertCurrencyToUSD() {

        if (this.isCoinEthereumBased()) {
            const miningFees = this.getCoinMiningFees(this.currentCurrency.name);
            const ether = this.sharedService.getEtherFromGwei(miningFees);

            return this.convertToUSD(ether);
        }

        if (this.notBitcoinOrEthereumBasedCoin()) {
            const miningFees = this.getCoinMiningFees(this.currentCurrency.name);

            return this.convertToUSD(miningFees);
        } else {
            return 'Undefined';
        }
    }

    private convertToUSD(amount) {
        return new BigNumber(this.currentCurrency.info.priceUSD).times(amount).toNumber();
    }

    private checkIfAddressIsValid() {
        if (this.currentCurrency.name === global.coinsEnum.Bitcoin.name ||
            this.currentCurrency.name === global.coinsEnum.BitcoinCash.name) {
            return this.sharedService.checkValidAddress(this.address);
        } else if (this.currentCurrency.name === global.coinsEnum.Ethereum.name ||
            this.currentCurrency.name === global.coinsEnum.EthereumClassic.name) {
            return this.sharedService.checkEthereumValidAddress(this.address);
        } else if (this.currentCurrency.name === global.coinsEnum.Ripple.name) {
            return this.sharedService.checkRippleValidAddress(this.address);
        } else if (this.currentCurrency.name === global.coinsEnum.Dash.name) {
            return this.sharedService.checkDashValidAddress(this.address);
        } else if (this.currentCurrency.name === global.coinsEnum.Dogecoin.name) {
            return this.sharedService.checkDogeValidAddress(this.address);
        } else if (this.currentCurrency.name === global.coinsEnum.Litecoin.name) {
            return this.sharedService.checkLitecoinValidAddress(this.address);
        } else if (this.currentCurrency.name === global.coinsEnum.Waves.name) {

            // waves has to be implemented without an api call.
            return true;
        }
    }

    private checkIfAmountIsValid() {
        const balance = this.getCoinBalance(this.currentCurrency.name);
        const miningFees = this.getCoinMiningFees(this.currentCurrency.name);
        let amountMFees = 0;

        if (this.notBitcoinOrEthereumBasedCoin()) {
            amountMFees = new BigNumber(this.amount).plus(miningFees).toNumber();
        } else if (this.isCoinEthereumBased()) {
            const feesEther = this.sharedService.getEtherFromGwei(miningFees);
            amountMFees = new BigNumber(this.amount).plus(feesEther).toNumber();
        } else if (this.isCoinBitcoinBased()) {

            // Mining fees are in satoshi per byte, not known until transaction is created, so they are not added in this check.
            amountMFees = this.amount;
        }

        if (amountMFees > balance) {
            return false;
        } else {
            return true;
        }
    }

    private getCoinFeeLabel(name: string) {
        if (this.isCoinBitcoinBased()) {
            return 'SpB';
        } else if (this.isCoinEthereumBased()) {
            return 'GWEI';
        } else {
            return this.getCoinSymbol(name);
        }
    }

    private getAddressesWithBalance() {
         if (this.currentCurrency.name === global.coinsEnum.Maid.name) {
            return this.sharedService.getAddressesWithBalance(
                this.amount, this.privateCryptoData[global.coinsEnum.Omni.name],
                this.currentCurrency.name);
        } else {
            return this.sharedService.getAddressesWithBalance(
                this.amount,
                this.privateCryptoData[this.currentCurrency.name],
                this.currentCurrency.name);
        }
    }

    private getAddresses() {
        let currentCoinName;
        if (this.currentCurrency.name === global.coinsEnum.Maid.name) {
            currentCoinName = global.coinsEnum.Omni.name;
        } else {
            currentCoinName = this.currentCurrency.name;
        }

        if (this.privateCryptoData && this.privateCryptoData[currentCoinName] && this.privateCryptoData[currentCoinName].internal) {
            return this.privateCryptoData[currentCoinName].internal.addresses;
        }
    }

    private filterValidAddresses(addresses, addressTo) {
        return addresses.filter(addressObj => addressObj.address !== addressTo);
    }

    private getAddressWithMaxBalance(addresses, addressTo) {
        if (addresses.length === 0) {
            return null;
        }

        let maxBalance = addresses[0][this.sharedService.getCoinBalanceString(this.currentCurrency.name)];
        let maxAddrObj = addresses[0];

        for (let i = 0; i < addresses.length; i++) {
            const addressObj = addresses[i];
            const currentBalance = addressObj[this.sharedService.getCoinBalanceString(this.currentCurrency.name)];
            if (currentBalance >= maxBalance) {
                maxAddrObj = addressObj;
                maxBalance = currentBalance;
            }
        }

        if (maxAddrObj.address === addressTo) {
            return null;
        }

        return maxAddrObj;
    }

    openTransactionInExplorer() {

        const { shell } = require('electron');

        switch (this.currentCurrency.name) {
            case global.coinsEnum.Bitcoin.name:
                shell.openExternal(global.cryptoExplorersTransactions.Bitcoin + this.transactionId);
                break;
            case global.coinsEnum.BitcoinCash.name:
                shell.openExternal(global.cryptoExplorersTransactions.BitcoinCash + this.transactionId);
                break;
            case global.coinsEnum.Litecoin.name:
                shell.openExternal(global.cryptoExplorersTransactions.Litecoin + this.transactionId);
                break;
            case global.coinsEnum.Ethereum.name:
                shell.openExternal(global.cryptoExplorersTransactions.Ethereum + this.transactionId);
                break;
            case global.coinsEnum.EthereumClassic.name:
                shell.openExternal(global.cryptoExplorersTransactions.EthereumClassic + this.transactionId);
                break;
            case global.coinsEnum.Dogecoin.name:
                shell.openExternal(global.cryptoExplorersTransactions.Dogecoin + this.transactionId);
                break;
            case global.coinsEnum.Dash.name:
                shell.openExternal(global.cryptoExplorersTransactions.Dash + this.transactionId);
                break;
            case global.coinsEnum.Ripple.name:
                shell.openExternal(global.cryptoExplorersTransactions.Ripple + this.transactionId);
                break;
            case global.coinsEnum.Waves.name:
                shell.openExternal(global.cryptoExplorersTransactions.Waves + this.transactionId);
                break;
        }
    }

    filterCoins() {
        this.coins = this.coins.filter(coin => {
            return coin.name !== global.coinsEnum.Maid.name && coin.name !== global.coinsEnum.Omni.name && coin.name !== global.coinsEnum.Counterparty.name;
        });
    }

}
