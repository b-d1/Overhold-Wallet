const db = require('./db');

async function getAddresses(coinName, client) {
    let addresses;
    await db.getDocument(coinName, client).then(async (result) => {
        if (!result) {
            return Promise.resolve(true);
        }
        addresses = result.internal.addresses.map(addr => addr.address);
    });
    return Promise.resolve(addresses);
}; 

async function getBalance(coinName, client) {
	let balances = 0;
    let Changebalances;
	await db.getDocument(coinName, client).then(async (result) => {
        if (!result) {
            return Promise.resolve(true);
        }
        for(let x = 0; x < result.internal.addresses; x++) {
            return balance + result.internal.addresses[x].balance;
        }
        Changebalances = result.change.balance ;
    });
    return Promise.resolve(balances ,Changebalances);
}

async function getPrivatekey(coinName, client) {
	let privatekeys;
	let wif;
    await db.getDocument(coinName, client).then(async (result) => {
        if (!result) {
            return Promise.resolve(true);
        }
		privatekeys = result.internal.addresses.map(addrObj => addrObj.privateKey);
        wif = result.internal.addresses.map(addrObj => addrObj.WIF);
		
    });
    return Promise.resolve(privatekeys);
}

module.exports = {
    getAddresses,
    getBalance,
    getPrivatekey
} 
