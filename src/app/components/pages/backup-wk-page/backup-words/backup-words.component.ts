import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { NotifyRouteService } from '../../../../providers/notify-route.service';
import * as CryptoJS from 'crypto-js';
import * as global from '../../../../globals';
import { SharedService } from '../../../../providers/shared.service';
import { MessagingService } from '../../../../providers/messaging.service';


@Component({
    selector: 'backup-words',
    templateUrl: './backup-words.component.html',
    styleUrls: [
        './backup-words.component.scss'
    ],
    host: {
        class: 'view'
    }
})

export class BackupWordsComponent implements OnInit {

    @Input()
    mnemonicPhrase;
    
    verified: boolean = false;
    showErrorMessage: boolean = false;

    private mnemonicWords: string[];
    private subscription: Subscription;

    constructor(
        private el: ElementRef,
        private notifyRouteService: NotifyRouteService,
        private messageService: MessagingService,
        private sharedService: SharedService,
        private ref: ChangeDetectorRef,
        private router: Router,
        private zone: NgZone
    ) {
        this.mnemonicWords = [];
    }

    ngOnInit() {
        $(this.el.nativeElement).addClass('fadeIn animated speed700');

        this.subscription = this.notifyRouteService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'animateDestroy') {
                $(this.el.nativeElement).addClass('fadeOutRight animated speed700');
            }
        });
        
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    showMnemonicPhrase() {
        this.decryptedMnemoicPhrase();
        this.verified = true;
    }

    changeRoute(event, path, speed) {
        this.notifyRouteService.notifyOther({ option: 'animateDestroy', value: { speed: speed } });
        setTimeout(() => {
            this.zone.run(() => {
                this.router.navigate([path]);
            });
        }, speed);
    }


    decryptedMnemoicPhrase(): void {
        let b64 = CryptoJS.enc.Hex.parse(this.mnemonicPhrase);
        let bytes = b64.toString(CryptoJS.enc.Base64);
        this.mnemonicWords = CryptoJS.AES.decrypt(bytes, global.secretKey).toString(CryptoJS.enc.Utf8).split(' ');
    }

    quitMnemonic() {
        setTimeout(() => {
            this.changeRoute('', '/app/main', 800);
        }, 1200);
    }
}
