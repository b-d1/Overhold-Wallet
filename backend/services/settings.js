let db = require('../db/db');
let settingsData = require('../data/settings');
let utils = require('../data/utils');

let settings = {
    coinsSettings: {},
    generalSettings: {},
    refreshRate: utils.apiRefreshRates['1']
};

async function setSettings(key) {
    let settings;
    let tmpSettings;
    let setSettingsFn;

    if (key === settingsData.settingsKeys.coinsSettings) {
        tmpSettings = settingsData.coinsSettings;
        setSettingsFn = setAppSettings.coinsSettings;
    } else if (key === settingsData.settingsKeys.generalSettings) {
        tmpSettings = settingsData.generalSettings;
        setSettingsFn = setAppSettings.generalSettings;
    }

    let client = utils.dbNames.user;
    await db.getDocument(key, client).then(async (result) => {
        settings = result;
        if (result === null || result === undefined) {
            settings = tmpSettings;
            settings.name = key;
            await db.setDocument(settings, client).then(result => {
                return Promise.resolve(true);
            });
        }
        return Promise.resolve(true);
    });

    if (settings) {
        setSettingsFn(settings);
    }
}

async function updateSettings(name, settings) {
    let client = utils.dbNames.user;
    let error = false;
    settings.name = name;
    await db.updateDocument(name, settings, client).then(result => {
        return Promise.resolve(true);
    }, err => {
        error = true;
        return Promise.resolve(true);
    });

    let result;
    let setSettingsFn;
    if (name === settingsData.settingsKeys.generalSettings) {
        result = {
            refreshRateUpdate: false
        };
        setSettingsFn = setAppSettings.generalSettings;
    } else if (name=== settingsData.settingsKeys.coinsSettings) {
        result = settings;
        setSettingsFn = setAppSettings.coinsSettings;
    }

    if (!error) {
        if (name !== settingsData.settingsKeys.generalSettings) {
            setSettingsFn(settings);
        } else {
            result.refreshRateUpdate = setSettingsFn(settings);
        }
    }
    return Promise.resolve(result);
}

function getCoinsSettings() {
    return settings.coinsSettings;
}

function getApiRefreshRate() {
    return settings.refreshRate;
}

function setAppCoinsSettings(coinsSettings) {
    settings.coinsSettings = coinsSettings;
}

function setAppGeneralSettings(generalSettings) {
    settings.generalSettings = generalSettings;
    let newRefreshRate = utils.apiRefreshRates[generalSettings.refreshRate];

    let refreshRateUpdate = false;
    if (settings.refreshRate !== newRefreshRate) {
        refreshRateUpdate = true;
        settings.refreshRate = newRefreshRate;
    }
    return refreshRateUpdate;
}


let setAppSettings = {
    generalSettings: setAppGeneralSettings,
    coinsSettings: setAppCoinsSettings
};

module.exports = {
    getCoinsSettings,
    getApiRefreshRate,
    setSettings,
    updateSettings
};