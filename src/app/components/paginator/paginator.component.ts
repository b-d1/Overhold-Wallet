import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'paginator',
    templateUrl: './paginator.component.html',
    styleUrls: [
        './paginator.component.scss'
    ]
})
export class PaginatorComponent implements OnInit, OnChanges {

    @Input() countOfPage: number = 10;
    @Input() currentPage: number = 1;
    @Output() onPaging: EventEmitter<any[]> = new EventEmitter();

    public pages: number[] = [];
    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['countOfPage']) {
            this.pages = (new Array(changes['countOfPage'].currentValue)).fill(0).map((value, index) => index + 1);
        }
    }

    ngOnInit() {
        this.pages = (new Array(this.countOfPage)).fill(0).map((value, index) => index + 1);
    }

    toPage(page): void {
        this.onPaging.emit(page);
    }
}
