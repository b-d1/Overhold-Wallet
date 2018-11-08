import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';
import { AppComponent } from '../../../app.component';
import { NotifyRouteService } from '../../../providers/notify-route.service';

@Component({
    selector: 'security',
    templateUrl: './security-page.component.html',
    host: {
        class: 'view'
    },
    styleUrls: ['./security-page.component.scss'],
})

export class SecurityPageComponent implements OnInit {

    @Input() callback;
    @Output() closeSecurity = new EventEmitter();

    @ViewChild(AppComponent)
    private subscription: Subscription;
    @ViewChild('video')
    video: any;

    errorMessage: string;
    pinMessage: string = 'Obtaining pin. Please wait...';
    obtainError: boolean = false;

    constructor(
        private el: ElementRef,
        private notifyRouteService: NotifyRouteService,
        private app: AppComponent
    ) { }

    ngOnInit() {
        $(this.el.nativeElement).addClass('fadeIn animated speed700');

        this.subscription = this.notifyRouteService.notifyObservable$.subscribe((res) => {
            if (res.hasOwnProperty('option') && res.option === 'animateDestroy') {
                $(this.el.nativeElement).addClass('fadeOutRight animated speed700');
            }
        });
    }

    onSuccess() {
        this.notifyRouteService.notifyOther({ option: this.callback, value: '' });
        this.onClose();
    }

    onIncorrect() {
        this.pinMessage = 'Incorrect pin!';
        this.video.nativeElement.play();
    }

    onObtainPinEvent(message) {
        this.obtainError = true;
        this.pinMessage = message.msg;
        if (message.video)
            this.video.nativeElement.play();
    }

    onClose() {
        $(this.el.nativeElement).addClass('fadeOut animated');
        setTimeout(() => {
            this.closeSecurity.emit();
        }, 500);
    }

}
