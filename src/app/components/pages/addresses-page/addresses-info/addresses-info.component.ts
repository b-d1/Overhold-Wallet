import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';
import { mqMessages } from '../../../../enums/common';
import { MessagingService } from '../../../../providers/messaging.service';
import { NotifyRouteService } from '../../../../providers/notify-route.service';

const { clipboard } = require('electron');
var qr = require('qr-encode');

@Component({
  selector: 'addresses-info',
  templateUrl: './addresses-info.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
    styleUrls: [
    './addresses-info.component.scss'
  ],
  host: {
    class: 'right_menu_wrap big'
  }
})
export class AddressesInfoComponent implements OnInit, OnDestroy {

  @Input() address: any;
  @Input() currency: any;
  @Output() close = new EventEmitter();

  visibleCode: boolean = false;
  privateKeyObtained: boolean = false;  
  qrCodesVisible: boolean = false;
  addressQR: boolean = false;
  privateKeyQR: boolean = false;
  coinName: string;
  privateKey: string = 'Obtaining private key...';

  private subscription: Subscription;
  private firebaseSubscription: Subscription;
  
  constructor(
    private el: ElementRef,
    private notifyRouteService: NotifyRouteService,
    private messagingService: MessagingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.firebaseSubscription = this.messagingService.firebaseSubject.subscribe(data => {
        this.privateKey = data.msg;
        this.privateKeyObtained = data.success;
        if(this.qrCodesVisible && this.privateKeyObtained) {
          this.showQrCode();
        }
        this.ref.detectChanges();
    });

    this.subscription = this.notifyRouteService.notifyObservable$.subscribe(async (res) => {

      if (res.hasOwnProperty('option') && res.option === 'animateDestroy') {
        $(this.el.nativeElement).addClass('fadeOutRight animated speed700');
      }

    });

    this.coinName = this.currency.name;

  }

  ngOnDestroy() {
      if (this.subscription) this.subscription.unsubscribe();
      if (this.firebaseSubscription) this.firebaseSubscription.unsubscribe();
  }

  copyPrivateKey() {
    clipboard.writeText(this.privateKey);
  }

  copyAddress() {
    clipboard.writeText(this.address.address);
  }

  showPrivateKey() {
      this.getPrivateKey();
      this.seeKey();
  }

  seeKey() {
    this.visibleCode = !this.visibleCode;
  }

  showQrCode() {        
   
    let addressPage = $('.address_page');
    
    if(!this.addressQR) {    
      let qrcodeA = qr(this.address.address, { type: 6, size: 4, level: 'Q' });
      addressPage.append('<div class="qr_block_addresses">Address<div class="qr_code_img"><img src="' + qrcodeA + '" /></div></div> <br>');
      this.addressQR = true;
      this.qrCodesVisible = true;
    }

    if(this.privateKeyObtained && !this.privateKeyQR) {
        let qrcode = qr(this.privateKey, { type: 6, size: 4, level: 'Q' });  
        addressPage.append('<div class="qr_block_addresses">Private key<div class="qr_code_img"><img src="' + qrcode + '" /></div></div>');            
        this.privateKeyQR = true;
      }

  }
  
  closeInfo() {
    this.close.emit(null)
  }

  getPrivateKey() {
    this.messagingService.sendMessage({ type: mqMessages.GetPrivateKey, address: this.address.address, coinName: this.coinName, coinType: 'internal'});
  }
}
