import { MainPageComponent } from './components/pages/main-page/main-page.component';
import { AddressesPageComponent } from './components/pages/addresses-page/addresses-page.component';
import { TransactionsComponent } from './components/pages/transactions-page/transactions-page.component';
import { PricePageComponent } from './components/pages/price-page/price-page.component';
import { TransferPageComponent } from './components/pages/transfer-page/transfer-page.component';
import { BackupPageComponent } from './components/pages/backup-wk-page/backup-wk-page.component';
import { BackupPopPhraseComponent } from './components/pages/backup-wk-page/backup-pop-phrase/backup-pop-phrase.component';
import { BackupWordsComponent } from './components/pages/backup-wk-page/backup-words/backup-words.component';
import { SettingsPageComponent } from './components/pages/settings-page/settings-page.component';
import { ExchangePageComponent } from './components/pages/exchange-page/exchange-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorialPageComponent } from './components/pages/tutorial-page/tutorial-page.component';
import { ShellComponent } from './components/shell/shell.component';
import { SignupComponent } from './components/pages/signup/signup.component';

const routes: Routes = [
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'tutorial',
        component: TutorialPageComponent,
        data: { state: '' }
    },
    {
        path: 'app',
        component: ShellComponent,
        children: [
            {
                path: 'main',
                component: MainPageComponent,
                data: { state: 'main' }
            },
            {
                path: 'transactions',
                component: TransactionsComponent,
                data: { state: 'transactions' }
            },
            {
                path: 'transactions/:filter',
                component: TransactionsComponent,
                data: { state: 'transactions' }
            },
            {
                path: 'addresses',
                component: AddressesPageComponent,
                data: { state: 'addresses' }
            },
            {
                path: 'price',
                component: PricePageComponent,
                data: { state: 'price' }
            },
            {
                path: 'transfer/:crypto',
                component: TransferPageComponent,
                data: { state: 'transfer' }
            },
            {
                path: 'backup-wk',
                component: BackupPageComponent,
                data: { state: 'backup-wk' }
            },
            {
                path: 'backup-pop-phrase',
                component: BackupPopPhraseComponent,
                data: { state: 'backup-pop-phras' }
            },
            {
                path: 'backup-words',
                component: BackupWordsComponent,
                data: { state: 'backup-words' }
            },
            {
                path: 'settings',
                component: SettingsPageComponent,
                data: { state: 'settings' }
            },
            {
                path: 'exchange',
                component: ExchangePageComponent,
                data: { state: 'exchange' }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
