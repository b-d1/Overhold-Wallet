import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AccountsBalances } from '../../../../app/interfaces/common';
import { fadeAnimation } from '../../../app.animations';
import * as global from '../../../globals';
import {addressTypes} from '../../../enums/common';
import { MessagingService } from '../../../providers/messaging.service';
import { SharedService } from '../../../providers/shared.service';



@Component({
	selector: 'addresses-page',
	templateUrl: './addresses-page.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    styleUrls: [
		'./addresses-page.component.scss'
	],
	host: {
		class: 'view'
	},
	animations: [fadeAnimation]
})
export class AddressesPageComponent implements OnInit, OnDestroy {

	countOfPages: number = 1;
	currentPage: number = 1;
	pageSize: number = 10;
	previousAddressId: number = -1;
	currentAddress: boolean = false;
	contentFullWidth: boolean = false;
	showAddresses: boolean = false;	
	generatingAddress: boolean = false;
	address: string;
	searchTextValue: string = '';

	addressTypes = [
        { type: 'All'},
        { type: 'Regular' },
		{ type: 'Change'}        
	];
	addressType = this.addressTypes[1];

	coinNames = [];
	addresses = [];
	originalAddresses = [];
	scrollItems = [];	
	currency: any;
	addressToOpen: any;
	userSelectedCurrency: any;
	generateAddressEvent;
	privateCryptoData = {};

    private addressGeneratedSubscription: Subscription;
    private privateDataSubscription: Subscription;    

	constructor(
		private messagingService: MessagingService,
		private sharedService: SharedService,
		private ref: ChangeDetectorRef
	) {}

	ngOnInit() {

		this.coinNames = Object.keys(global.coinsEnum).map(key => {
			return global.coinsEnum[key];
		});
		this.currency = this.coinNames[0];
		
        this.privateDataSubscription = this.sharedService.privateCryptoDataEmitter.subscribe(result => {
			this.privateCryptoData = result;
			
			this.coinNames = this.sharedService.getSelectedCoinsInSettings(this.coinNames);
			this.contentFullWidth = true;
			if(this.userSelectedCurrency) {
				this.currency = this.userSelectedCurrency;
			}
			else {
				this.currency = this.coinNames[0]; 
			}
			
            this.getAddressesToDisplay();
            this.ref.detectChanges();
        });

        this.addressGeneratedSubscription = this.messagingService.addressGeneratedSubject.subscribe(result => {
            let length = this.privateCryptoData[result.name].internal.addresses.length;

            // workaround for updating view.
            let coinObj = JSON.parse(JSON.stringify(this.privateCryptoData[result.name]));

            coinObj[result.addressType].addresses.push(result.addressBalance);
            this.privateCryptoData[result.name] = coinObj;

            this.generatingAddress = false;

            this.getAddressesToDisplay();

            if(this.generateAddressEvent && this.generateAddressEvent.target.disabled === true) {
            	this.generateAddressEvent.target.disabled = false;
			}

            this.ref.detectChanges();
		});
		
		this.sharedService.obtainPrivateData();			
	}

	updateScrollItems() {
        this.scrollItems = this.addresses;
        this.ref.detectChanges();
    }

	ngOnDestroy() {
        if (this.addressGeneratedSubscription) this.addressGeneratedSubscription.unsubscribe();
        if (this.privateDataSubscription) this.privateDataSubscription.unsubscribe();
	}

	private updatePageCount = (items: any[]) => {
		this.countOfPages = Math.round(items.length / this.pageSize);
	}

	private getAddressesToDisplay() {
		let coinName = this.currency.name;
		
		if(this.privateCryptoData && this.privateCryptoData[coinName]){
			
			if(this.addressType.type === this.addressTypes[0].type) {
				// all
				this.addresses = this.privateCryptoData[coinName].internal.addresses
									 .concat(this.privateCryptoData[coinName].change.addresses);
			}
			else if(this.addressType.type === this.addressTypes[1].type) {
				// regular
				this.addresses = this.privateCryptoData[coinName].internal.addresses;
			}
			else {
				// change
				this.addresses = this.privateCryptoData[coinName].change.addresses;
			}
			
			this.originalAddresses = this.addresses;			
			if(this.addresses.length>0){
				this.showAddresses = true;
				this.updatePageCount(this.addresses);
			}
			else{
				this.showAddresses = false;
			}			
		}

		if(this.searchTextValue){
			this.search(this.searchTextValue);
		}
		
	}

	onCurrencyChange() {		
		this.searchTextValue = '';
		this.userSelectedCurrency = this.currency;
		this.showAddresses = false;
		this.getAddressesToDisplay();
	}

	onAddressTypeChange(){
		this.searchTextValue = '';
		this.showAddresses = false;
		this.getAddressesToDisplay();
	}

	search(searchText: string): void {
		this.searchTextValue = searchText.trim();
		searchText = searchText.toLowerCase().trim();
		if (!searchText) {
			this.addresses = this.originalAddresses;
		} else {
			this.addresses = this.originalAddresses.filter(t => t.address.toLowerCase().includes(searchText));			
		}
		this.scrollItems = this.addresses;

		if(this.addresses.length == 0){
			this.showAddresses = false;			
		}
		else{
			this.showAddresses = true;
		}
		this.updatePageCount(this.addresses);		
	}

	openAddress(id: number, address: any) {

		if(this.previousAddressId == -1){
			//address info needs to be open, because is closed now
			//only for the first time opening address info
			this.contentFullWidth = false;
			this.currentAddress = true;
			this.previousAddressId = id;
		}
		else{
			if(this.previousAddressId == id){
				
				if(this.contentFullWidth){
					//open
					this.contentFullWidth = false;
					this.currentAddress = true;
				}
				else {
					//close
					//address info needs to close
					//because user clicked twice in a row on the same address
					this.contentFullWidth = true;
					this.currentAddress = false;
				}
			}
			else{
				//back to back click on diferent addresses
				//address ingo needs to stay open
				this.contentFullWidth = false;					
				this.currentAddress = false;
				setTimeout(() => {
					this.currentAddress = true;
				}, 25);
			}
		}
		this.previousAddressId = id;
		this.addressToOpen = address;
	}

	closeAddress(){
		this.contentFullWidth = true;
		this.currentAddress = false;
		this.previousAddressId = -1;
	}

	createAddress(event) {
        event.target.disabled = true;
		this.generateAddressEvent = event;
        this.generatingAddress = true;
		let coinName = this.currency.name;

		let addressTypeString;

		if(!this.sharedService.isCoinUtxoBased(coinName) || this.addressType.type === this.addressTypes[0].type || this.addressType.type === this.addressTypes[1].type) {
			addressTypeString = addressTypes.internal;
		} else {
            addressTypeString = addressTypes.change;
		}

        this.sharedService.generateNewAddress(coinName, addressTypeString);
	}

	change(evt): void {
		const page = Math.floor(evt.start / this.pageSize) + 1;
		if (page !== this.currentPage) this.currentPage = page;
	}

	trackByFn(index, item) {
		return item.name;
	}

    getAddressBalance(address) {
		if(this.currency.symbol === global.coinsEnum.Maid.symbol) {
			return address.balanceMAID;
		} else if(this.currency.symbol === global.coinsEnum.Counterparty.symbol) { 
			return address.balanceXCP;
		} else if(this.currency.symbol === global.coinsEnum.Omni.symbol) { 
			return address.balanceOMNI;
		} else {
			return address.balance;
		}
	}
}
