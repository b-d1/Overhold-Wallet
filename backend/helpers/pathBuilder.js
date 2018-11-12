// We use custom path builder because we cannot use electron-api this.
const path = require('path');
let unixDir = process.env.HOME;
let windowsDir = process.env.APPDATA;

function getPath() {
	let newPath = '';

	switch (process.platform) {
	case 'darwin':
		newPath = path.join(`${unixDir}`, 'Library', 'Application Support');
		break;

	case 'linux':
		newPath = path.join(`${unixDir}`, '.config');
		break;

	case 'win32':
		newPath = windowsDir;
		break;

	default:
		throw new Error('Unknown platform', process.platform);
	}

	return newPath;
}

module.exports = {
	getPath
};