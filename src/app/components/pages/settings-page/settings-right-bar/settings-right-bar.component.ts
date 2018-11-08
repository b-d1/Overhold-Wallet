import { Component, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { createHash } from 'crypto';
import { AuthService } from '../../../../providers/auth.service';
import { e } from '@angular/core/src/render3';
import { SharedService } from '../../../../providers/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { MessagingService } from '../../../../providers/messaging.service';

@Component({
    selector: 'settings-right-bar',
    templateUrl: './settings-right-bar.component.html',
    styleUrls: [
        './settings-right-bar.component.scss'
    ]
})
export class SettingsRightBarComponent {

    @Input() screen: string;
    @Input() generalSettings: any;
    @Output() close = new EventEmitter();
    @Output() lockRightMenuEvent = new EventEmitter();
    
    menuItem = 0;
    updateInProgress: boolean = false;

    // change username
    oldUsername: string;
    newUsername: string;
    password: string;
    usernameMessage: string;
    updatingUsername: boolean;

    // change password
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    passwordMessage: string;

    // change rate    
    rates = [
        { key: '3 minutes refresh rate', value: 1 },
        { key: '10 minutes refresh rate', value: 2 },
        { key: '20 minutes refresh rate', value: 3 },
        { key: '30 minutes refresh rate', value: 4 },
        { key: '60 minutes refresh rate', value: 5 }
    ];
    rate: number = this.rates[0].value;
    rateMessage: string;

    // threads
    threads: string;

    private generalSettingsUpdateSubscription: Subscription;
    private changeUsernameSubscription: Subscription;
    private changePasswordSubscription: Subscription;

    constructor(        
        private authService: AuthService,
        private sharedService: SharedService,
        private messagingService: MessagingService,
        private ref: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.rate = this.rates[this.generalSettings.refreshRate - 1].value;
        this.generalSettingsUpdateSubscription = this.messagingService.generalSettingsUpdateSubject.subscribe(result => {
            switch (this.menuItem) {
                case 5:
                    this.rateMessage = 'Succesfully updated refresh rate!';
                    break;
            }

            this.lockRightMenu(false);
            this.ref.detectChanges();
            this.closeRightSettingsMenu();
        });

        this.changeUsernameSubscription = this.messagingService.changeUsernameSubject.subscribe(result => {
            if (result.error) {
                this.usernameMessage = result.error;
            }
            else if (result.done) {
                this.usernameMessage = 'Successfully changed username!';
                this.closeRightSettingsMenu();
            }
            this.updatingUsername = false;
            this.lockRightMenu(false);
            this.ref.detectChanges();
        });

        this.changePasswordSubscription = this.messagingService.changePasswordSubject.subscribe(result => {
            if (result.error) {
                this.passwordMessage = result.error;
            }
            else if (result.done) {
                this.passwordMessage = 'Successfully changed password!';
                this.closeRightSettingsMenu();
            }
            this.lockRightMenu(false);
            this.ref.detectChanges();
        })
    }

    ngOnDestroy() {
        if (this.generalSettingsUpdateSubscription) this.generalSettingsUpdateSubscription.unsubscribe();
        if (this.changeUsernameSubscription) this.changeUsernameSubscription.unsubscribe();
        if (this.changePasswordSubscription) this.changePasswordSubscription.unsubscribe();
    }


    changeUsername() {
        this.usernameMessage = null;
        if (this.oldUsername && this.newUsername && this.password) {
            this.usernameMessage = 'Updating username...';
            this.sharedService.changeUsername(this.oldUsername, this.newUsername, this.password);
            this.lockRightMenu(true);
        }
        else {
            this.usernameMessage = 'You have to fill in all fields.'
        }
        this.password = '';
    }


    changePassword() {
        this.passwordMessage = null;
        if (this.oldPassword && this.newPassword && this.confirmNewPassword) { 
            this.passwordMessage = 'Updating password...';
            this.sharedService.changePassword(this.oldPassword, this.newPassword, this.confirmNewPassword);
            this.lockRightMenu(true);
        }
        else {
            this.passwordMessage = 'You have to fill in all fields.'
        }

        this.oldPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
    }    

    /**
     * Function for setting rate value
     */
    changeRate(): void {        
        this.rateMessage = 'Updating refresh rate...';
        this.generalSettings.refreshRate = this.rate;
        this.menuItem = 5;
        this.lockRightMenu(true);
        this.updateGeneralSettings();        
    }

    updateGeneralSettings(): void {
        this.sharedService.updateGeneralSettings(this.generalSettings);
    }

    /**
     * Check if user entered his correct username
     * @param username 
     * @param oldUsername 
     */
    checkUsername(username: string, oldUsername: string): boolean {
        if (username === oldUsername)
            return true;
        throw new Error('You entered wrong username!');
    }

    /**
     * Check if user entered value for his new username
     * @param newUsername 
     */
    checkNewUserName(newUsername: string): boolean {
        if (!newUsername)
            throw new Error('You have to enter new username!');
        else return true;
    }

    /**
     * Check if user entered correct password
     * @param password 
     * @param oldPassword 
     */
    checkPassword(password: string, oldPassword: string): boolean {
        if (password === this.authService.getPasswordHash(oldPassword))
            return true;
        throw new Error('You have entered incorect password!');
    }

    /**
     * Function to confirm new password 
     * @param newPassword1 
     * @param newPassword2 
     */
    checkNewPasswords(newPassword1: string, newPassword2: string): boolean {
        if (newPassword1 === newPassword2)
            return true;
        throw new Error('New passwords are not matching!');
    }

    /**
     * Closing right menu page after user successfully changed something
     */
    closeRightSettingsMenu(): void {
        setTimeout(() => {
            this.close.emit(null);
        }, 1000);
    }

    /**
     * Locking right menu when something is updating
     * Unlocking same menu if nothing is in process of updating
     */
    lockRightMenu(lock: boolean): void {
        this.updateInProgress = lock;
        this.lockRightMenuEvent.emit(lock);
    }
}