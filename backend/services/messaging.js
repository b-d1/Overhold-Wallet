let auth = require('./auth');
let messages = require('../data/messages');
let privateData = require('../data/private');
let settings = require('../data/settings');
let userService = require('./user');

let privateService = require('./private');
let publicService = require('./public');
let rippleService = require('./ripple/websocket');
let settingsService = require('./settings');
let utils = require('../helpers/utils');
let generateAddressesUtils = require('../helpers/generateAddresses');
let dataUtils = require('../data/utils');
let ipc = require('node-ipc');
// Used for setting up message queue connection and communication.
let ipcServer;
let ipcSocket;

// Flag to avoid closing queue on previous interrupts. Example: if backend is closed before frontend in previous run (because of some kind of interrupt), in the next run the backend will receive the close message from frontend, and the frontend will continue to run!
let publicInitialDataSet = false;

// Used for setting and clearing interval for public and private data gathering, according to apiRefreshRate setting.
let publicDataInterval;
let privateDataInterval;
let chartDataInterval;

// Functions for obtaining private and public data.
let getPrivateData;
let getPublicData;

function getIPCDetails() {
    return {server: ipcServer, socket: ipcSocket};
}

function setPrivateDataInterval() {
  let refreshRate = settingsService.getApiRefreshRate();

    if (privateDataInterval) {
        clearInterval(privateDataInterval);
    }
    getPrivateData();
    privateDataInterval = setInterval(() => {
        getPrivateData();
    }, refreshRate);
}

function setPublicDataInterval() {
  let refreshRate = settingsService.getApiRefreshRate();

  if (publicDataInterval) {
    clearInterval(publicDataInterval);
  }

    getPublicData();
    publicDataInterval = setInterval(() => {
        getPublicData();
    }, refreshRate);

}

function setChartDataInterval() {
  if (chartDataInterval) {
    clearInterval(chartDataInterval);
  }

  let coinSettings = settingsService.getCoinsSettings();
  let ipc = getIPCDetails();

  publicService.getChartData(coinSettings, ipc);
  chartDataInterval = setInterval(() => {
    publicService.getChartData(coinSettings, ipc);
  }, 600000);
}

function setDataObtainingFns(getPubData, getPrivData) {
    getPublicData = getPubData;
    getPrivateData = getPrivData;
}

function setPubDataIntervalFlag() {
    publicInitialDataSet = true;
}

function setupMessaging() {
    ipc.config.id = "backend";

    ipc.config.retry= 500;
    ipc.serve(
        function(){
            ipc.server.on(
                'message',
                function(data,socket){
                    ipcSocket = socket;
                    processMessages(data);
                });
        }
    );
    ipc.server.start();
    ipcServer = ipc.server;

}

async function processMessages(msg, next) {
    let jsonMsg = JSON.parse(msg);
    switch (jsonMsg.type) {
        case messages.events.initUser:
            userInitialSetup();
            break;
        case messages.events.closeConnection:
            await closeConnection();
            break;
        case messages.events.logoutUser:
            logout();
            break;
        case messages.events.generateAddress:
            await generateAddress(jsonMsg);
            break;
        case messages.events.makeTransaction:
            makeTransaction(jsonMsg);
            break;
        case messages.events.generalSettingsUpdate:
            updateGeneralSettings(jsonMsg);
            break;
        case messages.events.coinsSettingsUpdate:
            updateSettings(jsonMsg);
            break;
        case messages.events.signUpUser:
            signUp(jsonMsg);
            break;
        case messages.events.signInUser:
            await signIn(jsonMsg);
            break;
        case messages.events.changeUsername:
            changeUsername(jsonMsg);
            break;
        case messages.events.changePassword:
            changePassword(jsonMsg);
            break;
        case messages.events.recoverFromMnemonic:
            recoverFromMnemonic(jsonMsg);
            break;
        case messages.events.getMnemonic:
            getMnemonic();
            break;
        case messages.events.getPrivateKey:
            getPrivateKey(jsonMsg);
            break;
        case messages.events.getUsername:
            getUsername();
            break;
        default: break;
    }
}

async function userInitialSetup() {

    setPublicDataInterval();
    setChartDataInterval();

    await privateService.setupPublicUserInfo().then(result => {
        return Promise.resolve(true);
    });

    await privateService.setupPrivateUserInfo().then(result => {
        return Promise.resolve(true);
    });

    await privateService.generateAddresses(getIPCDetails());
    setPrivateDataInterval();

}

async function closeConnection() {
  if (publicDataInterval) {
    clearInterval(publicDataInterval);
  }

  if (privateDataInterval) {
    clearInterval(privateDataInterval);
  }

  ipcServer.stop();
  process.exit();
}

function logout() {
  if (privateDataInterval) {
    clearInterval(privateDataInterval);
  }
  if (publicDataInterval) {
    clearInterval(publicDataInterval);
  }
}

async function generateAddress(msg) {
  await generateAddressesUtils
    .generateNewAddress(msg.name, dataUtils.coinDataTypes[msg.addressType])
    .then(result => {
      let addressBalance = result;

        let returnMsg;
        if (addressBalance) {
            returnMsg = {
                type: messages.events.addressGenerated,
                name: msg.name,
                addressBalance: addressBalance,
                addressType: msg.addressType
            };
        } else {
            returnMsg = {
                type: messages.events.addressNotGenerated,
                name: msg.name,
            };
        }


      utils.sendMessage(returnMsg, getIPCDetails());
      return Promise.resolve(true);
    });
}

