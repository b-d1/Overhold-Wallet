import { Component, EventEmitter, Input, Output } from '@angular/core';
import { clipboard } from 'electron';
import { coinsEnum } from '../../../../globals';
import * as moment from 'moment'

@Component({
    selector: 'transactions-right-bar',
    templateUrl: './transactions-right-bar.component.html',
    styleUrls: [
        './transactions-right-bar.component.scss'
    ]
})
export class TransactionsRightBarComponent {

    @Input()
    @Input() transaction;
    @Input() transactionValue;
    @Output() close = new EventEmitter();

    coinSymbol: string;
    feeCoinSymbol: string;

    constructor() {}

    ngOnInit() {
        if(this.transaction.coinName!==coinsEnum.Counterparty.name && this.transaction.coinName!==coinsEnum.Omni.name) {
            this.coinSymbol = coinsEnum[this.transaction.coinName].symbol;
            this.feeCoinSymbol = this.coinSymbol;
        }
        else {
            this.coinSymbol = this.transaction.asset;
            this.feeCoinSymbol = coinsEnum.Bitcoin.symbol;
        }
    }

    copyAddress() {
        clipboard.writeText(this.transaction.transactionHash);
    }
    
    checkConfirmation(confirmations: number): boolean {
        if (confirmations > 1)
            return true;
        return false;
    }

    getCoinIcon(coinName: string): string {
        return coinsEnum[coinName].icon;
    }

    getSign(type: string): string {
        if (type === 'send')
            return '-';
        return '+';
    }

    closeInfo() {
        this.close.emit(null)
    }

    transformDate(date) {
        const DATE_RFC2822 = 'ddd, DD MMM YYYY HH:mm:ss';
        return moment.utc(moment.utc(date, 'x').format(DATE_RFC2822)).fromNow();
    }

    transformDateShort(date) {
        const DATE_FORMAT = 'DD MMM YYYY HH:mm';
        return moment.utc(date, 'x').format(DATE_FORMAT);
    };


}