import { app, BrowserWindow, ipcMain, Menu, session, dialog} from 'electron';
let cmd = require('node-cmd');


const db = require('./backend/db/db.js');
const backend = require('./backend/controllers/main.js');
const dataUtils = require('./backend/data/utils.js');
const ipc = require('node-ipc');
let sender;


const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const createMenu = () => {
    const template = [
        {
            label: "Application",
            submenu: [
                { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
            ]
        },
        {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(<any>template));
};

const createWindow = () => {
    win = new BrowserWindow({
        show: false,
        backgroundColor: 'black',
        center: true,
        width: 1440,
        height: 810,
        maxWidth: 2880,
        maxHeight: 1440,
        minWidth: 1440,
        minHeight: 810
    });

    win.loadURL(`file://${__dirname}/index.html`);


    if (serve) {
        win.webContents.openDevTools();
    }

    win.webContents.on('did-finish-load', () => {
        if (!win) {
            throw new Error('"mainWindow" is not defined');
        }
        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['Origin'] = 'http://localhost';
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
        win.show();
        win.focus();
    });

    win.on('closed', () => { win = null });

    createMenu();

};


const setIPC = () => {

    ipcMain.on('reloadDB', (event) => {
            event.sender.send('DBReloaded', 'true')
    });

    ipcMain.on('setupClient', (event, arg) => {
            event.sender.send('clientSet', 'true')
    });

    ipcMain.on('readPublicData', (event, arg) => {
        db.getDocument(arg, dataUtils.dbNames.global).then(result => {
            event.sender.send('publicDataRead', [arg, result])
        });
    });

    ipcMain.on('readCurrentUser', (event, arg) => {
        db.getDocument(dataUtils.userInfo.name, dataUtils.dbNames.private).then(result => {
            let resultObj = {
              username: result.username
            };
            event.sender.send('currentUserRead', [arg, resultObj])
        });
    });

    ipcMain.on('readSettings', (event, arg) => {
        db.getDocument(arg, dataUtils.dbNames.user).then(result => {
            event.sender.send('settingsRead', [arg, result])
        });
    });

    ipcMain.on('readPrivateData', (event, arg) => {
        db.getDocument(arg, dataUtils.dbNames.user).then(result => {
            event.sender.send('privateDataRead', [arg, result])
        });

    });

    ipcMain.on('checkIfUserExists', (event, arg) => {
        db.getDocument(dataUtils.userInfo.name, dataUtils.dbNames.private).then(result => {
           if (result && result.username) {
            dialog.showMessageBox({
                type:"warning",
                buttons:["Proceed", "Cancel"],
                defaultId: 1,
                title: "User already registered",
                message: "There is user already registered user on this device. Proceeding further will delete all the user data stored on this device - sensitive data as well. Are you sure that you want to proceed further?",
                cancelId: 1
            }, (response, checkboxChecked) => {
               if(response === 0) {
                   sendMessage(arg);
               } else if(response === 1) {
                   processMessages(JSON.stringify({type: 'userRegistering'}));
               }
            });
           } else {
               sendMessage(arg);
           }
        });
    });


};

const setMessaging = () => {
    ipcMain.on('setupWorker', (event, arg) => {
        setupWorker();
        sender = event.sender;
    });

    ipcMain.on('send-message', (event, arg) => {
        sendMessage(arg);
    });
};

const setupWorker = () => {
    ipc.config.id = 'frontend';
    ipc.config.retry = 500;

    ipc.connectTo(
        'backend',
        function() {
            ipc.of.backend.on(
                'connect',
                function() {
                }
            );
            ipc.of.backend.on(
                'message',
                function(data) {
                    processMessages(data);
                }
            );
        }
    );
};


const sendMessage = (message) => {
    ipc.of.backend.emit('message', message);
};


const processMessages = (msg) => {
    sender.send("message-received", msg);
};

const closeConnection = () => {

    let message = {
        type: 'closeConnection'
    };

    sendMessage(JSON.stringify(message));
};


let win;

if (serve) {
    require('electron-reload')(__dirname, {
    });
}

app.on('window-all-closed', () => {
    closeConnection();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
app.on('ready', () => {


    db.createDB().then(res => {
        backend.start();
        createWindow();
        setIPC();
        setMessaging();
    });

});
