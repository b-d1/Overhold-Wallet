import {
    Component, Output, Input, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { coins2, ICoin, coinsEnum } from '../../../../globals';
import { NotifyRouteService } from '../../../../providers/notify-route.service';
import { SharedService } from '../../../../providers/shared.service';
import * as global from '../../../../globals';

// Electron's clipboard
const { clipboard } = require('electron');
const qr = require('qr-encode');
const BigNumber = require('bignumber.js');
BigNumber.set({ DECIMAL_PLACES: 6 }); // max of 6 decimal places

export interface IRateCoin extends ICoin {
    rate: string,
    amount: number
}
@Component({

    selector: 'main-right-bar',
    templateUrl: './main-right-bar.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    styleUrls: [
        './main-right-bar.component.scss'
    ],
    host: {
        class: 'right_menu_wrap big main-page-menu'
    }
})
export class MainRightBarComponent implements OnInit, OnDestroy {
    @Output() notify = new EventEmitter();
    @Input() publicData: any;
    @Input() privateData: any;

    prices = {};
    privateCryptoData = {};
    coins: ICoin[] = coins2;
    countOfPages = 1;
    currentPage = 1;
    pageSize = 10;
    filterCoins: ICoin[] = [];
    scrollItems: ICoin[] = [];
    currencies: string[] = [
        'USD',
        'EUR',
        'BTC'
    ];
    currentCurrency = 'USD';
    receiveMode = false;
    addresses = [{ address: '177Noj3QZ8brQPu5DZzoufBm1bAcPUqV7q', balance: 0 }];
    currentAddressPos = 1;
    currentAddress = '177Noj3QZ8brQPu5DZzoufBm1bAcPUqV7q';
    currentAddressBalance = 0;
    balanceString = 'balance';
    currentViewCoin = this.coins[0];
    userSelectedCoin: any;
    copyStatus = 'Copy';
    privateCryptoDataSubscription: Subscription;
    publicCryptoDataSubscription: Subscription;
    currentAddressQrCode = '../../../../../../src/img/qr_code.png';
    showCoins = false;
    searchTextValue: string;

    constructor(private notifyRouteService: NotifyRouteService,
        private router: Router,
        private sharedService: SharedService,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        Object.keys(coinsEnum).map(key => {
            this.prices[coinsEnum[key].name] = 0;
        });

        this.privateCryptoDataSubscription = this.sharedService.privateCryptoDataEmitter.subscribe(res => {
            this.privateCryptoData = res;
            this.calculateBalance(this.currentCurrency);
            this.ref.detectChanges();
        });

        this.publicCryptoDataSubscription = this.sharedService.publicCryptoDataEmitter.subscribe(result => {
            this.coins = result;
            this.filteredCoins();
            this.filterCoins = this.coins;


            let currentCoinIndex;
            if (this.userSelectedCoin) {
                currentCoinIndex = this.findCoinIndex(this.userSelectedCoin);
            } else {
                currentCoinIndex = this.findCoinIndex(this.coins[0]);
            }
            this.currentViewCoin = this.coins[currentCoinIndex];

            if (this.searchTextValue) {
                this.search(this.searchTextValue);
            }

            this.showCoins = true;
            this.onCurrencyChange(this.currentCurrency);
            this.ref.detectChanges();
        });

        this.ref.detectChanges();
        this.generateQrCode();

    }

    ngOnDestroy() {
        if (this.privateCryptoDataSubscription) { this.privateCryptoDataSubscription.unsubscribe(); }
        if (this.publicCryptoDataSubscription) { this.publicCryptoDataSubscription.unsubscribe(); }
    }

    updateScrollItems(event) {
        if (event) {
            this.scrollItems = event;
        } else {
            this.scrollItems = this.filterCoins;
        }
        this.ref.detectChanges();
    }

    // copy to clipboard the address
    public onCopy() {
        clipboard.writeText(this.currentAddress);
        this.copyStatus = 'Copied';
    }

    public onSendMode(coin: ICoin): void {
        this.router.navigate(['/app/transfer', coin.name]);
    }

    public onReceiveMode(coin: IRateCoin): void {

        let name;
        if (coin) {
            name = this.getCoinName(coin.name);

            if (this.privateCryptoData[name]) {
                this.currentViewCoin = coin;
                this.userSelectedCoin = this.currentViewCoin;
                this.balanceString = this.sharedService.getCoinBalanceString(coin.name);
                this.addresses = this.privateCryptoData[name].internal.addresses;
                this.currentAddress = this.addresses[this.currentAddressPos - 1].address;
                this.currentAddressBalance = this.addresses[this.currentAddressPos - 1][this.balanceString];
                this.generateQrCode();
                this.receiveMode = true;
                this.copyStatus = 'Copy';
            } else {
                this.currentAddressPos = 1;
                this.balanceString = 'balance';
            }
        } else {
            this.currentAddressPos = 1;
            this.balanceString = 'balance';
            this.receiveMode = false;
        }
        this.ref.detectChanges();
    }

    public toggleChart(current): void {
        this.notify.emit(current);
    }

    public search(searchText: string): void {
        this.searchTextValue = searchText.trim();
        searchText = searchText.toLowerCase().trim();
        if (!searchText) {
            this.filterCoins = this.coins;
        } else {
            this.filterCoins = this.coins.filter(it => it.name.toLowerCase().includes(searchText));
        }

        if (this.filterCoins.length > 0) {
            this.showCoins = true;
        } else {
            this.showCoins = false;
        }
    }

