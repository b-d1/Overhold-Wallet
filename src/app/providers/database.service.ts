import { Injectable } from '@angular/core';
import { Subject } from '../../../node_modules/rxjs';
import { ElectronService } from './electron.service';


@Injectable()
export class DatabaseService {

    public cryptoInfoSubject: Subject<any>;
    public settingsSubject: Subject<any>;
    public privateDataSubject: Subject<any>;
    public currentUserSubject: Subject<any>;
    public clientSetSubject: Subject<any>;

    constructor(private electronService: ElectronService) {
        this.cryptoInfoSubject = new Subject();
        this.settingsSubject = new Subject();
        this.privateDataSubject = new Subject();
        this.currentUserSubject = new Subject();
        this.clientSetSubject = new Subject();
    }

    createClient() {
        this.electronService.ipcRenderer.send('setupClient');
    }

    readPublicData(key) {
        this.electronService.ipcRenderer.send('readPublicData', key);
    }

    readSettings(key) {
        this.electronService.ipcRenderer.send('readSettings', key);
    }

    readPrivateData(key) {
        this.electronService.ipcRenderer.send('readPrivateData', key);
    }

    readCurrentUser(key) {
        this.electronService.ipcRenderer.send('readCurrentUser', key);
    }

    setListeners() {
        const self = this;
        this.electronService.ipcRenderer.on('publicDataRead', (event, arg) => {
            if (self.cryptoInfoSubject && arg[1]) {
                self.cryptoInfoSubject.next(arg[1]);
            }
        });

        this.electronService.ipcRenderer.on('currentUserRead', (event, arg) => {
            if (self.currentUserSubject && arg[1]) {
                self.currentUserSubject.next(arg[1]);
            }
        });

        this.electronService.ipcRenderer.on('settingsRead', (event, arg) => {
            if (self.settingsSubject && arg[1]) {
                self.settingsSubject.next({ type: arg[0], settings: arg[1] });
            }
        });

        this.electronService.ipcRenderer.on('privateDataRead', (event, arg) => {
            if (self.privateDataSubject && arg[1]) {
                self.privateDataSubject.next(arg[1]);
            }
        });

        this.electronService.ipcRenderer.on('clientSet', (event, arg) => {
            if (self.clientSetSubject && arg) {
                self.clientSetSubject.next(true);
            }
        });
    }
}
