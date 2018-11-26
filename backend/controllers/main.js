let db = require('../db/db');
let messagingService = require('../services/messaging');
let publicService = require('../services/public');
let privateService = require('../services/private');
let settingsService = require('../services/settings');
let utils = require('../data/utils');
let rippleService = require ('../services/ripple/websocket');
let rippleProviders = require('../providers/ripple');
let settings = require('../data/settings');


async function setInitialPublicData() {
    await publicService.initialSetup(utils.dbNames.global).then(result => {
        return Promise.resolve(true);
    });
    await settingsService.setSettings(settings.settingsKeys.generalSettings);
    await settingsService.setSettings(settings.settingsKeys.coinsSettings);
    return Promise.resolve(true);
}

async function getPublicData() {

    let coinsSettings = settingsService.getCoinsSettings();

    if (coinsSettings) {
        // let client = utils.dbNames.global;
        let ipc = messagingService.getIPCDetails();
        if(ipc.socket) {
            publicService.getPrices(ipc, coinsSettings).then();
            publicService.getMiningFees(ipc, coinsSettings).then();
            publicService.getCryptoInfo(ipc, coinsSettings).then();
            if (coinsSettings.Ripple) {
                rippleService.getMiningFees();
            }
        }
    }

    return Promise.resolve(true);
}

async function getPrivateData() {

    let coinsSettings = settingsService.getCoinsSettings();
    let client = utils.dbNames.user;
    let ipc = messagingService.getIPCDetails();

    await privateService.getBalances(client, ipc, coinsSettings);
    await privateService.getTransactions(client, ipc, coinsSettings);
    return Promise.resolve(true);
}

async function getData() {
    // console.log("GETTING DATA");
    await setInitialPublicData();
    messagingService.setPubDataIntervalFlag();
    getPublicData();
    rippleService.setPublicData(rippleProviders.rippleS2.websocket, messagingService.getIPCDetails());

}

// We use this method getting data for resolve issue with async store/load data.
// Probably we should resolve this issue using another way during refactor process.

function start() {
    getData();
    messagingService.setDataObtainingFns(getPublicData, getPrivateData);
    messagingService.setupMessaging();
}

module.exports = {
    start
};