/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import {BridgeCommandXmlService} from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import {
    newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType, scriptCode
} from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: 'vwvo-xmlMakerForFu-bridgeCommandXml',
    templateUrl: './bridgeCommandXml.html'
})
export class XmlMakerForFuBridgeCommandXmlComponent implements OnInit {
    @Input() active: boolean = false;
    private editting: boolean = false;
    private xml: string = ``;
    private code: string = ``;
    private emptyJson: any = {
        root: {
            imports: {},
            types: {
            },
            module: {
                _: {
                    id: 0,
                    name: "module"
                },
                Client: {
                    __: 'requestType: (HTTP_URL_GET, HTTP_DATA, UPLOAD_FILE, DOWNLOAD_FILE, NULL) \n' +
                    '        responseType: (HTTP_HTML, HTTP_DATA, HTTP_STATIC_RESOURCE, NULL)' ,
                    method: {
                        _: {
                            id: '',
                            name: '',
                            type: 'request',
                            http: '1',
                            requestType: 'NULL',
                            responseType: 'NULL',
                            uri: '',
                            viewName: ''
                        }
                    }
                },
                Server: {
                }
            }
        }
    };
    private bridgeCommandXmlList: any = [];
    private bridgeCommandXmlListBak: any = [];
    private activeCommandXml: any;
    private isBusy: boolean = true;
    private ele: any;
    private editor: any;
    private timer: any;
    private requireTypes = ['HTTP_URL_GET', 'HTTP_DATA', 'UPLOAD_FILE', 'DOWNLOAD_FILE', 'NULL'];
    private responseTypes = ['HTTP_HTML', 'HTTP_DATA', 'HTTP_STATIC_RESOURCE', 'NULL'];
    private activeXmlId :any;
    private xmlName : string = "httpCommandXml";
    constructor(private sanitizer: DomSanitizer, private httpCommandXmlService: BridgeCommandXmlService, private clientComponent: XmlMakerForFuComponent, el: ElementRef, private detectorRef: ChangeDetectorRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.httpCommandXmlService.list({
            successCallback: (list: any)=> {
                this.bridgeCommandXmlList = list;
                this.bridgeCommandXmlListBak = this.bridgeCommandXmlList;
                this.isBusy = false;
            }
        });
        var me = this;
        this.editor = CodeMirror.fromTextArea(this.ele.find("textarea").get(0), {
            lineNumbers: true,
            mode: "text/xml",
            matchBrackets: true,
            extraKeys: {
                'Ctrl-S': function(){
                    me.saveCommandXml();
                }
            }
        });
    }

    filterLabel() {
        if(this.timer){
            clearTimeout(this.timer);
        }
        var jq = this.ele;
        var me = this;
        this.timer = setTimeout(function(){
            var str = jq.find('#key').val();
            if(str && str.trim() != ''){
                me.bridgeCommandXmlList = [];
                me.bridgeCommandXmlListBak.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.bridgeCommandXmlList.push(obj);
                    }
                });
                if(me.bridgeCommandXmlList.length == 1){
                    me.changeCommandXml(me.bridgeCommandXmlList[0]);
                }
            }else{
                me.bridgeCommandXmlList = me.bridgeCommandXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }

    removeCommandXmlById(id: string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let httpCommandXmlList = this.bridgeCommandXmlList;
        for(let i=0, len=httpCommandXmlList.length; i<len; i++) {
            if(httpCommandXmlList[i].id == id) {
                httpCommandXmlList.splice(i, 1);
                return;
            }
        }
    }

    checkExistCommandIdOrName(id: string, mId: number, mName: string) {
        let httpCommandXmlList = this.bridgeCommandXmlList;
        for(let i=0, len=httpCommandXmlList.length; i<len; i++) {
            let httpCommandXml = httpCommandXmlList[i];
            let mInfo = this.getCommandXmlBaseInfo(httpCommandXml);
            let name: string = mInfo.service || mInfo.name;
            if(httpCommandXml.id !== id && (mInfo.name.toLowerCase() == mName.toLowerCase())) {
                return true;
            }
        }
    }

    getCommandXmlBaseInfo(httpCommandXml: any) {
        return httpCommandXml.json.root.module._;
    }

