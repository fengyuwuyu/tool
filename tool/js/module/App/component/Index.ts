import { Component } from '@angular/core';
@Component({
    selector: 'vwvo-index',
    template: `
        <!--<vwvo-header></vwvo-header>-->
        <div class="content" >
            <router-outlet></router-outlet>
        </div>  
    `,
    styles: [require('./index.css').toString()]
})
export class IndexComponent { }
