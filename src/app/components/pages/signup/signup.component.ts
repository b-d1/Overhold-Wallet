import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SharedService } from '../../../providers/shared.service';
import { Subscription } from 'rxjs/Subscription';

interface IState {
    success: boolean;
    status?: string;
    userId?: string;
    errors: string[];
}

@Component({
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: [
        './signup.component.scss'
    ]
})

export class SignupComponent implements OnInit {
    errorMessages = [];
    stages = [
        { type: 'login', name: 'Log In' },
        { type: 'register', name: 'New account' },
        { type: 'recovery', name: 'Recovery' }
    ];
    stage: string = this.stages[0].type;

    animations = {
        default: 'success',
        success: 'success',
        error: 'incorrect'
    };
    animationName = this.animations.default;
    animationLoop = true;
    animationEndedCallback = () => { };

    constructor(
        private router: Router,
        private sharedService: SharedService,
        private ref: ChangeDetectorRef
    ) { }

    ngOnInit() { }

    resetAnimation() {
        this.animationName = this.animations.default;
        this.animationLoop = true;
        this.animationEndedCallback();
        // this.animationEndedCallback = () => { };
    }

    changeAnimation(data: IState) {
        this.animationName = data.success ? this.animations.success : this.animations.error;
        this.animationLoop = false;
    }

    onChangeState(data: IState) {
        this.animationEndedCallback = () => {
            if (data.success && (data.status === 'recovery' || data.status === 'register')) {
                this.sharedService.initUser();
                this.router.navigate(['app/main']);
                // this.ref.detectChanges();
            } else if (data.success && data.status === 'login') {
                this.sharedService.initUser();
                this.router.navigate(['app/main']);
            }

        };
        this.errorMessages = data.errors;
        this.changeAnimation(data);
        this.ref.detectChanges();
    }

    gotoApp(): void {
        //this.sharedService.getUserDB();
        this.router.navigate(['app/main']);
    }

    changeScreen(stage: string): void {
        this.stage = stage;
    }
}