import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: [
        './search.component.scss'
    ]
})
export class SearchComponent {
    searchMode: boolean = false;
    @Input() searchText: string = "";
    @Output() onSearch: EventEmitter<string> = new EventEmitter();
    @Input() placeholder: string;
    constructor() { }

    toggleSearch() {
        this.searchMode = !this.searchMode;
    }

    onKeyUp() {
        this.onSearch.emit(this.searchText);
    }

    onBlur() {
        this.searchMode = false;
    }
}
