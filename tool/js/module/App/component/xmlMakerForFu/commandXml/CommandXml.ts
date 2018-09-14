/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommandXmlService } from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import {
    newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType, scriptCode
} from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'vwvo-xmlMakerForFu-commandXml',
    templateUrl: './commandXml.html'
})
export class XmlMakerForFuCommandXmlComponent implements OnInit {
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
                },
                Server: {
                },
                Notification: {
                    notify: {
                        _: {
                            id: "",
                            name: "",
                            businessType: ""
                        }
                    }
                }
            }
        }
    };

    private commandXmlList: any = [];
    private commandXmlListBak: any = [];
    private activeCommandXml: any;
    private isBusy: boolean = true;
    private ele: any;
    private editor: any;
    private timer: any;
    private activeXmlId: any;
    private xmlName: string = "commandXml";

    constructor(private sanitizer: DomSanitizer, private commandXmlService: CommandXmlService, private clientComponent: XmlMakerForFuComponent, el: ElementRef, private detectorRef: ChangeDetectorRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.commandXmlService.list({
            successCallback: (list: any)=> {
                this.commandXmlList = list;
                this.commandXmlListBak = this.commandXmlList;
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
                me.commandXmlList = [];
                me.commandXmlListBak.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.commandXmlList.push(obj);
                    }
                });
                if(me.commandXmlList.length == 1){
                    me.changeCommandXml(me.commandXmlList[0]);
                }
            }else{
                me.commandXmlList = me.commandXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }

    removeCommandXmlById(id: string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let commandXmlList = this.commandXmlList;
        for(let i=0, len=commandXmlList.length; i<len; i++) {
            if(commandXmlList[i].id == id) {
                commandXmlList.splice(i, 1);
                return;
            }
        }
    }

    checkExistCommandIdOrName(id: string, mId: number, mName: string) {
        let commandXmlList = this.commandXmlList;
        for(let i=0, len=commandXmlList.length; i<len; i++) {
            let commandXml = commandXmlList[i];
            let mInfo = this.getCommandXmlBaseInfo(commandXml);
            let name: string = mInfo.service || mInfo.name;
            if(commandXml.id !== id && (mInfo.name.toLowerCase() == mName.toLowerCase())) {
                return true;
            }
        }
    }

    getCommandXmlBaseInfo(commandXml: any) {
        return commandXml.json.root.module._;
    }

    changeCommandXml(commandXml: any) {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.commandXmlList.forEach((obj: any)=> {
            obj.active = obj.id == commandXml.id;
            if(obj.active){
                this.activeXmlId = obj.id;
            }
        });
        this.activeCommandXml = commandXml;
        this.xml = $.json2Xml(this.activeCommandXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#commandWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#commandDiv').html(scriptCode);
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

        this.commandXmlService.checkVersion({
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
        this.commandXmlService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e: any)=> {
                this.isBusy = false;
                e.commandXml.json = JSON.parse(e.commandXml.jsonStr);
                e.commandXml.version = 0;
                this.commandXmlList.push(e.commandXml);
                this.changeCommandXml(e.commandXml);
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

        this.commandXmlService.remove({
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
            if(this.checkExistCommandIdOrName(this.activeCommandXml.id, activeModuleInfo.id, name)) {
                alert("存在相同模块名称的模块");
                this.isBusy = false;
                return;
            }

            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#commandWin').html(this.code);
            this.activeCommandXml.json = json;
            this.activeCommandXml.jsonStr = JSON.stringify(this.activeCommandXml.json);

            this.commandXmlService.update({
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
                    this.activeCommandXml.downloadUrl = ServerUrl+"xmlForFu/commandXml/"+name+".xml";
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
            html += `${space}<span class="comment" >/*${littlerSpace}`;
            html += `${module.__}${littlerSpace}`;
            html += `*/</span>${newLine}`;
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
        tmpHtml += calcStructArray2CodeStruct(struts, 'command', false, this.xmlName, this.activeXmlId);
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
                    html += `<span class="comment" >${space}/*${littlerSpace}`;
                    html += `${obj.__}${littlerSpace}`;
                    html += `*/</span>${newLine}`;
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
                            html += `${space}${space}<span class="comment" >/*${littlerSpace}`;
                            html += `${iObj.__}${littlerSpace}`;
                            html += `*/</span>${newLine}`;
                        }
                        if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                            html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                        }else{
                            html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                        }
                        if(dataType.indexOf(iObj._.type) == -1){
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('commandXml', \'${iObj._.type}\', \'${this.activeXmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
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
                            html += `${space}${space}<span class="comment" >/*${littlerSpace}`;
                            html += `${iObj.__}${littlerSpace}`;
                            html += `*/</span>${newLine}`;
                        }
                        if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                            html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                        }else{
                            html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                        }
                        if(dataType.indexOf(iObj._.type) == -1){
                            html += `<a class="type" target="showModeWin" href="javascript: toShowModel('commandXml', \'${iObj._.type}\', \'${this.activeXmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
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
                    html += `<span class="comment" >${space}/*${littlerSpace}`;
                    html += `${obj.__}${littlerSpace}`;
                    html += `*/</span>${newLine}`;
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
                        html += `${space}${space}<span class="comment" >/*${littlerSpace}`;
                        html += `${littlerSpace}${iObj.__}${littlerSpace}`;
                        html += `*/</span>${newLine}`;
                    }
                    if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                        html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                    }else{
                        html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                    }

                    if(dataType.indexOf(iObj._.type) == -1){
                        html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel(\'${iObj._.type}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
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