import { Injectable } from '@angular/core';
import { Subject } from '../../../node_modules/rxjs';
import { mqMessages } from '../enums/common';
import { ElectronService } from './electron.service';
import { DatabaseService } from './database.service';


@Injectable()
export class MessagingService {

    public worker;

    public cryptoInfoSubject: Subject<any>;
    public privateDataSubject: Subject<any>;
    public addressGeneratedSubject: Subject<any>;
    public generalSettingsUpdateSubject: Subject<any>;
    public sharedSettingsUpdateSubject: Subject<any>;
    public coinsSettingsUpdateSubject: Subject<any>;
    public makeTransactionSubject: Subject<any>;
    public userRegisteringSubject: Subject<any>;
    public userSignUpSubject: Subject<any>;
    public userSignInSubject: Subject<any>;
    public recoverFromMnemonic: Subject<any>
    public getMnemonicSubject: Subject<any>;
    public getUsernameSubject: Subject<any>;
    public getPinSubject: Subject<any>;
    public setPinSubject: Subject<any>;
    public validatePinSubject: Subject<any>;
    public changePinSubject: Subject<any>;
    public changeUsernameSubject: Subject<any>;
    public changePasswordSubject: Subject<any>;
    public firebaseSubject: Subject<any>;

    constructor(
        private databaseService: DatabaseService,
        private electronService: ElectronService
    ) {
        this.firebaseSubject = new Subject();
        this.changePasswordSubject = new Subject();
        this.changeUsernameSubject = new Subject();
        this.changePinSubject = new Subject();
        this.validatePinSubject = new Subject();
        this.setPinSubject = new Subject();
        this.getPinSubject = new Subject();
        this.recoverFromMnemonic = new Subject();
        this.getMnemonicSubject = new Subject();
        this.userRegisteringSubject = new Subject();
        this.getUsernameSubject = new Subject();
        this.userSignInSubject = new Subject();
        this.userSignUpSubject = new Subject();
        this.makeTransactionSubject = new Subject();
        this.generalSettingsUpdateSubject = new Subject();
        this.coinsSettingsUpdateSubject = new Subject();
        this.sharedSettingsUpdateSubject = new Subject();
        this.privateDataSubject = new Subject();
        this.cryptoInfoSubject = new Subject();
        this.addressGeneratedSubject = new Subject();
    }

    setupWorker() {
        this.electronService.ipcRenderer.send('setupWorker');
        this.electronService.ipcRenderer.on('message-received', (event, arg) => {
            this.processMessages(arg);
        });
    }

    sendMessage(message) {
        const stringMessage = JSON.stringify(message);
        this.electronService.ipcRenderer.send('send-message', stringMessage);
    }

    checkIfUserExists(message) {
        const stringMessage = JSON.stringify(message);
        this.electronService.ipcRenderer.send('checkIfUserExists', stringMessage);
    }

    reloadDB() {
        this.electronService.ipcRenderer.send('reloadDB');
    }

    processMessages(msg) {
        const msgJSON = JSON.parse(msg);
        if (msgJSON.type === mqMessages.CryptoPricesSet || msgJSON.type === mqMessages.CryptoMiningFeesSet
            || msgJSON.type === mqMessages.CryptoInfoSet || msgJSON.type === mqMessages.ChartInfoSet
            || msgJSON.type === mqMessages.RippleMiningFeesSet) {
            this.reloadDB();
            this.cryptoInfoSubject.next(true);
        } else if (msgJSON.type === mqMessages.AddressesGenerated) {
            this.reloadDB();
        } else if (msgJSON.type === mqMessages.SignUpUser) {
            this.userSignUpSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.SignInUser) {
            this.userSignInSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.RecoverFromMnemonic) {
            this.recoverFromMnemonic.next(msgJSON);
        } else if (msgJSON.type === mqMessages.GetMnemonic) {
            this.getMnemonicSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.PinObtained) {
            this.getPinSubject.next({ msg: msgJSON, success: true });
        } else if (msgJSON.type === mqMessages.PinObtainingError) {
            this.getPinSubject.next({ msg: msgJSON, success: false });
        } else if (msgJSON.type === mqMessages.SetPin) {
            this.reloadDB();
            this.setPinSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.ChangePin) {
            this.reloadDB();
            this.changePinSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.ValidatePin) {
            this.validatePinSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.ChangeUsername) {
            this.reloadDB();
            this.changeUsernameSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.ChangePassword) {
            this.reloadDB();
            this.changePasswordSubject.next(msgJSON);
        } else if (msgJSON.type === mqMessages.BalancesSet) {
            this.reloadDB();
            this.privateDataSubject.next(true);
        } else if (msgJSON.type === mqMessages.RippleBalancesSet) {
            this.reloadDB();
            this.privateDataSubject.next(true);
        } else if (msgJSON.type === mqMessages.TransactionsSet) {
            this.reloadDB();
            this.privateDataSubject.next(true);
        } else if (msgJSON.type === mqMessages.RippleTransactionsSet) {
            this.reloadDB();
            this.privateDataSubject.next(true);
        } else if (msgJSON.type === mqMessages.AddressGenerated) {
            this.reloadDB();
            const addressObj = {
                name: msgJSON.name,
                addressBalance: msgJSON.addressBalance,
                addressType: msgJSON.addressType
            };
            this.addressGeneratedSubject.next(addressObj);
        } else if (msgJSON.type === mqMessages.AddressNotGenerated) {
            // handle address generation error
        } else if (msgJSON.type === mqMessages.TransactionSent) {
            const transactionObj = {
                sent: true,
                transaction: msgJSON.transaction
            };
            this.makeTransactionSubject.next(transactionObj);
        } else if (msgJSON.type === mqMessages.TransactionFailed) {
            const transactionObj = {
                sent: false,
                message: msgJSON.message
            };
            this.makeTransactionSubject.next(transactionObj);
        } else if (msgJSON.type === mqMessages.GeneralSettingsUpdateSuccess) {
            this.reloadDB();
            const updateInfo = {
                update: true
            };
            this.generalSettingsUpdateSubject.next(updateInfo);
        } else if (msgJSON.type === mqMessages.CoinsSettingsUpdateSuccess) {
            this.reloadDB();
            const updateInfo = {
                type: msgJSON.type,
                update: msgJSON.update
            };
            this.coinsSettingsUpdateSubject.next(updateInfo);
        } else if (msgJSON.type === mqMessages.PrivateKeyFound) {
            this.firebaseSubject.next({ msg: msgJSON.privateKey, success: true });
        } else if (msgJSON.type === mqMessages.PrivateKeyNotFound) {
            this.firebaseSubject.next({ msg: msgJSON.error, success: false });
        } else if (msgJSON.type === mqMessages.GetUSername) {
            this.getUsernameSubject.next(msgJSON);
        } else if(msgJSON.type === mqMessages.UserRegistering) {
            this.userRegisteringSubject.next(true);
        }
    }
}
