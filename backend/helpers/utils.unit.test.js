const utils = require('./utils');
const errorMessages  = require('../data/messages').generalErrors;

describe("encryptMnemonic tests", () => { 
    let secretKey = "test";
    let mnemonic = "test";

    test("encryptMnemonic should throw error when mnemonic argument is invalid", () => {

        expect(() => {utils.encryptMnemonic(null, secretKey)}).toThrow(errorMessages.invalidMnemonic);
        expect(() => {utils.encryptMnemonic(undefined, secretKey)}).toThrow(errorMessages.invalidMnemonic);
        expect(() => {utils.encryptMnemonic({}, secretKey)}).toThrow(errorMessages.invalidMnemonic);
        expect(() => {utils.encryptMnemonic(5, secretKey)}).toThrow(errorMessages.invalidMnemonic);
        expect(() => {utils.encryptMnemonic()}).toThrow(errorMessages.invalidMnemonic);

    });
});