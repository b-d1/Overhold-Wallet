import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { fadeAnimation } from '../../../app.animations';
import { ICoin, coins2, coinsEnum } from '../../../globals';
import { SharedService } from '../../../providers/shared.service';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

@Component({
    selector: 'transactions-page',
    templateUrl: './transactions-page.component.html',
    styleUrls: [
        './transactions-page.component.scss'
    ],
    host: {
        class: 'view'
    },
    animations: [fadeAnimation]
})
export class TransactionsComponent implements OnInit, OnDestroy {
    countOfPages: number = 1;
    currentPage: number = 1;
    pageSize: number = 10;
    transactionsThreshold = 100;    
    previousTransactionId: number = -1;
    transactionValueInUSD: number;
    showTransactionDetails: boolean = false;
    contentFullWidth: boolean = false;
    showTransactions: boolean = false;
    selectedAll: boolean = false;
    coinNames: any;
    currentCurrency: any;
    userSelectedCurrency: any;
    transactionToOpen: any;
    
    statusNames = [
        { name: 'All', type: 'all' },
        { name: 'Send', type: 'send' },
        { name: 'Received', type: 'receive' }
    ];
    transactionStatus = this.statusNames[0];

    periodNames = [
        { name: 'All', type: 'all' },
        { name: 'Today', type: 'today' },
        { name: 'Last week', type: 'week' },
        { name: 'Last month', type: 'month' },
        { name: 'Last year', type: 'year' }
    ];
    period = this.periodNames[0];

    transactionTypes = [
        { type: 'All' },
        { type: 'Regular' },
        { type: 'Change' }
    ];
    transactionType = this.transactionTypes[0];

    transactions = [];
    filterTransactions = [];
    originalTransactions = [];
    scrollItems = [];  
    publicCryptoData: ICoin[] = coins2;
    searchTextValue: string = '';
    privateCryptoData = {};
    coinsAddresses = {};
    
