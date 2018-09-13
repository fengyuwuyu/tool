import { Component, Input } from '@angular/core';
@Component({
    selector: 'vwvo-widget-loading',
    templateUrl: './loading.html',
    styles: [require('./loading.css').toString()]
})
export class LoadingComponent {
    @Input() isActive: boolean = false;
    @Input() text: string = "";
    constructor() {
    }
}
