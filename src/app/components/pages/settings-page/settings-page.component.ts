
import {Component, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import { fadeAnimation } from '../../../app.animations';
import { Router } from '@angular/router';
import { SharedService } from '../../../providers/shared.service';
// import { settings } from 'cluster';
import { appSettings, coinsEnum } from '../../../globals';
import { Subscription } from 'rxjs/Subscription';
import { dbPrivateKeys, dbPublicKeys } from '../../../enums/common';
import { AuthService } from '../../../providers/auth.service';
import { MessagingService } from '../../../providers/messaging.service';
import { DatabaseService } from '../../../providers/database.service';

@Component({
    selector: 'settings',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
    host: {
        class: 'view'
    },
    animations: [fadeAnimation]
})
export class SettingsPageComponent implements OnInit, OnDestroy {

    currentScreen: string = 'username';
    username: string = 'user';
    rightMenuOpen: boolean = false;
    lockRightMenu: boolean = false;
    introUpdate: boolean = false;
    coinsFirstTime: boolean = true;
    stages = [
        { type: 'general', name: 'General' },
        { type: 'coins', name: 'Coins' }
        // { type: 'plugins', name: 'Plugins' }
    ];
    activeStage = this.stages[0].type;
    
    coinUpdate = {
        state: false,
        coinId: -1
    };
    temporalIndexFix: number; 
    coins = [];
    coinsSettings = appSettings.coins;
    generalSettings = appSettings.general;
    sharedSettings = appSettings.shared;

    private generalSettingsUpdateSubscription: Subscription;
    private coinsSettingsUpdateSubscription: Subscription;
    private sharedSettingsUpdateSubscription: Subscription;
    private sharedSettingsSubscription: Subscription;
    private getCurrentUserSubscription: Subscription;
    private changeUsernameSubscription: Subscription;

    constructor(
        private router: Router,
        private authService: AuthService,
        private databaseService: DatabaseService,
        private messagingService: MessagingService,
        private sharedService: SharedService,
        private ref: ChangeDetectorRef
    ) {
        this.sharedSettingsSubscription = this.databaseService.settingsSubject.subscribe(result => {
            if (result.type === dbPrivateKeys.generalSettings) {
                this.generalSettings = result.settings;
                this.introUpdate = false;
                this.ref.detectChanges();
            } else if (result.type === dbPrivateKeys.coinsSettings) {
                this.coinsSettings = result.settings;
                this.coinsSettingsFn();
            }
        });

        this.getCurrentUserSubscription = this.databaseService.currentUserSubject.subscribe(result => {
            if (result.username) {
                this.username = result.username;
                this.ref.detectChanges();
            }
        });

        this.changeUsernameSubscription = this.messagingService.changeUsernameSubject.subscribe(result => {
           if (result.done) {
                this.username = result.username;
            }
            this.ref.detectChanges();
        });


        this.sharedService.obtainGeneralSettings();
        this.sharedService.readCurrentUser();
    }

    ngOnInit() {
        this.coins = Object.keys(coinsEnum).map(key => {
            let coin = coinsEnum[key];
            coin.state = true;
            coin.updating = false;
            return coin;
        });

        this.rightMenuOpen = false;
        this.generalSettingsUpdateSubscriptionFn();
        this.sharedSettingsUpdateSubscriptionFn();
        this.coinsSettingsUpdateSubscription = this.messagingService.coinsSettingsUpdateSubject.subscribe(result => {
            this.coins[this.coinUpdate.coinId].updating = false;
            this.coinUpdate = {
                state: false,
                coinId: this.temporalIndexFix
            };
            this.ref.detectChanges();
        });
    }

    generalSettingsUpdateSubscriptionFn() {
        this.generalSettingsUpdateSubscription = this.messagingService.generalSettingsUpdateSubject.subscribe(result => {
            this.lockRightMenu = false;
            this.ref.detectChanges();
        });
    }

    sharedSettingsUpdateSubscriptionFn() {
        this.sharedSettingsUpdateSubscription = this.messagingService.sharedSettingsUpdateSubject.subscribe(result => {
            this.lockRightMenu = false;
            this.introUpdate = false;
            this.ref.detectChanges();
        });
    }

    ngOnDestroy() {
        if (this.generalSettingsUpdateSubscription) this.generalSettingsUpdateSubscription.unsubscribe();
        if (this.coinsSettingsUpdateSubscription) this.coinsSettingsUpdateSubscription.unsubscribe();
        if (this.sharedSettingsUpdateSubscription) this.sharedSettingsUpdateSubscription.unsubscribe();
        if (this.sharedSettingsSubscription) this.sharedSettingsSubscription.unsubscribe();
        if (this.getCurrentUserSubscription) this.getCurrentUserSubscription.unsubscribe();
        if (this.changeUsernameSubscription) this.changeUsernameSubscription.unsubscribe();
    }

    coinsSettingsFn() {
        if (this.coinsSettings) {
            this.coins.forEach(function (coin) {
                coin.state = this.coinsSettings[coin.name];
                coin.updating = false;
            }, this);
        }
        this.ref.detectChanges();
    }

    changeSettings(type: string) {
        if (!this.lockRightMenu) {
            if (this.currentScreen != type)
                this.rightMenuOpen = false;
            this.rightMenuOpen = !this.rightMenuOpen;
            this.currentScreen = type;
            if (!this.rightMenuOpen)
                this.generalSettingsUpdateSubscriptionFn();
        }
    }

    lockRightMenuFn(lock: boolean) {       
        this.lockRightMenu = lock;
    }

    changeScreen(type: string) {
        this.activeStage = type;
        if (type === 'coins' && this.coinsFirstTime) {
            this.sharedService.obtainCoinsSettings();
            this.coinsFirstTime = false;
        }
    }

    changeCoin(state: boolean, coin: any, index: number) {
        if (coin && !this.coinUpdate.state) {
            coin.state = state;
            coin.updating = true;
            this.temporalIndexFix = index;
            this.coinUpdate = {
                state: true,
                coinId: index
            };
            this.coinsSettings[coin.name] = state;

            if (coin.name === coinsEnum.Omni.name && state === false) {
                this.coinsSettings[coinsEnum.Maid.name] = state;
                this.coins[7].state = state;
            }
            else if (coin.name === coinsEnum.Maid.name && state === true) {
                this.coinsSettings[coinsEnum.Omni.name] = state;
                this.coins[9].state = state;
            }

            this.sharedService.updateCoinsSettings(this.coinsSettings);
        }
    }


    getDisplayApiRefreshRate(refreshRate) {
        switch (refreshRate) {
            case 1: return '3 minutes';
            case 2: return '10 minutes';
            case 3: return '20 minutes';
            case 4: return '30 minutes';
            case 5: return '60 minutes';
        }
    }

    setCoinsToUpdating() {
        this.coins.forEach(coin => {
            coin.updating = true;
        });
    }

    closeRightMenu(): void {
        this.rightMenuOpen = false;
        this.generalSettingsUpdateSubscriptionFn();
        this.ref.detectChanges();
    }

    signOut() {
        this.authService.logout();
        this.router.navigate(['/signup']);
    }
}