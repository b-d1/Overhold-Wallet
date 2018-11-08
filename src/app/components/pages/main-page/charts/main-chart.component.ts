import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SharedService } from '../../../../providers/shared.service';
import { coinsEnum } from '../../../../globals';
import * as global from '../../../../globals';

@Component({
  selector: 'main-chart',
  template: `
  <chart class='main-chart' [options]='options' (load)='saveInstance($event.context)'></chart>
    `,
  styles: [`
    :host, .main-chart {
      display: block;
      width: 100%;
    }
  `]
})
export class MainChartComponent implements OnInit, OnDestroy, OnChanges {

  @Input() chartData: any;
  @Input() privateData: any;

  options: Object;
  chart: any;
  privateCryptoData = {};
  coins = {};
  data;
  detectChangesInterval;
  coinSymbols = [];

  private privateCryptoDataSubscription: Subscription;
  private publicCryptoDataSubscription: Subscription;

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  constructor(
    private sharedService: SharedService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.data = changes.chartData.currentValue;
    this.updateChartInfo();
    this.privateCryptoData = changes.privateData.currentValue;
  }

  ngOnInit() {

    Object.keys(coinsEnum).map(key => {
      this.coins[coinsEnum[key].name] = { balance: 0, percentage: 0 };
    });

    this.privateCryptoDataSubscription = this.sharedService.privateCryptoDataEmitter.subscribe(result => {
      this.privateCryptoData = result;
      this.updateChartInfo();
      this.ref.detectChanges();
    });

    this.publicCryptoDataSubscription = this.sharedService.publicCryptoDataEmitter.subscribe(result => {
      this.data = result;
      this.filterCoins();
      this.updateChartInfo();
      this.ref.detectChanges();
    });

    // Update view every 60 seconds, in order to avoid unnecessary processing, and display chart smoothly.
    this.detectChangesInterval = setInterval(() => {
      this.ref.detectChanges();
    }, 60000);

    this.sharedService.obtainPrivateData();
    this.sharedService.obtainCryptoInfo();
  }

  ngOnDestroy() {
    if (this.privateCryptoDataSubscription) { this.privateCryptoDataSubscription.unsubscribe(); }
    if (this.publicCryptoDataSubscription) { this.publicCryptoDataSubscription.unsubscribe(); }

    if (this.detectChangesInterval) {
      clearInterval(this.detectChangesInterval);
    }

  }

  getChartData() {

    if (this.data) {
      let totalPriceB = 0;
      for (let i = 0; i < this.data.length; i++) {
        const coin = this.data[i];
        const name = coin.name;
        this.coinSymbols.push(coinsEnum[name].symbol);
        const coinBalance = this.getCoinBalance(name) * coin.info['priceUSD'];
        this.coins[name].balance = coinBalance;
        totalPriceB += coinBalance;
      }

      const returnArray = [];
      // Get the percentage
      for (let i = 0; i < this.data.length; i++) {
        const name = this.data[i].name;
        const percentage = (this.coins[name].balance * 100) / totalPriceB;
        if (!percentage) {
          this.coins[name].percentage = 0;
        } else { this.coins[name].percentage = percentage; }

        returnArray.push({ color: this.getCoinColor(name), y: Number(percentage.toFixed(2)) });
      }

      return returnArray;
    }

  }

  private getCoinBalance(name: string): number {
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

  public getCoinColor(name: string): string {
    switch (name) {
      case coinsEnum.Bitcoin.name: return '#e9973d';
      case coinsEnum.BitcoinCash.name: return '#71c75a';
      case coinsEnum.Litecoin.name: return '#bebebe';
      case coinsEnum.Dogecoin.name: return '#b89d31';
      case coinsEnum.Dash.name: return '#1c75bc';
      case coinsEnum.Ethereum.name: return '#323232';
      case coinsEnum.EthereumClassic.name: return '#cbf9cb';
      case coinsEnum.Ripple.name: return '#418ee8';
      case coinsEnum.Waves.name: return '#1a96d3';
      case coinsEnum.Counterparty.name: return '#ea134e';
      case coinsEnum.Omni.name: return '#1b448f';
      case coinsEnum.Maid.name: return '#97bce5';
      default: return '';
    }
  }

  updateChartInfo() {
    const data = this.getChartData();
    this.options = {
      chart: {
        height: 280,
        backgroundColor: 'rgba(255, 255, 255, 0.0)',
        type: 'column'
      },
      exporting: {
        enabled: false,
      },
      plotOptions: {
        column: {
          allowPointSelect: true,
          borderRadius: 3,
          borderWidth: 1,
          borderColor: '#1b212f',
          maxPointWidth: 100,
          groupPadding: 0,
          groupZPadding: 0,
          pointPadding: 0,
          shadow: false,

          states: {
            hover: {
              enabled: false
            },
            select: {
              enabled: false
            }
          },
          point: {
            events: {
              mouseOver: function () {

                this.options.oldColor = this.color;
                this.graphic.attr({
                  fill: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, this.options.oldColor],
                      [1, 'rgba(220,220,220, 0.5)']
                    ]
                  }
                });
              },
              mouseOut: function () {
                this.graphic.attr('fill', this.options.oldColor);
              }
            }
          },
        },
      },
      tooltip: {
        enabled: true
      },
      xAxis: {
        categories: this.coinSymbols,
        gridLineWidth: 0.1,
        gridLineColor: 'gray',
        lineColor: 'none',
        tickWidth: 0,
        labels: {
          align: 'center',
          autoRotation: false,
          y: -5,
          style: {
            color: 'white'
          }

        },
        lineWidth: 0.1
      },
      yAxis: {
        visible: false,
      },
      title: {
        text: null
      },
      legend: {
        enabled: false
      },
      credits: {
        text: ''
      },
      series: [
        {
          dataLabels: {
            enabled: true,
            align: 'center',
            allowOverlap: false,
            crop: true,
            y: 245,
            formatter: function () {
              return this.point.y === '' ? '' : `${this.point.y}% `;
            },
            style: {
              color: 'white',
              fontWeight: 100,
              fontSize: '8px'
            }
          },
          name: 'Portfolio %',
          data: data
        }]
    };
  }

    private filterCoins() {
        this.data = this.data.filter(coin => {
            return coin.name !== global.coinsEnum.Maid.name && coin.name !== global.coinsEnum.Omni.name && coin.name !== global.coinsEnum.Counterparty.name;
        });
    }

}
