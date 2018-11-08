import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyRouteService } from '../../../providers/notify-route.service';


@Component({
  selector: 'exchange-page',
  templateUrl: './exchange-page.component.html',
  styleUrls: [
    './exchange-page.component.scss'
  ],
  host: {
    class: 'view'
  }
})
export class ExchangePageComponent implements OnInit {
  public subscription: Subscription;

  step: number = 1;
  speed: number = 1;
  exchangeAmount: number = 268562.01;
  receiveAmount: number = 16.00015836;
  coinNames = [
    { name: "BTC" },
    { name: "ETH" },
    { name: "ETC" },
    { name: "LTC" },
    { name: "DOGE" },
    { name: "XRP" },
    { name: "DASH" },
    { name: "WAVE" },
    { name: "XCP" },
    { name: "NVST" },
    { name: "OMNI" },
    { name: "MAID" }
  ];

  stages = [
    { type: "exchange", name: "Exchange" },
    { type: "processing", name: "Processing (0)" },
    { type: "history", name: "History" }
  ];
  activeStage = this.stages[0].type;

  constructor(private notifyRouteService: NotifyRouteService) { }

  ngOnInit() {
    this.subscription = this.notifyRouteService.notifyObservable$.subscribe((res) => {
      if (res.hasOwnProperty('option') && res.option === 'seeKeySuccess') {
        this.step = 3;
      }
    });
  }

  securityKey() {
    this.notifyRouteService.notifyOther({ option: 'securityCall', value: 'seeKeySuccess' });
  }
}