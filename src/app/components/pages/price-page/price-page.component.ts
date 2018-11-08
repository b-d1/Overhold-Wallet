import { Component, OnInit, OnDestroy } from '@angular/core';
import { coinsEnum } from '../../../globals';
import { SharedService } from '../../../providers/shared.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'price-page',
  templateUrl: './price-page.component.html',
  host: {
    class: 'view'
  },
  styleUrls: [
    './price-page.component.scss'
  ]
})

export class PricePageComponent implements OnInit, OnDestroy {

  currencyTypes = [
    'USD',
    'EUR',
    'BTC'
  ];

  periodNames = [
    { id: 'percentChange1H', name: 'HOURLY' },
    { id: 'percentChange24H', name: 'DAILY' },
    { id: 'percentChange7D', name: 'MONTHLY' }
  ];

  cryptoCurrency;
  info;
  time = this.periodNames[0];
  privateCryptoData = {};
  allDataFetched: boolean = false;
  privateDataSubscription: Subscription;
  currency = this.currencyTypes[0];
  totalBalance;
  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.obtainPrivateData();
    this.privateDataSubscription = this.sharedService.privateCryptoDataEmitter.subscribe(result => {
      this.privateCryptoData = result;
    });
  }

  ngOnDestroy() {
    if (this.privateDataSubscription) { this.privateDataSubscription.unsubscribe(); }
  }

  calculateBalance() {
    const cryptoBalance = this.getCoinBalance(this.cryptoCurrency.name);

    const oldBalance = (this.cryptoCurrency.info.priceUSD -
      ((this.cryptoCurrency.info[this.time.id] / 100 * this.cryptoCurrency.info.priceUSD))) * cryptoBalance;

    const currentBalance = this.cryptoCurrency.info.priceUSD * cryptoBalance;
    const totalBalance = (currentBalance - oldBalance).toFixed(5);
    return totalBalance;
  }

  // Changed in price-right-bar
  changeCrypto(event) {
    // console.log('on change event -> ', event.data.info.graphInfo[this.time.name.toLowerCase()]);
    if (event.type) {
      this.time = this.periodNames[0];
    }

    this.cryptoCurrency = event.data;
    this.allDataFetched = true;

      // this.cryptoCurrency.cryptoInfo.marketCapUSD = this.cryptoCurrency.cryptoInfo.marketCapUSD.toLocaleString('en-US', {
      //     style: 'currency',
      //     currency: 'USD',
      // });
      // this.cryptoCurrency.cryptoInfo.volumeUSD24H = this.cryptoCurrency.cryptoInfo.volumeUSD24H.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      // this.cryptoCurrency.cryptoInfo.availableSupply = this.cryptoCurrency.cryptoInfo.availableSupply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      // this.cryptoCurrency.cryptoInfo.maxSupply = this.cryptoCurrency.cryptoInfo.maxSupply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  }

  onChangeCurrency(time) {
    // this.time = time
  }

  getCoinSymbol(name: string): string {
    if (name) {
      return coinsEnum[name].symbol;
    }

    return '';
  }

  getCoinIcon(name: string): string {
    if (name) {
      return coinsEnum[name].icon;
    }

    return '';
  }

  getCoinColor(name: string): string {
    if (name) {
      return coinsEnum[name].color;
    }

    return '';
  }

  getRateColor(value: number): string {
    if (Math.sign(value) === 1) {
      return 'green'
    }

    return 'red'
  }

  getCoinBalance(name: string): number {
    if (this.privateCryptoData && this.privateCryptoData[name] && this.privateCryptoData[name]) {
      if (name !== coinsEnum.Counterparty.name && name !== coinsEnum.Omni.name) {
        return this.privateCryptoData[name].internal.balance + this.privateCryptoData[name].change.balance;
      } else if (name === coinsEnum.Counterparty.name) {
        return this.privateCryptoData[name].internal.balanceXCP + this.privateCryptoData[name].change.balanceXCP;
      } else if (name === coinsEnum.Omni.name) {
        return this.privateCryptoData[name].internal.balanceOMNI + this.privateCryptoData[name].change.balanceOMNI;
      }
    } else if (this.privateCryptoData && this.privateCryptoData[coinsEnum.Omni.name] && name === coinsEnum.Maid.name) {
      return this.privateCryptoData[coinsEnum.Omni.name].internal.balanceMAID +
        this.privateCryptoData[coinsEnum.Omni.name].change.balanceMAID;
    } else {
      return 0;
    }
  }

  getFormattedCurrency(currency) {
    if (currency) {
        return Number(currency).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
    } else {
      return '';
    }
  }

  getFormattedNumber(number) {
      if (number) {
          return Number(number).toLocaleString('en-US', {maximumFractionDigits: 8});
      } else {
          return '';
      }
  }



}