function makeTransaction(msg) {
    let client = dataUtils.dbNames.user;
    if (msg.transactionInfo.name !== dataUtils.cryptoCurrencyKeys.ripple) {
        privateService.makeTransaction(msg.transactionInfo, client, getIPCDetails());
    } else {
        rippleService.makeTransaction(msg.transactionInfo, getIPCDetails());
    }
}

function createSuccessCallback(msg, fields, resultKey) {
  return result => {
    let keys = Object.keys(fields);
    for (let i = 0; i < keys.length; i++) {
      let currKey = keys[i];
      msg[currKey] = fields[currKey];
    }
    msg[resultKey] = result;
    utils.sendMessage(msg, getIPCDetails());
  };
}

function createErrorCallback(msg, errorArg) {
  return error => {
    msg.error = errorArg !== undefined ? errorArg : error;
    utils.sendMessage(msg, getIPCDetails());
  };
}

function updateSettings(msg) {
    let returnMsgType;
    returnMsgType = messages.events.coinsSettingsUpdateSuccess;

    let returnMsg = {
        type: returnMsgType
    };

    let successCallback = createSuccessCallback(returnMsg, {}, 'update');
    settingsService.updateSettings(settings.settingsKeys.coinsSettings, msg.obj).then(successCallback);
}

function updateGeneralSettings(msg) {
    settingsService.updateSettings(settings.settingsKeys.generalSettings, msg.obj).then(result => {
        let returnMsg = {
            type: messages.events.generalSettingsUpdateSuccess,
            update: true
        };
        utils.sendMessage(returnMsg, getIPCDetails());
        if (result.refreshRateUpdate) {
            setPublicDataInterval();
            setPrivateDataInterval();
        }
    });
}

async function signUp(msg) {
    let returnMsg = {
        type: messages.events.signUpUser
    };

    let successCallback = createSuccessCallback(returnMsg, { result: true }, 'userId');
    let errorCallback = createErrorCallback(returnMsg);

    await auth.register(msg.username, msg.password, msg.confirmPassword)
        .then(successCallback)
        .catch(errorCallback);
}

async function signIn(msg) {
    let returnMsg = {
        type: messages.events.signInUser
    };

    let successCallback = createSuccessCallback(returnMsg, { result: true }, 'userId');
    let errorCallback = createErrorCallback(returnMsg);
    await auth.login(msg.username, msg.password)
        .then(successCallback)
        .catch(errorCallback);
}

function changeUsername(msg) {
  let returnMsg = {
    type: messages.events.changeUsername,
    username: msg.newUsername
  };
  let successCallback = createSuccessCallback(returnMsg, {}, "done");
  let errorCallback = createErrorCallback(returnMsg);
  userService
    .changeUsername(msg.oldUsername, msg.newUsername, msg.password)
    .then(successCallback)
    .catch(errorCallback);
}

function changePassword(msg) {
  let returnMsg = {
    type: messages.events.changePassword
  };
  let successCallback = createSuccessCallback(returnMsg, {}, "done");
  let errorCallback = createErrorCallback(returnMsg);
  userService
    .changePassword(msg.oldPassword, msg.newPassword, msg.confirmNewPassword)
    .then(successCallback)
    .catch(errorCallback);
}

async function recoverFromMnemonic(msg) {
  let returnMsg = {
    type: messages.events.recoverFromMnemonic
  };

  let successCallback = createSuccessCallback(
    returnMsg,
    { result: true },
    "userId"
  );
  let errorCallback = createErrorCallback(returnMsg);

  await auth
    .register(privateData.dummyRegisterData.username, privateData.dummyRegisterData.password, privateData.dummyRegisterData.password, msg.mnemonic)
    .then(successCallback)
    .catch(errorCallback);
}

function getMnemonic() {
    let returnMsg = {
        type: messages.events.getMnemonic
    };
    let successCallback = createSuccessCallback(returnMsg, {}, 'mnemonic');
    let errorCallback = createErrorCallback(returnMsg);
    userService.getMnemonic()
        .then(successCallback)
        .catch(errorCallback);
}

function getPrivateKey(msg) {
    let returnMsg = {
        type: messages.events.privateKeyFound
    };

  let errorReturnMsg = {
    type: messages.events.privateKeyNotFound
  };

  let successCallback = createSuccessCallback(returnMsg, {}, "privateKey");
  let errorCallback = createErrorCallback(
    errorReturnMsg,
    messages.generalErrors.privateKeyError
  );

  userService
    .getPrivateAddressData(
      msg.address,
      msg.coinName,
      msg.coinType,
      privateData.dataKeys.privateKeyString
    )
    .then(successCallback)
    .catch(errorCallback);
}

function getUsername() {
  let returnMsg = {
    type: messages.events.getUsername
  };
  let successCallback = createSuccessCallback(returnMsg, {}, "username");
  let errorCallback = createErrorCallback(returnMsg);
  userService
    .getUsername()
    .then(successCallback)
    .catch(errorCallback);
}

module.exports = {
  setupMessaging,
  getIPCDetails,
  setDataObtainingFns,
  setPubDataIntervalFlag
};
