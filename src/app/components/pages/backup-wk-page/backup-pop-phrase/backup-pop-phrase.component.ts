import { Component, OnInit, ElementRef, Output,EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import * as global from '../../../../globals';

import { NotifyRouteService } from '../../../../providers/notify-route.service';

@Component({
    selector: 'backup-pop-phrase',
    templateUrl: './backup-pop-phrase.component.html',
})

export class BackupPopPhraseComponent implements OnInit {
    private subscription: Subscription;
    user: any;
    mnemonic: any;
    leftSide: any;
    rightSide: any;

    constructor(private el: ElementRef,
        private notifyRouteService: NotifyRouteService,
        private router: Router) {
            this.mnemonic = CryptoJS.AES
                                    .decrypt(this.user.mnemonicPhrase, global.secretKey)
                                    .toString(CryptoJS.enc.Utf8)
                                    .split(' ');            
            this.leftSide = this.mnemonic.slice(0, 6);
            this.rightSide = this.mnemonic.slice(6, 12);            
         }

    ngOnInit() {
        $(this.el.nativeElement).find('.content').addClass('fadeIn animated speed700');

        this.subscription = this.notifyRouteService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'animateDestroy') {
                $(this.el.nativeElement).find('.content').addClass('fadeOut animated speed700');
            }
        });
    }

    changeRoute(event, path, speed) {
        this.notifyRouteService.notifyOther({ option: 'animateDestroy', value: { speed: speed } });
        setTimeout(() => {
            this.router.navigate([path]);
        }, speed);
    }

    closePop() {
        setTimeout(() => {
            this.changeRoute('', '/app/main', 700);
        }, 1200); 
    }    
}