    private publicCryptoDataSubscription: Subscription;
    private privateCryptoDataSubscription: Subscription;
    
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private sharedService: SharedService,
        private ref: ChangeDetectorRef
    ) {}

    ngOnInit(): void {

        this.coinNames = Object.keys(coinsEnum).map(key => {
            this.coinsAddresses[coinsEnum[key].name] = [];
			return coinsEnum[key];
        });
		this.currentCurrency = this.coinNames[0];

        this.privateCryptoDataSubscription = this.sharedService.privateCryptoDataEmitter.subscribe(result => {
            this.privateCryptoData = result;
           
            this.coinNames = this.sharedService.getSelectedCoinsInSettings(this.coinNames);
            this.contentFullWidth = true;
            if (this.userSelectedCurrency) {
                this.currentCurrency = this.userSelectedCurrency;
            } else {
                this.currentCurrency = this.coinNames[0];
            }

            this.showTransactions = true;
            this.coinNames.push({
                color: '',
                icon: '',
                name: 'All',
                symbol: 'ALL'
            });

            this.getTransactionsToDisplay();
            this.ref.detectChanges();
        });

        this.publicCryptoDataSubscription = this.sharedService.publicCryptoDataEmitter.subscribe(result => {
            this.publicCryptoData = result;
            this.ref.detectChanges();
        });

        this.sharedService.obtainPrivateData();
        this.sharedService.obtainCryptoInfo();

        this.route
            .paramMap
            .subscribe((params: ParamMap) => {
                if (params.get('filter')) {
                    this.currentCurrency = this.coinNames.find(coin => coin.name === params.get('filter')) || this.coinNames[0];
                    let coinName = params.get('filter');
                    if (coinName === coinsEnum.Maid.name) {
                        coinName = coinsEnum.Omni.name;
                    }
                    this.userSelectedCurrency = this.coinNames.find(coin => coin.name === coinName) || this.coinNames[0];
                }
            });
    }

    transformDate(date) {
        const DATE_RFC2822 = 'ddd, DD MMM YYYY HH:mm:ss [GMT]';
        return moment(moment(date, 'x').format(DATE_RFC2822)).fromNow();
    };


    updateScrollItems() {
        this.filterTransactions = this.transactions;
        this.ref.detectChanges();
    }

    ngOnDestroy() {
        if (this.publicCryptoDataSubscription) this.publicCryptoDataSubscription.unsubscribe();
        if (this.privateCryptoDataSubscription) this.privateCryptoDataSubscription.unsubscribe();
    }

    private updatePageCount = (items: number) => {
        this.countOfPages = Math.round(items / this.pageSize);
        if (this.countOfPages > 0 && this.pageSize * this.countOfPages < items) {
            this.countOfPages += 1;
        }
    }

    private calculatePageSize = (items: number) => {
        if (items >= 1000) {
            this.transactionsThreshold = Math.round(items / 1000) * 1000;
        } else {
            this.transactionsThreshold = Math.round(items / 100) * 100;
        }
        this.pageSize = this.transactionsThreshold / 10;
        if (this.pageSize == 0)
            this.pageSize = 10;
    }

    openTransaction(id: number, transaction: any) {

        if (this.previousTransactionId == -1) {
            //address info needs to be open, because is closed now
            //only for the first time opening address info
            this.contentFullWidth = false;
            this.showTransactionDetails = true;
            this.previousTransactionId = id;
        } else {
            if (this.previousTransactionId == id) {
                if (this.contentFullWidth) {
                    //open
                    this.contentFullWidth = false;
                    this.showTransactionDetails = true;
                } else {
                    //close
                    //address info needs to close
                    //because user clicked twice in a row on the same address
                    this.contentFullWidth = true;
                    this.showTransactionDetails = false;
                }
            } else {
                //back to back click on diferent addresses
                //address ingo needs to stay open
                this.contentFullWidth = false;
                this.showTransactionDetails = false;
                setTimeout(() => {
                    this.showTransactionDetails = true;
                }, 25);
            }
        }
        this.previousTransactionId = id;
        if (!transaction.realFees) {
            transaction.realFees = this.sharedService.getRealAmount(transaction.coinName, transaction.fees);;
        }
        this.transactionToOpen = transaction;
        this.calculateTransactionValueInUsd(transaction);
    }    

    filterArray(transactions, text: string): any {
        return transactions.filter(t => t.transactionHash.toLowerCase().includes(text));
    }

    search(searchText: string): void {
        searchText = searchText.toLowerCase().trim();        
        if (!searchText) {
            this.transactions = this.originalTransactions;
        } else {
            if (searchText.length < this.searchTextValue.length) {
                this.transactions = this.filterArray(this.originalTransactions, searchText);
            } else {
                this.transactions = this.filterArray(this.transactions, searchText);
            }
            this.filterTransactions = this.transactions;
        }
        this.searchTextValue = searchText.trim();
        if (this.transactions.length > 0) {
            this.showTransactions = true;
        } else {
            this.showTransactions = false;
        }
        this.calculatePageSize(this.transactions.length);
        this.updatePageCount(this.transactions.length);
    }

    send() {
        // this.router.navigate(['/app/transfer']);        
        this.router.navigate(['/app/transfer', this.currentCurrency.name]);
    }

    change(evt): void {
        const page = Math.floor(evt.start / this.pageSize) + 1;
        if (page !== this.currentPage) this.currentPage = page;
    }

    getSign(type: string): string {
        if (type === 'send') {
            return '-';
        }
        return '+';
    }

    getTransactionsToDisplay() {
        if (this.currentCurrency.name !== 'All') {
            let coinName = this.currentCurrency.name;
            if (this.privateCryptoData && this.privateCryptoData[coinName]) {
                this.coinsAddresses[coinName] = this.setAddressesForCoin(coinName);
                this.transactions = this.filterByTransactionType(coinName);
                this.sortTransactionsByDate();
                this.originalTransactions = this.transactions;                 
                if(this.transactions.length == 0){
                    this.transactions = [];
                    this.originalTransactions = this.transactions;
                    this.showTransactions = false;
                }
            }            
        } else {
            this.transactions = [];
            for (let i = 0; i < this.coinNames.length; i++) {
                let coinName = this.coinNames[i].name;
                if (this.privateCryptoData && this.privateCryptoData[coinName]) {
                    this.coinsAddresses[coinName] = this.setAddressesForCoin(coinName);
                    let tr = this.filterByTransactionType(coinName);
                    this.transactions = this.transactions.concat(tr);
                }
            }
            this.sortTransactionsByDate();
            this.originalTransactions = this.transactions;            
        }

        if(this.searchTextValue){
            this.search(this.searchTextValue);
            if(this.showTransactions){
                this.transactionsFilter();
                this.filterTransactions = this.transactions;
            }
        }
        else{
            this.transactionsFilter();
            this.originalTransactions = this.transactions;            
        }

        if (this.transactions.length > 0) {
            this.showTransactions = true;
            this.calculatePageSize(this.transactions.length);
            this.updatePageCount(this.transactions.length);
        } else {
            this.countOfPages = 0;
            this.showTransactions = false;
        }

    }

    private filterByTransactionType(coinName) {
        if (this.transactionType.type === this.transactionTypes[0].type) {
            // all
            return this.setTransactionsDetails(this.privateCryptoData[coinName].internal.transactions
                .concat(this.privateCryptoData[coinName].change.transactions), coinName);
        }
        else if (this.transactionType.type === this.transactionTypes[1].type) {
            // regular
            return this.setTransactionsDetails(this.privateCryptoData[coinName].internal.transactions, coinName);
        }
        else {
            // change
            return this.setTransactionsDetails(this.privateCryptoData[coinName].change.transactions, coinName);
        }
    }

    private setAddressesForCoin(coinName) {
        let coinAddresses = [];
        let coinsLength = this.privateCryptoData[coinName].internal.addresses.length;
        this.coinsAddresses[coinName] = [];
        for (let i = 0; i < coinsLength; i++) {
            coinAddresses.push(this.privateCryptoData[coinName].internal.addresses[i].address);
        }
        return coinAddresses;
    }

    private setTransactionsDetails(transactions, coinName) {
        transactions.forEach(function (t) {
            t.coinName = coinName;
            t.realAmount = this.sharedService.getRealAmount(coinName, t.amount);
            t.type = this.determineTransactionType(t.coinName, t.from);
            // if the addresses are the same, and the coin is using UTXO model only
            t.change = this.determineTransactionChangeStatus(t.from, t.to, coinName);
        }, this);
        return transactions;
    }

    private determineTransactionType(coinName, from): string {
        if (this.coinsAddresses[coinName].includes(from))
            return 'send';
        return 'receive';
    }

    private determineTransactionChangeStatus(from, to, coinName): boolean {
        // if the addresses are the same, and the coin is using UTXO model only
        if (from === to && (
                         coinName === coinsEnum.Bitcoin.name ||
                         coinName === coinsEnum.Litecoin.name ||
                         coinName ===  coinsEnum.Dash.name || 
                         coinName ===  coinsEnum.Dogecoin.name || 
                         coinName ===  coinsEnum.Counterparty.name || 
                         coinName ===  coinsEnum.Omni.name))
            return true;
        return false;
    }

    onCurrencyChange() {
        this.searchTextValue = '';
        this.userSelectedCurrency = this.currentCurrency;
        this.getTransactionsToDisplay();
    }

    onTransactionTypeChange() {
        this.searchTextValue = '';
        this.getTransactionsToDisplay();
    }

    onStatusChange() {
        this.searchTextValue = '';
        this.getTransactionsToDisplay();
    }

    onPeriodChange() {
        this.searchTextValue = '';
        this.getTransactionsToDisplay();
    }    

    checkConfirmation(confirmations: number): boolean {
        if (confirmations > 0) {
            return true;
        }
        return false;
    }

    getCoinIcon(coinName: string): string {
        return coinsEnum[coinName].icon;
    }

    getCoinSymbol(coinName: string): string {
        return coinsEnum[coinName].symbol;
    }

    closeTransaction() {
        this.contentFullWidth = true;
        this.showTransactionDetails = false;
        this.previousTransactionId = -1;
    }

    private calculateTransactionValueInUsd(transaction) {
        let coin, index;        
        let coinName = transaction.coinName;
        if(coinName===coinsEnum.Counterparty.name || coinName===coinsEnum.Omni.name) {
            let realCoin = transaction.asset;
            switch (realCoin) { 
                case coinsEnum.Counterparty.symbol: 
                    coinName = coinsEnum.Counterparty.name;
                    break;
                case coinsEnum.Omni.symbol:
                    coinName = coinsEnum.Omni.name;
                    break;
                case coinsEnum.Maid.symbol:       
                    coinName = coinsEnum.Maid.name;               
                    break;
            }           
        }

        index = this.publicCryptoData.findIndex(currentCoin => {
            return coinName === currentCoin.name;
        });
        coin = this.publicCryptoData[index];
        this.transactionValueInUSD = +(coin.info.priceUSD * this.sharedService.getRealAmount(coinName, transaction.amount)).toFixed(6);
    }

   private transactionsFilter() {
		let result = [];
		if (this.period.type === 'today') {
			if (this.transactionStatus.type !== 'all') {
				result = this.transactions.filter(t =>
					t.type == this.transactionStatus.type && moment().diff(+t.transactionDate, 'days') <= 1 
				);
			}
			else {
				result = this.transactions.filter(t =>
					moment().diff(+t.transactionDate, 'days') <= 1
				);
			}
		}
		else if (this.period.type === 'all') {
			if (this.transactionStatus.type !== 'all') {
				result = this.transactions.filter(t => t.type == this.transactionStatus.type);
			}
			else {
				result = this.transactions;
			}
		}
		else {
			let criterium;
			switch (this.period.type) {
				case 'week':
					criterium = { millisecs: 86400, value: 7 };
					break;
				case 'month':
					criterium = { millisecs: 2592000, value: 1 };
					break;
				case 'year':
					criterium = { millisecs: 31536000, value: 1 };
					break;
			}

			if (this.transactionStatus.type !== 'all') {
				result = this.transactions.filter(t => t.type == this.transactionStatus.type && ((Math.floor((new Date().getTime() - +t.transactionDate) / 1000)) / criterium.millisecs) <= criterium.value);
			}
			else {
				result = this.transactions.filter(t => ((Math.floor((new Date().getTime() - +t.transactionDate) / 1000)) / criterium.millisecs) <= criterium.value);
			}
        }
        
        this.transactions = result;

	}
    
    private sortTransactionsByDate() {
		return this.transactions.sort((a, b) => b.transactionDate - a.transactionDate);
	}
}