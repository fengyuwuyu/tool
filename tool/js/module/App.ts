import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule }  from '@angular/platform-browser';
import { WidgetModule } from './Widget';
import { AppComponent } from './App/component/App';
import { IndexComponent } from './App/component/Index';
import { HeaderComponent } from './App/component/header/Header';
import { XmlMakerForFuComponent } from './App/component/xmlMakerForFu/Index';
import { XmlMakerForFuModuleXmlComponent } from './App/component/xmlMakerForFu/moduleXml/ModuleXml';
import { XmlMakerForFuCommandXmlComponent } from './App/component/xmlMakerForFu/commandXml/CommandXml';
import { XmlMakerForFuHttpCommandXmlComponent } from './App/component/xmlMakerForFu/httpCommandXml/HttpCommandXml';
import { XmlMakerForFuMetaDataXmlComponent } from './App/component/xmlMakerForFu/metadataXml/MetaDataXml.component';
import { XmlMakerForFuEventXmlComponent } from './App/component/xmlMakerForFu/eventXml/EventXml.component';
import { XmlMakerForFuNotificationXmlComponent } from './App/component/xmlMakerForFu/notificationXml/NotificationXml.component';
import { XmlMakerForFuRecordXmlComponent } from './App/component/xmlMakerForFu/recordXml/RecordXml.component';
import {XmlMakerForFuTaskXmlComponent} from "./App/component/xmlMakerForFu/taskXml/TaskXml.component";
import {XmlMakerForFuJobsXmlComponent} from "./App/component/xmlMakerForFu/jobsXml/JobsXml.component";

import { ModuleXmlService } from './App/component/xmlMakerForFu/moduleXml/Service';
import { XmlForFuService } from './App/component/xmlMakerForFu/Service';
import { CommandXmlService } from './App/component/xmlMakerForFu/commandXml/Service';
import { HttpCommandXmlService } from './App/component/xmlMakerForFu/httpCommandXml/Service';
import { MetaDataXmlService } from './App/component/xmlMakerForFu/metadataXml/Service';
import { EventXmlService } from './App/component/xmlMakerForFu/eventXml/Service';
import { NotificationXmlService } from './App/component/xmlMakerForFu/notificationXml/Service';
import { RecordXmlService } from './App/component/xmlMakerForFu/recordXml/Service';
import {JobsXmlService} from "./App/component/xmlMakerForFu/jobsXml/Service";
import {TaskXmlService} from "./App/component/xmlMakerForFu/taskXml/Service";
import {XmlMakerForFuBridgeCommandXmlComponent} from "./App/component/xmlMakerForFu/bridgeCommandXml/BridgeCommandXml";
import {BridgeCommandXmlService} from "./App/component/xmlMakerForFu/bridgeCommandXml/Service";
import {WolverineComponent} from "./App/component/wolverine/WolverineComponent";
import {VWVOComponent} from "./App/component/vwvo/VWVOComponent";
import {WolverineService} from "./App/component/wolverine/Service";
import {VWVOService} from "./App/component/vwvo/Service";
import {XmlMakerForFuWolverineEventXmlComponent} from "./App/component/xmlMakerForFu/wolverineEventXml/WolverineEventXml.component";
import {WolverineEventXmlService} from "./App/component/xmlMakerForFu/wolverineEventXml/Service";
import {WolverineModuleXmlService} from "./App/component/xmlMakerForFu/wolverineModuleXml/Service";
import {XmlMakerForFuWolverineModuleXmlComponent} from "./App/component/xmlMakerForFu/wolverineModuleXml/WolverineModuleXml";
import {XmlMakerForFuWolverineMetaDataXmlComponent} from "./App/component/xmlMakerForFu/wolverineMetadataXml/WolverineMetaDataXml.component";
import {WolverineMetaDataXmlService} from "./App/component/xmlMakerForFu/wolverineMetadataXml/Service";
import {XmlMakerForFuModelWinComponent} from "./App/component/modelWin/ModelWin";
import {ModuleWinService} from "./App/component/modelWin/Service";

@NgModule({
    imports: [
        WidgetModule,
        BrowserModule,
        FormsModule,
        RouterModule.forRoot([
            {
                path: "",
                component: IndexComponent,
                children: [
                    {
                        path: "",
                        component: XmlMakerForFuComponent
                    },
                    {
                        path: "xmlMakerForFu",
                        component: XmlMakerForFuComponent
                    }
                ]
            },
            {
                path: "modelWin/:catagory/:name/:id",
                component: XmlMakerForFuModelWinComponent
            }
        ])
    ],
    declarations: [
        AppComponent,
        IndexComponent,
        HeaderComponent,
        XmlMakerForFuComponent,
        XmlMakerForFuModuleXmlComponent,
        XmlMakerForFuCommandXmlComponent,
        XmlMakerForFuHttpCommandXmlComponent,
        XmlMakerForFuBridgeCommandXmlComponent,
        XmlMakerForFuEventXmlComponent,
        XmlMakerForFuMetaDataXmlComponent,
        XmlMakerForFuRecordXmlComponent,
        XmlMakerForFuNotificationXmlComponent,
        XmlMakerForFuJobsXmlComponent,
        XmlMakerForFuTaskXmlComponent,
        WolverineComponent,
        VWVOComponent,
        XmlMakerForFuWolverineEventXmlComponent,
        XmlMakerForFuWolverineModuleXmlComponent,
        XmlMakerForFuWolverineMetaDataXmlComponent,
        XmlMakerForFuModelWinComponent
    ],
    providers: [
        ModuleXmlService,
        CommandXmlService,
        MetaDataXmlService,
        EventXmlService,
        XmlForFuService,
        RecordXmlService,
        HttpCommandXmlService,
        NotificationXmlService,
        JobsXmlService,
        TaskXmlService,
        BridgeCommandXmlService,
        WolverineService,
        VWVOService,
        WolverineEventXmlService,
        WolverineModuleXmlService,
        WolverineMetaDataXmlService,
        ModuleWinService
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
