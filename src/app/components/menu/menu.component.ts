import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {AuthService} from '../../providers/auth.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: [
		'./menu.component.scss'
	],
	host: {
		'[class.alternative-menu]': 'alternativeMenu'
	},
})

export class MenuComponent {
	private alternativeMenu: boolean;

	constructor(
		private location: Location,
		private router: Router,
		private authService: AuthService
	) {
		router.events.pipe(
			filter(event => event instanceof NavigationEnd))
			.subscribe((event: NavigationEnd) => {
				this.alternativeMenu = event.url === '/app/transfer' || event.url === '/app/exchange';
			});
	}

	backClicked() {
		this.location.back();
	}

    signOut() {
        this.authService.logout();
        this.router.navigate(['/signup']);
    }

}
