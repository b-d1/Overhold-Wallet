import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { NotifyRouteService } from '../../providers/notify-route.service';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/filter';

import { filter } from 'rxjs/operators';

@Component({
    selector: 'shell',
    templateUrl: './shell.component.html',
    styleUrls: [
        './shell.component.scss'
    ],
    host: {
        '[class.alternative-background]': 'alternativeBackground'
    },
    // animations: [routerTransition]
})

export class ShellComponent {
    secuirityOn = false;
    callback: any;
    private subscription: Subscription;
    private alternativeBackground: boolean;
    constructor(
        notifyRouteService: NotifyRouteService,
        router: Router) {
        this.subscription = notifyRouteService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'securityCall' && res.hasOwnProperty('value')) {
                this.secuirityOn = true;
                this.callback = res.value;
            }
        });
        router.events.pipe(
            filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.alternativeBackground = event.url === '/app/transfer' || event.url === '/app/exchange';
            });
    }

    public getState(outlet: RouterOutlet): string {
        return outlet.activatedRouteData.state;
    }
    closeSecurity() {
        this.secuirityOn = false;
    }
}