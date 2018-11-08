import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule  } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { AppComponent } from './app.component';
import { ShellComponent } from './components/shell/shell.component';
import { SignupComponent } from './components/pages/signup/signup.component';

import { AppSettings } from './app-settings.service';

import { MainPageComponent } from './components/pages/main-page/main-page.component';
import { MainRightBarComponent } from './components/pages/main-page/main-right-bar/main-right-bar.component';
import { CourseChart } from './components/pages/main-page/charts/course-chart.component';
import { MainChartComponent } from './components/pages/main-page/charts/main-chart.component';
import { PriceChart } from './components/pages/main-page/charts/price-chart.component';
import { SearchComponent } from './components/search/search.component';
import { SwitcherComponent } from './components/switcher/switcher.component';
import { OnOffSwitcherComponent } from './components/onoff-switcher/onoff-switcher.component';
import { PaginatorComponent } from './components/paginator/paginator.component';

import { AddressesPageComponent } from './components/pages/addresses-page/addresses-page.component';
import { AddressesInfoComponent } from './components/pages/addresses-page/addresses-info/addresses-info.component';

import { TransactionsComponent } from './components/pages/transactions-page/transactions-page.component';
import { TransactionsRightBarComponent } from './components/pages/transactions-page/transactions-right-bar/transactions-right-bar.component';

import { PricePageComponent } from './components/pages/price-page/price-page.component';
import { PriceRightBarComponent } from './components/pages/price-page/price-right-bar/price-right-bar.component';

import { TransferPageComponent } from './components/pages/transfer-page/transfer-page.component';

import { BackupPageComponent } from './components/pages/backup-wk-page/backup-wk-page.component';
import { BackupPopPhraseComponent } from './components/pages/backup-wk-page/backup-pop-phrase/backup-pop-phrase.component';
import { BackupWordsComponent } from './components/pages/backup-wk-page/backup-words/backup-words.component';

import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { RegisterPageComponent } from './components/pages/register-page/register-page.component';
import { RecoveryPageComponent } from './components/pages/recovery-page/recovery-page.component';

import { SettingsPageComponent } from './components/pages/settings-page/settings-page.component';
import { SettingsRightBarComponent } from './components/pages/settings-page/settings-right-bar/settings-right-bar.component';

import { SecurityPageComponent } from './components/pages/security-page/security-page.component';

import { ExchangePageComponent } from './components/pages/exchange-page/exchange-page.component';

import { MenuComponent } from './components/menu/menu.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';
import { NotifyRouteService } from './providers/notify-route.service';
import { AuthService } from './providers/auth.service';
import { AnimationService } from './providers/animation.service';

import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { TutorialPageComponent } from './components/pages/tutorial-page/tutorial-page.component';
import {DatabaseService} from './providers/database.service';
import {MessagingService} from './providers/messaging.service';
import {SharedService} from './providers/shared.service';
import { MomentModule } from 'ngx-moment';
export function highchartsFactory() {
  const hc = require('highcharts/highstock');
  const dd = require('highcharts/modules/exporting');
  dd(hc);
  return hc;
}
const Highcharts = require('highcharts');

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
    SignupComponent,
    MainPageComponent,
    AddressesPageComponent,
    AddressesInfoComponent,
    MainRightBarComponent,
    MainChartComponent,
    PriceChart,
    TransactionsComponent,
    TransactionsRightBarComponent,
    TransferPageComponent,
    PricePageComponent,
    PriceRightBarComponent,
    BackupPageComponent,
    BackupPopPhraseComponent,
    BackupWordsComponent,
    LoginPageComponent,
    RecoveryPageComponent,
    RegisterPageComponent,
    MenuComponent,
    CourseChart,
    SecurityPageComponent,
    SettingsPageComponent,
    SettingsRightBarComponent,
    SearchComponent,
    SwitcherComponent,
    OnOffSwitcherComponent,
    PaginatorComponent,
    ExchangePageComponent,
    TutorialPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ChartModule,
    NgSelectModule,
    VirtualScrollModule,
    MomentModule
  ],
  providers: [
    ElectronService,
    NotifyRouteService,
    AuthService,
    AnimationService,
    AppSettings,
    DatabaseService,
    MessagingService,
    SharedService,
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
