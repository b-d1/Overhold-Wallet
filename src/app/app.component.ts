import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SharedService } from './providers/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { dbPrivateKeys } from './enums/common';
import { AuthService } from './providers/auth.service';
import { DatabaseService } from './providers/database.service';

import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public disableIntro: boolean = false;

  private settingsSubscription: Subscription;
  private eventsSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService,
    private databaseService: DatabaseService,
    private ref: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.settingsSubscription = this.databaseService.settingsSubject.subscribe(result => {
      if (result.type === dbPrivateKeys.generalSettings) {
        this.disableIntro = result.settings.disableIntro;

        if (this.disableIntro) {
          const introVideo: HTMLMediaElement = document.getElementById('intro_video') as HTMLMediaElement;
          introVideo.currentTime = 3.8;
        }

        this.ref.detectChanges();
      }
    });

    this.eventsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(e => {
        const event = <any>e;
        if (event.url === '/signup') {
          this.authService.logout();
        }
      });

      this.goToSignup();
  }

  goToSignup(): void {
    this.disableIntro = true;
    this.settingsSubscription.unsubscribe();
    this.router.navigate(['/signup']);
  }

}
