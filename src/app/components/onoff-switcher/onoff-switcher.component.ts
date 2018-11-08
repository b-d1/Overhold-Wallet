
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'onoff-switcher',
    templateUrl: './onoff-switcher.component.html',
    styleUrls: [
        './onoff-switcher.component.scss'
    ]
})
export class OnOffSwitcherComponent {
    @Output() onChange: EventEmitter<boolean> = new EventEmitter();
    @Input() state: boolean = false;
    @Input() componentId: number = 0;
    @Input() disabledValue: boolean;
    constructor() { }
    changeState(): void {
        if (!this.disabledValue) {
            this.onChange.emit(this.state);
        }
    }
}
