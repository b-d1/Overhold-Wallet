import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../providers/auth.service';
import { AnimationService } from '../../../providers/animation.service';
import * as CryptoJS from 'crypto-js';
import * as global from '../../../globals';
import { MessagingService } from '../../../providers/messaging.service';
import { SharedService } from '../../../providers/shared.service';
import { Subscription } from 'rxjs/Subscription';

var bip39 = require('bip39');
let fs = require('fs');

@Component({
    selector: 'recovery',
    templateUrl: './recovery-page.component.html',
    styleUrls: ['./recovery-page.component.scss'],
    host: {
        class: 'view'
    }
})

export class RecoveryPageComponent {
    @Output() onLogin = new EventEmitter();
    mnemonic: string = null;
    recoveryText: string = 'Upload backup file (.dat)';
    reader = new FileReader();
    file: File = null;
    private recoverFromMnemonicSubscription: Subscription;
    errorMessages = [];

    constructor(
        public authService: AuthService,
        public animationService: AnimationService,
        private messagingService: MessagingService,
        private sharedService: SharedService
    ) { }

    public recovery(): void {
        if (this.mnemonic != null) {
            this.validateMnemonic();
        } else if (this.file != null) {
            this.validateFile();
        } else {
            this.errorMessages = ['Enter your mnemonic'];
            // ref detect changes
            this.onLogin.emit({ success: false, errors: this.errorMessages })
        }
    }

    ngOnInit() {
        this.recoverFromMnemonicSubscription = this.messagingService.recoverFromMnemonic.subscribe(result => {
            if (result.result) {
                this.onLogin.emit({ success: true, status: 'recovery', userId: result.userId });
            }
            else {
                this.errorMessages = ["Invalid mnemonic"];
                this.onLogin.emit({ success: false, errors: this.errorMessages });
            }
        })
    }
    
    ngOnDestroy() {
        if (this.recoverFromMnemonicSubscription) this.recoverFromMnemonicSubscription.unsubscribe();
    }

    validateMnemonic() {
        if (bip39.validateMnemonic(this.mnemonic)) {
            this.sharedService.recoverFromMnemonic(this.mnemonic);
        } else {
            this.errorMessages = ["Invalid mnemonic"];
            this.onLogin.emit({ success: false, errors: this.errorMessages });
        }
    }

    validateFile() {
        this.reader.readAsText(this.file);
        this.reader.onload = () => {
            let user = JSON.parse(CryptoJS.AES.decrypt(this.reader.result.toString(), global.secretKey).toString(CryptoJS.enc.Utf8));
            // console.log('user before', user);
            if (user && user.mnemonic) {
                let mnemonicArray = user.mnemonic.split(' ');
                if (mnemonicArray.length > 1) {
                    user.mnemonic = CryptoJS.AES.encrypt(user.mnemonic, global.secretKey).toString();
                }
            }

            this.onLogin.emit({ success: true, status: 'recovery' })
        };
    }

    onFileChange(event) {
        if (event.target.files && event.target.files.length > 0) {
            this.file = event.target.files[0];
            this.recoveryText = this.file.name;
        }
    }
}
