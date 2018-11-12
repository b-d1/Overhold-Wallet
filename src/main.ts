import "./css/styles.scss";
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from 'environments';

// Remove the security warnings about Content policy - not imposing security issues for our project anyways.
window['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  preserveWhitespaces: false
}).catch(err => console.error(err));
