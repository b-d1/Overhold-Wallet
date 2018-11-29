import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'main-page',
  templateUrl: './main-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    './main-page.component.scss'
  ],
  host: {
    class: 'view'
  },
})
export class MainPageComponent implements OnInit, OnDestroy {
  chartDate: Date = new Date();
  total: number = 0;
  currency: string = 'USD';

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.ref.detectChanges();
  }

  ngOnDestroy() { }

  changeCurrency(data: { totalBalance: number, currency: string }) {
    this.total = data.totalBalance;
    this.currency = data.currency
    this.ref.detectChanges();
  }

    public getFormattedTotalAmount(total) {

        if (this.currency !== 'BTC') {
            return Number(total).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2});
        } else {
            return Number(total).toLocaleString('en-US', {maximumFractionDigits: 6});
        }
    }

    public getCurrencySymbol(currency) {

      switch (currency) {
          case 'BTC': return 'BTC ';
          case 'USD': return '$';
          case 'EUR': return '€';
          case '': break;
      }

    }


}
