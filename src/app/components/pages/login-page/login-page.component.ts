import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AnimationService } from '../../../providers/animation.service';
import { AuthService } from '../../../providers/auth.service';
import { MessagingService } from '../../../providers/messaging.service';
import { combineErrors } from '../../../utils/combineErrors';
import {errorMessages} from '../../../enums/common';



@Component({
    selector: 'login',
    templateUrl: './login-page.component.html',
    styleUrls: [
        './login-page.component.scss'
    ],
    host: {
        class: 'view'
    }
})

export class LoginPageComponent implements OnInit, OnDestroy {
    
    @Output() onLogin = new EventEmitter();

    username: string;
    password: string;
    loginIn: boolean = false;
    errorMessages = [];

    private subscription: Subscription;

    constructor(
        public authService: AuthService,
        public animationService: AnimationService,
        private messagingService: MessagingService,
        private router: Router
    ) { }

    ngOnInit() {
        this.subscription = this.messagingService.userSignInSubject.subscribe(res => {
            if (res.error) {
                this.loginIn = false;
                this.errorMessages = [res.error];
                this.onLogin.emit({ success: false, errors: [res.error] });
            }
            else if (res.result) {
                this.onLogin.emit({ success: true, status: 'login', userId: res.userId });
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    errorMap = {
        username: {
            required: "Enter your username",
            minlength: "Username must be at least 3 characters long"
        },
        password: {
            required: "Enter your password"
        }
    };

    openTutorial() {
        this.router.navigate(['/tutorial']);
    };

    login(form: NgForm) {
        this.loginIn = true;
        if (form.invalid) {
            const errors = combineErrors(form, this.errorMap);
            this.errorMessages = errors;
            this.onLogin.emit({
                success: false,
                errors: errors
            });
            this.loginIn = false;
            return;
        }
        this.authService.login(this.username, this.password);     
    }
}