    public prevAddress(): void {
        if (this.currentAddressPos === 1) {
            this.currentAddressPos = this.addresses.length;
        } else { this.currentAddressPos--; }

        this.currentAddress = this.addresses[this.currentAddressPos - 1].address;
        this.currentAddressBalance = this.addresses[this.currentAddressPos - 1][this.balanceString];
        this.generateQrCode();
    }

    public nextAddres(): void {
        if (this.currentAddressPos === this.addresses.length) {
            this.currentAddressPos = 1;
        } else { this.currentAddressPos++; }

        this.currentAddress = this.addresses[this.currentAddressPos - 1].address;
        this.currentAddressBalance = this.addresses[this.currentAddressPos - 1][this.balanceString];
        this.generateQrCode();
        this.copyStatus = 'Copy';
    }

    public change(evt): void {
        const page = Math.floor(evt.start / this.pageSize) + 1;
        if (page !== this.currentPage) { this.currentPage = page; }
    }

    public gotoTransaction(name: string) {
        this.router.navigate(['app/transactions', name]);
    }

    private getCoinName(name: string): string {
        if (name === coinsEnum.Maid.name) {
            return coinsEnum.Omni.name;
        }

        return name;
    }

    private calculateBalance(currency: string) {
        let totalBalance = 0;
        for (const v of this.coins) {
            totalBalance += v.info['price' + currency] * this.getCoinBalance(v.name)
        }

        this.notify.emit({ totalBalance, currency });
        this.ref.detectChanges();
    }


    private getCoinSymbol(name: string): string {
        return coinsEnum[name].symbol;
    }

    private getCoinIcon(name: string): string {
        return coinsEnum[name].icon;
    }

    private getCoinColor(name: string): string {
        return coinsEnum[name].color;
    }

    private onCurrencyChange(currencyValue) {
        this.calculateBalance(currencyValue);
        this.currentCurrency = currencyValue;
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            this.prices[coin.name] = coin.info['price' + currencyValue];
        }

        this.ref.detectChanges();
    }

    private getCoinBalance(name: string): number {
        let calcResult = 0;
        if (this.privateCryptoData && this.privateCryptoData[name] && this.privateCryptoData[name]) {
            if (name !== coinsEnum.Counterparty.name && name !== coinsEnum.Omni.name) {
                calcResult = this.privateCryptoData[name].internal.balance + this.privateCryptoData[name].change.balance;
            } else if (name === coinsEnum.Counterparty.name) {
                calcResult = this.privateCryptoData[name].internal.balanceXCP + this.privateCryptoData[name].change.balanceXCP;
            } else if (name === coinsEnum.Omni.name) {
                calcResult = this.privateCryptoData[name].internal.balanceOMNI + this.privateCryptoData[name].change.balanceOMNI;
            }
        } else if (this.privateCryptoData && this.privateCryptoData[coinsEnum.Omni.name] && name === coinsEnum.Maid.name) {
            calcResult = this.privateCryptoData[coinsEnum.Omni.name].internal.balanceMAID +
                this.privateCryptoData[coinsEnum.Omni.name].change.balanceMAID;
        }

        return +calcResult.toFixed(6);
    }

    private generateQrCode() {
        this.currentAddressQrCode = qr(this.currentAddress, { type: 6, size: 4, level: 'Q' });
    }

    private findCoinIndex(coin2) {
        return this.coins.findIndex(coin => {
            return coin2.name === coin.name;
        });
    }

    private filteredCoins() {
        this.coins = this.coins.filter(coin => {
            return coin.name !== global.coinsEnum.Maid.name && coin.name !== global.coinsEnum.Omni.name && coin.name !== global.coinsEnum.Counterparty.name;
        });
    }

    public getFormattedPrice(price) {
        return Number(price).toLocaleString('en-US', {maximumFractionDigits: 8});
    }

    public openInExplorer() {
        const { shell } = require('electron');

        switch (this.currentViewCoin.name) {
            case global.coinsEnum.Bitcoin.name:
                shell.openExternal(global.cryptoExplorersAddresses.Bitcoin + this.currentAddress);
                break;
            case global.coinsEnum.BitcoinCash.name:
                shell.openExternal(global.cryptoExplorersAddresses.BitcoinCash + this.currentAddress);
                break;
            case global.coinsEnum.Litecoin.name:
                shell.openExternal(global.cryptoExplorersAddresses.Litecoin + this.currentAddress);
                break;
            case global.coinsEnum.Ethereum.name:
                shell.openExternal(global.cryptoExplorersAddresses.Ethereum + this.currentAddress);
                break;
            case global.coinsEnum.EthereumClassic.name:
                shell.openExternal(global.cryptoExplorersAddresses.EthereumClassic + this.currentAddress);
                break;
            case global.coinsEnum.Dogecoin.name:
                shell.openExternal(global.cryptoExplorersAddresses.Dogecoin + this.currentAddress);
                break;
            case global.coinsEnum.Dash.name:
                shell.openExternal(global.cryptoExplorersAddresses.Dash + this.currentAddress);
                break;
            case global.coinsEnum.Ripple.name:
                shell.openExternal(global.cryptoExplorersAddresses.Ripple + this.currentAddress);
                break;
            case global.coinsEnum.Waves.name:
                shell.openExternal(global.cryptoExplorersAddresses.Waves + this.currentAddress);
                break;
        }
    }

}
