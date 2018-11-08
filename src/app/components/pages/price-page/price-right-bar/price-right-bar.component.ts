import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ICoin, coins2, coinsEnum } from '../../../../globals';
import { SharedService } from '../../../../providers/shared.service';
import { Subscription } from 'rxjs/Subscription';


export interface IRateCoin extends ICoin {
  rate: string,
  amount: number
}

@Component({
  selector: 'price-right-bar',
  templateUrl: './price-right-bar.component.html',
  styleUrls: [
    './price-right-bar.component.scss'
  ],
  host: {
    class: 'right_menu_wrap small price-page-menu'
  }
})

export class PriceRightBarComponent implements OnInit, OnDestroy {

  @Output() changeCrypto;
  @Output() changeCurrency;

  currencies: string[] = [
    'USD',
    'EUR',
    'BTC'
  ];
  currentCurrency = 'USD';
  prices = {};
  coins: ICoin[] = coins2;
  currentCoin = this.coins[0];
  isSelectedCoin: boolean = false;
  filterCoins: ICoin[] = [];
  scrollItems: ICoin[] = [];
  pageSize = this.coins.length;
  countOfPages = 3;
  currentPage = 1;
  publicDataSubscription: Subscription;
  showData = false;
  searchTextValue: string;

  constructor(private sharedService: SharedService) {
    this.changeCrypto = new EventEmitter();
    this.changeCurrency = new EventEmitter();
  }

  ngOnInit() {

    Object.keys(coinsEnum).map(key => {
      this.prices[coinsEnum[key].name] = 0;
    });

    this.publicDataSubscription = this.sharedService.publicCryptoDataEmitter.subscribe(result => {
      this.coins = result;
      this.filterCoins = this.coins;
      let currentCoinIndex;

      if (this.isSelectedCoin) {
        currentCoinIndex = this.findCoinIndex(this.currentCoin);
      } else {
        currentCoinIndex = this.findCoinIndex(this.coins[0]);
      }

      this.changeCrypto.emit({ data: this.coins[currentCoinIndex], type: 0 });

      this.currentCoin = this.coins[currentCoinIndex];

      if (this.searchTextValue) {
        this.search(this.searchTextValue);
      }

      this.showData = true;
      this.onCurrencyChange(this.currentCurrency);
    });

    this.sharedService.obtainCryptoInfo();
  }

  ngOnDestroy() {
    if (this.publicDataSubscription) { this.publicDataSubscription.unsubscribe(); }
  }

  updateScrollItems(event) {
    if (event) {
      this.scrollItems = event;
    } else {
      this.scrollItems = this.filterCoins;
    }
  }

  search(searchText: string): void {
    this.searchTextValue = searchText.trim();
    searchText = searchText.toLowerCase();
    if (!searchText) {
      this.filterCoins = this.coins;
    } else {
      this.filterCoins = this.coins.filter(it => it.name.toLowerCase().includes(searchText));
    }

    if (this.filterCoins.length > 0) {
      this.showData = true;
    } else {
      this.showData = false;
    }
  }

  change(evt): void {
    const page = Math.floor(evt.start / this.pageSize) + 1;
    if (page !== this.currentPage) { this.currentPage = page; }
  }

  onCurrencyChange(currencyValue) {
    this.currentCurrency = currencyValue;
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      this.prices[coin.name] = coin.info['price' + currencyValue];
    }

    this.changeCurrency.emit(this.currentCurrency);
  }

  getCoinIcon(name: string): string {
    return coinsEnum[name].icon;
  }

  setCurrentCrypto(coin) {
    this.isSelectedCoin = true;
    const coinIndex = this.findCoinIndex(coin);
    this.currentCoin = this.coins[coinIndex];
    this.changeCrypto.emit({ data: this.currentCoin, type: 1 });
  }

  findCoinIndex(filterCoin) {
    return this.coins.findIndex(coin => {
      return filterCoin.name === coin.name;
    });
  }

    public getFormattedPrice(price) {
        return Number(price).toLocaleString('en-US', {maximumFractionDigits: 8});
    }

}
