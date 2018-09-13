import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { MetaDataXmlService } from './../xmlMakerForFu/metadataXml/Service';
import { XmlForFuService } from './../xmlMakerForFu/Service';
import { XmlMakerForFuMetaDataXmlComponent } from './../xmlMakerForFu/metadataXml/MetaDataXml.component';
import {XmlMakerForFuWolverineMetaDataXmlComponent} from "../xmlMakerForFu/wolverineMetadataXml/WolverineMetaDataXml.component";
import {WolverineMetaDataXmlService} from "../xmlMakerForFu/wolverineMetadataXml/Service";
@Component({
    selector: 'vwvo-header',
    templateUrl: './header.html',
    styles: [require('./header.css').toString()],
    providers: [XmlMakerForFuMetaDataXmlComponent]
})
export class HeaderComponent {

    private searchKey: string;

    constructor(private metadataService: MetaDataXmlService, private xmlForFuService: XmlForFuService, private router: ActivatedRoute, private wolverineMetadataService : WolverineMetaDataXmlService) {
        this.searchKey = this.router.snapshot.params["id"];
    }

    ngOnInit(){
        if(this.searchKey != ""){
            setTimeout(() => this.metadataSearch(this.searchKey),1000);
        }
    }

    metadataSearch(key:string) {

        if(!key || key.trim() == ''){
            return;
        }
        key = key.trim();
        let metadataComponent: XmlMakerForFuMetaDataXmlComponent = this.metadataService.getMetadataXmlComponent();
        var msg = metadataComponent.searchMetadata(key, this.xmlForFuService);
        if(msg){
            alert(msg);
        }

    }
}
