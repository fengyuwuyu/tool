import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {ModuleWinService} from "./Service";
import {
    calcEnumArray2CodeEnum, calcStructArray2CodeStruct,
    fix2Array, littlerSpace, littleSpace, newLine, scriptCode,dataType, space,
} from "../xmlMakerForFu/util/Index";
import {DomSanitizer} from "@angular/platform-browser";
import {MetaDataXmlService} from "../xmlMakerForFu/metadataXml/Service";


@Component({
    selector: 'vwvo-modelWin',
    styles: [require('./modelWin.css').toString()],
    templateUrl: './modelWin.html'
})
export class XmlMakerForFuModelWinComponent {
    private xmlId: string;
    private xmlName: string;
    private xmlCatagory: string;
    private xmlList: any[];
    private activeXml: any;
    private code: any;
    private metaDataList: any[];

    constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private modelWinService: ModuleWinService, private metaDataService: MetaDataXmlService){
        this.route.params.subscribe(param => {
            this.xmlId = param["id"];
            this.xmlName = param["name"];
            this.xmlCatagory = param["catagory"];
        });
    }

    ngOnInit(){
        if(this.xmlCatagory == "metadataXml"){
            this.metaDataService.list({
                successCallback: (list: any)=> {
                    this.metaDataList = list;
                    this.searchFromMetaDateXml(this.xmlName);
                }
            });
        }else{
            this.modelWinService.list({
                url: this.xmlCatagory,
                successCallback: (list: any)=> {
                    this.xmlList = list;
                    this.xmlList.forEach((obj) => {
                        if(obj.id == this.xmlId){
                            this.activeXml = obj;
                            this.getModelInfoOfModule(obj);
                        }
                    })
                }
            });
        }

    }

    scollToView(id: any){
        var searchClass = document.getElementsByName("modelName");
        for (var i = 0; i < searchClass.length; i++) {
            searchClass[i].classList.remove("search");
             searchClass[i].classList.add("structName");
            if(searchClass[i].id == id){
                var model = document.getElementById(id);
                model.setAttribute("class","search");
                model.scrollIntoView(true);
            }
        }
    }

    getModelInfoOfModule(xml: any){
        var xmlInfo = $.json2Xml(xml.json);
        if(this.xmlCatagory == "moduleXml"){
            this.code = this.calcJSON2CodeOfModule(xmlInfo);
        }
        if(this.xmlCatagory == "commandXml"){
            this.code = this.calcJSON2CodeOfCommand(xmlInfo);
        }
        if(this.xmlCatagory == "WolverineModuleXml"){
            this.code = this.calcJSON2CodeOfModule(xmlInfo);
        }
        if(this.xmlCatagory == "eventXml"){
            this.code = this.calcJSON2CodeOfEvent(xmlInfo);
        }
        if(this.xmlCatagory == "httpCommandXml"){
             this.code = this.calcJSON2CodeOfCommand(xmlInfo);
         }
        /* if(this.xmlCatagory == "moduleXml"){
            this.code = this.calcJSON2CodeOfModule(xmlInfo);
        }
        if(this.xmlCatagory == "moduleXml"){
            this.code = this.calcJSON2CodeOfModule(xmlInfo);
        }
        if(this.xmlCatagory == "moduleXml"){
            this.code = this.calcJSON2CodeOfModule(xmlInfo);
        }*/
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#modelWin').html(this.code);
        this.scollToView(this.xmlName);
        $('#modelScript').html(scriptCode);
        this.scollToView(this.xmlName);
    }

    searchFromMetaDateXml(key: any){
        var metaDataXml: any;
        var exist = false;
        this.metaDataList.forEach(function(ele){
            if(ele.strutNames && ele.strutNames.indexOf('-' + key + '-') != -1){
                exist = true;
                metaDataXml = ele;
            }
        });
        if(exist){
            if(metaDataXml){
                var xmlInfo = $.json2Xml(metaDataXml.json);
                this.code = this.calcJSON2CodeOfMetaData(xmlInfo);
                $('#modelWin').html(this.code);
                this.scollToView(this.xmlName);
                $('#modelScript').html(scriptCode);
                this.scollToView(this.xmlName);
                var model = document.getElementById(key);
                model.setAttribute("class","search");
                model.scrollIntoView(true);
            }
        }else{
            return '不存在的metadata';
        }
    }


    calcJSON2CodeOfCommand(xml: string) {
        let json: any;
        try {
            json = $.xml2json(xml);
        } catch(e) {
            alert(e.message);
            console.log(e);
            throw new Error(e);
        }
        json = json.root;
        let importEles: any[] = fix2Array(json.imports ? json.imports.import : null);
        let html: string = "";
        let module: any = json.module;
        let types: any = json.types;
        let struts: any[] = fix2Array(types.struct);
        let enums: any[] = fix2Array(types.enum);
        var moduleInfo: any = module._;
        var moduleSCommands: any[] = fix2Array(module.Server.method);
        var moduleCCommands: any[] = fix2Array(module.Client.method);
        var notifications: any[] = fix2Array(module.Notification ? module.Notification.notify : null);
        var catagory = this.xmlCatagory;
        var id = this.xmlId;
        if(module.__) {
            html += `${space}<span class="comment" >/*${newLine}`;
            html += `${space}*${littlerSpace}${module.__}${newLine}`;
            html += `${space}*/</span>${newLine}`;
        }
        html += `${space}moduleName = <span class="str">"${moduleInfo.name}"</span>;${newLine}`;
        html += `${space}moduleId = ${moduleInfo.id};${newLine}${newLine}`;
        if(moduleInfo.service) {
            html += `${space}service = "${moduleInfo.service}";${newLine}`;
        }
        if(moduleInfo.base) {
            html += `${space}commandBase = ${moduleInfo.base};${newLine}${newLine}`;
        } else {
            html += `${newLine}`;
        }
        if(importEles && importEles.length > 0) {
            importEles.forEach(function(importEle){
                if(importEle._.path || importEle._.category){
                    var attrValue = (importEle._.path && importEle._.category) ? importEle._.category + '/' + importEle._.path :  importEle._.path || importEle._.category;
                    html += `${space}import${littleSpace}path${littleSpace}=${littleSpace}<span class="str">"${attrValue}"</span>;${newLine}`;
                }
            })
            html +=`${newLine}`;
        }
        let tmpHtml: string = "";
        tmpHtml += calcEnumArray2CodeEnum(enums, 'command');
        tmpHtml += calcStructArray2CodeStruct(struts, 'command', false, this.xmlCatagory, this.xmlId);
        if(tmpHtml) {
            html = html + `${space}<span class="comment" >///////////////types////////////////</span>${newLine}` + tmpHtml;
        }
        let ServerIndex = 0;
        [moduleSCommands, moduleCCommands].forEach((commands, mIndex)=>
        {
            html += `${space}<span class="comment" >///////////////From${mIndex==ServerIndex?"Server":"Client"}////////////////</span>${newLine}`;
            commands.forEach((obj)=> {
                let items: any[] = fix2Array(obj.item);
                let type = obj._.type || "";
                let outputItems: any[] = [];
                type = type.substring(0, 1).toUpperCase()+type.substring(1);
                if((type !== "Notify" ||  ServerIndex !== mIndex ) && +obj._.broadcast) {
                    alert("添加了broadcast属性到非法位置。");
                    throw new Error("添加了broadcast属性到非法位置");
                }
                if(obj.__) {
                    html += `<span class="comment" >${space}/*${newLine}`;
                    html += `${space}*${littlerSpace}${obj.__}${newLine}`;
                    html += `${space}*/</span>${newLine}`;
                }
                if(+obj._.broadcast) {
                    html += `${space}@Broadcast${newLine}`;
                }
                html += `${space}${obj._.http?'http'+littleSpace:''}<span class="fun">command</span>${littleSpace}<span class="fun1">${obj._.name}${type}</span>${littlerSpace}:${littlerSpace}id(${obj._.id||""})${littlerSpace}{${newLine}`;
                items.forEach((iObj, iIndex)=> {
                    if(+iObj._.out == 1) {
                        outputItems.push(iObj);
                    } else {
                        if(iObj.__) {
                            html += `${space}${space}<span class="comment" >/*${newLine}`;
                            html += `${space}${space}*${littlerSpace}${iObj.__}${newLine}`;
                            html += `${space}${space}*/</span>${newLine}`;
                        }
                        if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                            html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                        }else{
                            html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                        }
                        if(dataType.indexOf(iObj._.type) == -1){
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel(\'${this.xmlCatagory}\', \'${iObj._.type}\', \'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }else{
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }
                    }
                });
                html += `${space}}${newLine}${newLine}`;
                if(type == "Request") {
                    html += `${space}${obj._.http?'http'+littleSpace:''}<span class="fun">command</span>${littleSpace}<span class="fun1">${obj._.name}Response</span>${littlerSpace}:${littlerSpace}id(${obj._.id||""})${littlerSpace}{${newLine}`;
                    outputItems.forEach((iObj, iIndex)=> {
                        if(iObj.__) {
                            html += `${space}${space}<span class="comment" >/*${newLine}`;
                            html += `${space}${space}*${littlerSpace}${iObj.__}${newLine}`;
                            html += `${space}${space}*/</span>${newLine}`;
                        }
                        if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                            html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                        }else{
                            html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                        }
                        if(dataType.indexOf(iObj._.type) == -1){
                            html += `<a class="type" target="showModeWin" href="javascript: toShowModel(\'${iObj._.type}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }else{
                            html += `<span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }
                    });
                    html += `${space}}${newLine}${newLine}`;
                }
            });
        });

        if(notifications && notifications.length > 0){
            html = html + `${space}<span class="comment" >///////////////Notification////////////////</span>${newLine}`;
            notifications.forEach(function(obj, index){
                let items: any[] = fix2Array(obj.item);
                if(obj.__) {
                    html += `<span class="comment" >${space}/*${newLine}`;
                    html += `${space}*${littlerSpace}${obj.__}${newLine}`;
                    html += `${space}*/</span>${newLine}`;
                }
                if(obj._.broadcast){
                    if(obj._.broadcast == 1){
                        html += `${space}<span class="attribute">@broadcast</span>${newLine}`;
                    }else if(obj._.broadcast == 2){
                        html += `${space}<span class="attribute">@broadcast&p2p</span>${newLine}`;
                    }
                }
                html += `${space}<span class="attribute">@Attribute(notificationId = ${obj._.id}, businessType = ${obj._.businessType})</span>${newLine}`;
                html += `${space}<span class="fun">notification</span>${littleSpace}<span class="fun1">${obj._.name}Notification</span>${newLine}`;

                items.forEach((iObj, iIndex)=> {
                    if(iObj.__) {
                        html += `${space}${space}<span class="comment" >/*${newLine}`;
                        html += `${space}${space}*${littlerSpace}${iObj.__}${newLine}`;
                        html += `${space}${space}*/</span>${newLine}`;
                    }
                    if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                        html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                    }else{
                        html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                    }

                    if(dataType.indexOf(iObj._.type) == -1){
                        html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel(\'${catagory}\', \'${iObj._.type}\', \'${id}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                    }else{
                        html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                    }
                });
                html += `${space}}${newLine}${newLine}`;
            });
        }
        return html;
    }


    calcJSON2CodeOfModule(xml: string) {
        let json: any;
        try {
            json = $.xml2json(xml);
        } catch(e) {
            alert(e.message);
            console.log(e);
            throw new Error(e);
        }
        json = json.root;
        let importEles: any[] = fix2Array(json.imports ? json.imports.import : null);
        let module: any = json.module;
        let types: any = json.types;
        let enums: any[] = fix2Array(types.enum);
        let struts: any[] = fix2Array(types.struct);
        var moduleInfo: any = module._;
        var moduleSMethods: any[] = fix2Array(module.Server.method);
        var moduleCMethods: any[] = fix2Array(module.Client.method);
        var html: string = "";

        if(module.__) {
            html += `${space}<span class="comment" >/*${newLine}`;
            html += `${space}*${littlerSpace}${module.__}${newLine}`;
            html += `${space}*/</span>${newLine}`;
        }
        html += `${space}moduleName = <span class="str">"${moduleInfo.name}"</span>;${newLine}`;
        html += `${space}moduleId = ${moduleInfo.id};${newLine}${newLine}`;
        if(moduleInfo.service) {
            html += `${space}service = "${moduleInfo.service}";${newLine}`;
        }
        if(moduleInfo.base) {
            html += `${space}commandBase = ${moduleInfo.base};${newLine}${newLine}`;
        } else {
            html += `${newLine}`;
        }
        if(importEles && importEles.length > 0) {
            importEles.forEach(function(importEle){
                if(importEle._.path || importEle._.category){
                    var attrValue = (importEle._.path && importEle._.category) ? importEle._.category + '/' + importEle._.path :  importEle._.path || importEle._.category;
                    html += `${space}import${littleSpace}path${littleSpace}=${littleSpace}<span class="str">"${attrValue}"</span>;${newLine}`;
                }
            })
            html +=`${newLine}`;
        }
        html += calcEnumArray2CodeEnum(enums, "command");
        html += calcStructArray2CodeStruct(struts, "command", false, this.xmlCatagory, this.xmlId);
        if(moduleInfo.service) {
            html += `${space}service = "${moduleInfo.service}";${newLine}`;
        }
        if(moduleInfo.base) {
            html += `${space}commandBase = ${moduleInfo.base};${newLine}${newLine}`;
        } else {
            html += `${newLine}`;
        }
        [moduleSMethods, moduleCMethods].forEach((methods, mIndex)=> {
            html += `${space}<span class="cs">class</span>${littleSpace}<span class="csName">${moduleInfo.name}${mIndex==0?"Server":"Client"}</span>${littlerSpace}{${newLine}`;
            methods.forEach((obj)=> {
                let items: any[] = fix2Array(obj.item);
                let type = obj._.type || "";
                let outputItems: any[] = [];
                type = type.substring(0, 1).toUpperCase()+type.substring(1);
                if(obj.__) {
                    html += `<span class="comment" >${space}${space}/*${newLine}`;
                    html += `${space}${space}*${littlerSpace}${obj.__}${newLine}`;
                    html += `${space}${space}*/</span>${newLine}`;
                }
                html += `${space}${space}${obj._.id || 'xxxxx'}${littleSpace}-->${littleSpace}<span class="fun">void</span>${littleSpace}<span class="fun1">${obj._.name}${type}</span>(`;
                items.forEach((iObj, iIndex)=> {
                    if(+iObj._.out == 1) {
                        outputItems.push(iObj);
                    } else {
                        if(iIndex) {
                            html += `${littlerSpace}`;
                        }
                        if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                            html += `<span class='type'>optional</span>`+littleSpace;
                        }else{
                            html += `<span class='type'>required</span>`+littleSpace;
                        }
                        if(dataType.indexOf(iObj._.type) == -1){
                            html += `<a class="type" target="showModeWin" href="javascript: toShowModel(\'${this.xmlCatagory}\', \'${iObj._.type}\', \'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute==="repeated"?"[]":""}${littleSpace}${iObj._.name}`;
                        }else{
                            html += `<span class="type">${iObj._.type}</span>${iObj._.attribute==="repeated"?"[]":""}${littleSpace}${iObj._.name}`;
                        }
                        html += `,`;
                    }
                });
                html = html.substring(0, html.length-1);
                html += ")";
                if(type == "Request") {
                    html += `${littleSpace}=>${littleSpace}Response(`;
                    if(outputItems.length) {
                        //html += `(`;
                        outputItems.forEach((iObj, iIndex)=> {
                            if(iIndex) {
                                html += `${littlerSpace}`;
                            }
                            if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                                html += `<span class='type'>optional</span>`+littleSpace;
                            }else{
                                html += `<span class='type'>required</span>`+littleSpace;
                            }
                            if(dataType.indexOf(iObj._.type) == -1){
                                html += `<a class="type" target="showModeWin" href="javascript: toShowModel(\'${this.xmlCatagory}\', \'${iObj._.type}\', \'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute==="repeated"?"[]":""}${littleSpace}${iObj._.name}`;
                            }else{
                                html += `<span class="type">${iObj._.type}</span>${iObj._.attribute==="repeated"?"[]":""}${littleSpace}${iObj._.name}`;
                            }
                            if(iIndex != outputItems.length-1) {
                                html += `,`;
                            }
                        });
                    }
                    html += `)`;
                }
                html += `;${newLine}`;
            });
            html += `${space}}`;
            html += `${newLine}${newLine}`;
        });

        return html;
    }

    calcJSON2CodeOfMetaData(xml: string) {
        let json:any;
        try {
            json = $.xml2json(xml);
        } catch (e) {
            alert(e.message);
            console.log(e);
            throw new Error(e);
        }

        json = json.root;
        let importEles:any[] = fix2Array(json.imports.import);
        //let module: any = json.module;
        let types:any = json.types;
        let struts:any[] = fix2Array(types.struct);
        let enums:any[] = fix2Array(types.enum);
        //var moduleInfo: any = module._;
        var html:string = "";
        html += `${space}category = <span class="str">"${types._.category}"</span>;${newLine}`;
        html += `${space}module = <span class="str">"${types._.moduleName}"</span>;${newLine}${newLine}`;
        if (importEles && importEles.length > 0) {
            importEles.forEach(function (importEle) {
                if (importEle._.path || importEle._.category) {
                    var attrValue = (importEle._.path && importEle._.category) ? importEle._.category + '/' + importEle._.path : importEle._.path || importEle._.category;
                    html += `${space}import${littleSpace}path${littleSpace}=${littleSpace}<span class="str">"${attrValue}"</span>;${newLine}`;
                }
            })
            html += `${newLine}`;
        }
        html += calcEnumArray2CodeEnum(enums, 'rpc', true);
        html += calcStructArray2CodeStruct(struts, 'command', true, this.xmlCatagory, this.xmlId);
        return html;
    }

    calcJSON2CodeOfEvent(xml:string) {
        let json:any;
        try {
            json = $.xml2json(xml);
        } catch (e) {
            alert(e.message);
            console.log(e);
            throw new Error(e);
        }

        var html:string = "";

        json = json.root;
        let module:any = json.module;
        var moduleInfo:any = module._;
        if (module.__) {
            html += `${space}<span class="comment" >/*${newLine}`;
            html += `${space}*${littlerSpace}${module.__}${newLine}`;
            html += `${space}*/</span>${newLine}`;
        }
        html += `${space}moduleName = <span class="str">"${moduleInfo.name}"</span>;${newLine}`;
        html += `${space}moduleId = ${moduleInfo.id};${newLine}`;
        if (moduleInfo.service) {
            html += `${space}service = "${moduleInfo.service}";${newLine}`;
        }
        if (moduleInfo.base) {
            html += `${space}commandBase = ${moduleInfo.base};${newLine}${newLine}`;
        } else {
            html += `${newLine}`;
        }

        let importEles:any[] = fix2Array(json.imports ? json.imports.import : null);
        if(importEles && importEles.length > 0) {
            importEles.forEach(function(importEle){
                if(importEle._.path || importEle._.category){
                    var attrValue = (importEle._.path && importEle._.category) ? importEle._.category + '/' + importEle._.path :  importEle._.path || importEle._.category;
                    html += `${space}import${littleSpace}path${littleSpace}=${littleSpace}<span class="str">"${attrValue}"</span>;${newLine}`;
                }
            })
            html +=`${newLine}`;
        }

        let types:any = json.types;
        let struts:any[] = fix2Array(types.struct);
        let enums:any[] = fix2Array(types.enum);
        html += calcEnumArray2CodeEnum(enums, 'command');
        html += calcStructArray2CodeStruct(struts, 'command', false);

        return html;
    }
}