    changeCommandXml(httpCommandXml: any) {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.bridgeCommandXmlList.forEach((obj: any)=> {
            obj.active = obj.id == httpCommandXml.id;
            if(obj.active){
                this.activeXmlId = obj.id;
            }

        });
        this.activeCommandXml = httpCommandXml;
        this.xml = $.json2Xml(this.activeCommandXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#bridgeCommandWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#httpCommandDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editCommandXml() {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(!this.activeCommandXml) {
            return;
        }

        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.httpCommandXmlService.checkVersion({
            data: {
                id: this.activeCommandXml.id,
                version: this.activeCommandXml.version
            },
            successCallback: (e: any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeCommandXml.json);
                this.editor.setValue(this.xml);
                setTimeout(()=> {
                    this.editor.refresh();
                    this.editor.triggerOnKeyDown({});
                }, 10);
            },
            failCallback: (e: any)=> {
                alert(e.msg);
                return;
            }
        });
    }

    createCommandXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.isBusy = true;
        let tmpTimespan = +new Date();
        this.emptyJson.root.module._.id = tmpTimespan;
        this.emptyJson.root.module._.name = tmpTimespan;
        this.httpCommandXmlService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e: any)=> {
                this.isBusy = false;
                e.bridgeCommandXml.json = JSON.parse(e.bridgeCommandXml.jsonStr);
                e.bridgeCommandXml.version = 0;
                this.bridgeCommandXmlList.push(e.bridgeCommandXml);
                this.changeCommandXml(e.bridgeCommandXml);
            }
        });
    }

    removeCommandXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(!this.activeCommandXml) {
            return;
        }
        if(!confirm("确定要删除该文件么?")) {
            return;
        }

        this.httpCommandXmlService.remove({
            data: {
                id: this.activeCommandXml.id,
                name: this.getCommandXmlBaseInfo(this.activeCommandXml).service || this.getCommandXmlBaseInfo(this.activeCommandXml).name
            },
            successCallback: ()=> {
                this.removeCommandXmlById(this.activeCommandXml.id);
                this.isBusy = false;
                this.activeCommandXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr: string = JSON.stringify($.xml2json(xml));
            if(jsonStr !== this.activeCommandXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch(e) {
            alert("请检查格式");
        }
    }

    saveCommandXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if(!this.activeCommandXml) {
            return;
        }

        try {
            let xml = this.editor.getValue().trim();
            let json: any = $.xml2json(xml);
            this.isBusy = true;
            let activeModuleInfo = json.root.module._;
            let name: string = activeModuleInfo.service || activeModuleInfo.name;
            if(json.root.imports){
                let importEles: any[] = fix2Array(json.root.imports.import);
                if(importEles && importEles.length > 0){
                    let notExistCategory: boolean;
                    importEles.forEach(function(importEle){
                        if(!importEle._.category && importEle._.path){
                            notExistCategory = true;
                        }
                    });
                    if(notExistCategory){
                        alert("import的category属性不能为空！");
                        this.isBusy = false;
                        return;
                    }
                }
            }

            var me = this;
            var checkRequestType = false;
            var checkResponseType = false;
            fix2Array(json.root.module.Client.method).forEach(function(item: any){
                var requestType: string = item._.requestType;
                var responseType: string = item._.responseType;
                for(var i = 0; i < me.requireTypes.length; i++) {
                    if(me.requireTypes[i] == requestType) {
                        checkRequestType = true;
                        break;
                    }
                }
                for(var i = 0; i < me.responseTypes.length; i++) {
                    if(me.responseTypes[i] == responseType) {
                        checkResponseType = true;
                        break;
                    }
                }
            });

            if(!checkRequestType) {
                this.isBusy = false;
                alert('不存在的requestType！');
                return;
            }

            if(!checkResponseType) {
                this.isBusy = false;
                alert('不存在的responseType！');
                return;
            }

            if(this.checkExistCommandIdOrName(this.activeCommandXml.id, activeModuleInfo.id, name)) {
                alert("存在相同模块名称的模块");
                this.isBusy = false;
                return;
            }

            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#bridgeCommandWin').html(this.code);
            this.activeCommandXml.json = json;
            this.activeCommandXml.jsonStr = JSON.stringify(this.activeCommandXml.json);

            this.httpCommandXmlService.update({
                data: {
                    id: this.activeCommandXml.id,
                    jsonStr: this.activeCommandXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeCommandXml.version
                },
                successCallback: (e: any)=> {
                    this.editting = false;
                    this.isBusy = false;
                    this.activeCommandXml.version = e.version;
                    this.activeCommandXml.downloadUrl = ServerUrl+"xmlForFu/bridgeCommandXml/"+name+".xml";
                },
                failCallback: (e: any)=> {
                    this.isBusy = false;
                    alert(e.msg);
                }
            });
        } catch(e) {
            console.log(e);
            alert("操作发生错误，请检查xml是否正确或完整，或刷新页面即可操作");
            this.isBusy = false;
        }
    }

    calcJSON2Code(xml: string) {
        let json: any;
        try {
            json = $.xml2json(xml);
        } catch(e) {
            alert(e.message);
            console.log(e);
            this.isBusy = false;
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
        tmpHtml += calcStructArray2CodeStruct(struts, 'command', false);
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
                    this.isBusy = false;
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
                html += `${space}<span class="attribute">@Attribute(requestType = ${obj._.requestType}, uri = ${obj._.uri})</span>${newLine}`;
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
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('bridgeCommandXml', \'${iObj._.type}\', \'${this.activeXmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }else{
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }
                    }
                });
                html += `${space}}${newLine}${newLine}`;
                if(type == "Request") {
                    html += `${space}<span class="attribute">@Attribute(viewName = ${obj._.viewName}, responseType = ${obj._.responseType})</span>${newLine}`;
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
                            html += `<a class="type" target="showModeWin" href="javascript: toShowModel('bridgeCommandXml', \'${iObj._.type}\', \'${this.activeXmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }else{
                            html += `<span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }
                    });
                    html += `${space}}${newLine}${newLine}`;
                }
            });
        });
        var xmlId = this.activeXmlId;
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
                        html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('bridgeCommandXml', \'${iObj._.type}\', \'${xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                    }else{
                        html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                    }
                });
                html += `${space}}${newLine}${newLine}`;
            });
        }
        return html;
    }
}