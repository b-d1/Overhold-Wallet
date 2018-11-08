import {Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy} from '@angular/core';
import * as $ from 'jquery';
import * as fs from 'fs';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { NotifyRouteService } from '../../../providers/notify-route.service';
import { SharedService } from '../../../providers/shared.service';
import { MessagingService } from '../../../providers/messaging.service';

// Fs, remote and dialog to handle qr code saving
var remote = require('electron').remote;
var dialog = remote.dialog;

@Component({
    selector: 'backup-wk',
    templateUrl: './backup-wk-page.component.html',
    styleUrls: [
        './backup-wk-page.component.scss'
    ],
    host: {
        class: 'view'
    }
})

export class BackupPageComponent implements OnInit, OnDestroy {

    mnemonicObtained: boolean = false;
    showErrorMessage: boolean = false;
    backup;

    private subscription: Subscription;
    private getMnemonicSubscription: Subscription;

    constructor(
        private el: ElementRef,
        private notifyRouteService: NotifyRouteService,
        private messageService: MessagingService,
        private sharedService: SharedService,
        private ref: ChangeDetectorRef,
        private router: Router
    ) {
        this.sharedService.getMnemonic();
    }

    ngOnInit() {
        $(this.el.nativeElement).find('.content').addClass('fadeIn animated speed700');

        this.subscription = this.notifyRouteService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'animateDestroy') {
                $(this.el.nativeElement).find('.content').addClass('fadeOut animated speed700');
            }
        });

        this.getMnemonicSubscription = this.messageService.getMnemonicSubject.subscribe(res => {
            if (res.mnemonic) {
                this.backup = res.mnemonic;
                this.mnemonicObtained = true;
            }
            else if (res.error) {
                // handle error
                this.mnemonicObtained = false;
                this.showErrorMessage = true;
            }
            this.ref.detectChanges();
        });

    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
        if (this.getMnemonicSubscription) this.getMnemonicSubscription.unsubscribe();
    }

    changeRoute(event, path, speed) {
        this.notifyRouteService.notifyOther({ option: 'animateDestroy', value: { speed: speed } });
        setTimeout(() => {
            this.router.navigate([path]);
        }, speed);
    }

}
