Overhold Wallet, Built using Maxim Gris Angular Electron project.

The Overhold  Wallet is a cryptocurrency wallet, it supports multiple cryptocurrencies and various features:
- send
- receive
- list transactions
- display prices

Different cryptocurrencies:
- Bitcoin
- Bitcoin Cash
- Litecoin
- Dash
- Ethereum
- Ethereum Classic
- Waves
- Counterparty
- Omnilayer
- Ripple

Everything is stored on user's machine, no private key or seed is sent to any server.

---

You can find the application binaries as well as installation packages for each OS accordingly, and download them from the Releases tab.

---

### Development

For running the wallet in development mode, you will need to install some dependencies first. 

You need to have node v8 installed (preferably 8.10 or higher) and npm.
You also need Python v2.7 installed on your machine.


#### Install dependencies 

##### Windows

`npm i -g npm`

`npm install -g windows-build-tools`

`npm install -g typescript`

##### Linux and Mac

`sudo apt-get install libpng-dev`

`npm i -g npm`

`npm install -g typescript`


After having these packages installed, you should be ready for installing the wallet.

#### Wallet installation instructions

1. Create a new directory on your machine and ` cd <directory-name> `
2. `git clone https://github.com/overhold-org/Overhold-Wallet.git .`
3. `npm install`
4. `cd backend/`
5. `npm install`

--- 

#### Wallet running instructions

Instructions for running the wallet, in development mode:

1. Change directory to the project directory and open new terminal window, then run: `npm start`
2. Change directory to `<project-directory>/backend` and run: `npm start`
3. Chage directory back to the project directory and run: `npm run electron:serve`

#### Wallet building instructions

Firstly, you will have to build the backend using the [pkg](https://www.npmjs.com/package/pkg) npm module, for the desired platform. After that you should run `npm run electron:$OS`, where $OS is either `linux`, `windows` or `mac` (depending for which platform you're building it).

### Contributions

Contributions of any kind are highly appreciated. Please read our [countribution guide](https://github.com/overhold-org/Overhold-Wallet/blob/master/CONTRIBUTING.md) and our [code of conduct](https://github.com/overhold-org/Overhold-Wallet/blob/master/CODE_OF_CONDUCT.md).

### License

This project is licensed under GNU GENERAL PUBLIC LICENSE. Please check LICENSE.md for more details.
