import { Component, Input, Output, EventEmitter } from '@angular/core';

interface IStage {
    type: string;
    name: string;
}

@Component({
    selector: 'switcher',
    templateUrl: './switcher.component.html',
    styleUrls: [
        './switcher.component.scss'
    ]
})
export class SwitcherComponent {
    @Output() onChange: EventEmitter<string> = new EventEmitter();
    @Input() stages: IStage[];
    @Input() activeStage: string;
    @Input() theme: string = '';

    changeState(): void {
        this.onChange.emit(this.activeStage);
    }
}