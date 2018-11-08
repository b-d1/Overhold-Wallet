import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimationService } from '../../../providers/animation.service';
import { AuthService } from '../../../providers/auth.service';
import { MessagingService } from '../../../providers/messaging.service';
import { combineErrors } from '../../../utils/combineErrors';
import {Subscription} from 'rxjs/Rx';



const bip39 = require('bip39');
@Component({
    selector: 'register',
    templateUrl: './register-page.component.html',
    styleUrls: [
        './register-page.component.scss'
    ],
    host: {
        class: 'view'
    }
})

export class RegisterPageComponent implements OnInit, OnDestroy {
    incorrect = false;

    @Output() onLogin = new EventEmitter();
    username: string;
    password: string;
    confirmPassword: string;
    registering = false;
    errorMessages = [];
    private userRegisteringSubscription: Subscription;


    errorMap = {
        username: {
            required: "Enter your username",
            minlength: "Username must be at least 3 characters long"
        },
        password: {
            required: "Enter your password"
        },
        confirmPassword: {
            required: "Enter your confirm password"
        }
    };

    constructor(public authService: AuthService,
        public animationService: AnimationService,
        private router: Router,
        private messagingService: MessagingService,
        private ref: ChangeDetectorRef) {
        }

    register(form: NgForm): void {
        this.registering = true;
        if (form.invalid) {
            const errors = combineErrors(form, this.errorMap);
            this.errorMessages = errors;
            this.onLogin.emit({ success: false, errors: errors });
            this.registering = false;
            return;
        } else if (this.password !== this.confirmPassword) {
            this.errorMessages = ["The passwords don't match"];
            this.onLogin.emit({ success: false, errors: this.errorMessages });
            this.registering = false;
            return;
        }

        this.authService.register(this.username, this.password, this.confirmPassword);
        this.messagingService.userSignUpSubject.subscribe(res => {
            if (res.error) {
                this.registering = false;
                this.errorMessages = [res.error];
                this.onLogin.emit({ success: false, errors: [res.error] });
            }
            else if (res.result) {
                this.onLogin.emit({ success: true, status: 'register', userId: res.userId });
            }
        });
    }

    ngOnInit() {
        this.userRegisteringSubscription = this.messagingService.userRegisteringSubject.subscribe(result => {

            if (result) {
                this.registering = false;
                this.ref.detectChanges();
            }
        });
    }

    ngOnDestroy() {
        this.userRegisteringSubscription.unsubscribe();
    }


    openTutorial() {
        this.router.navigate(['/tutorial']);
    };
}
