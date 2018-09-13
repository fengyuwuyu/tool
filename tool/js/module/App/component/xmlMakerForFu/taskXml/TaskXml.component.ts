/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TaskXmlService } from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import {
    newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType, scriptCode
} from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: 'vwvo-xmlMakerForFu-taskXml',
    templateUrl: './taskXml.html'
})
export class XmlMakerForFuTaskXmlComponent implements OnInit {
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
                    name: "tasks"
                },
                task: {
                },
                taskResult: {
                }
            }
        }
    };

    private taskXmlList: any = [];
    private taskXmlListBak: any = [];
    private activeTaskXml: any;
    private isBusy: boolean = true;
    private ele: any;
    private editor: any;
    private timer: any;
    constructor(private sanitizer: DomSanitizer, private taskXmlService: TaskXmlService, private clientComponent: XmlMakerForFuComponent, el: ElementRef, private detectorRef: ChangeDetectorRef) {
        this.ele = jQuery(el.nativeElement);
    }
    private xmlId: string;
    ngOnInit() {
        this.taskXmlService.list({
            successCallback: (list: any)=> {
                this.taskXmlList = list;
                this.taskXmlListBak = this.taskXmlList;
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
                    me.saveTaskXml();
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
                me.taskXmlList = [];
                me.taskXmlListBak.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.taskXmlList.push(obj);
                    }
                });
                if(me.taskXmlList.length == 1){
                    me.changeTaskXml(me.taskXmlList[0]);
                }
            }else{
                me.taskXmlList = me.taskXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }

    removeTaskXmlById(id: string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let taskXmlList = this.taskXmlList;
        for(let i=0, len=taskXmlList.length; i<len; i++) {
            if(taskXmlList[i].id == id) {
                taskXmlList.splice(i, 1);
                return;
            }
        }
    }

    checkExistTaskIdOrName(id: string, mId: number, mName: string) {
        let taskXmlList = this.taskXmlList;
        for(let i=0, len=taskXmlList.length; i<len; i++) {
            let taskXml = taskXmlList[i];
            let mInfo = this.getTaskXmlBaseInfo(taskXml);
            let name: string = mInfo.service || mInfo.name;
            if(taskXml.id !== id && (mInfo.name.toLowerCase() == mName.toLowerCase())) {
                return true;
            }
        }
    }

    getTaskXmlBaseInfo(taskXml: any) {
        return taskXml.json.root.module._;
    }

    changeTaskXml(taskXml: any) {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.taskXmlList.forEach((obj: any)=> {
            obj.active = obj.id == taskXml.id;
            if(obj.active){
                this.xmlId = taskXml.id;
            }
        });
        this.activeTaskXml = taskXml;
        this.xml = $.json2Xml(this.activeTaskXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#taskWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#taskDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editTaskXml() {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(!this.activeTaskXml) {
            return;
        }

        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.taskXmlService.checkVersion({
            data: {
                id: this.activeTaskXml.id,
                version: this.activeTaskXml.version
            },
            successCallback: (e: any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeTaskXml.json);
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

    createTaskXml() {
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
        this.taskXmlService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e: any)=> {
                this.isBusy = false;
                e.taskXml.json = JSON.parse(e.taskXml.jsonStr);
                e.taskXml.version = 0;
                this.taskXmlList.push(e.taskXml);
                this.changeTaskXml(e.taskXml);
            }
        });
    }

    removeTaskXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(!this.activeTaskXml) {
            return;
        }
        if(!confirm("确定要删除该文件么?")) {
            return;
        }

        this.taskXmlService.remove({
            data: {
                id: this.activeTaskXml.id,
                name: this.getTaskXmlBaseInfo(this.activeTaskXml).service || this.getTaskXmlBaseInfo(this.activeTaskXml).name
            },
            successCallback: ()=> {
                this.removeTaskXmlById(this.activeTaskXml.id);
                this.isBusy = false;
                this.activeTaskXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr: string = JSON.stringify($.xml2json(xml));
            if(jsonStr !== this.activeTaskXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch(e) {
            alert("请检查格式");
        }
    }

    saveTaskXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if(!this.activeTaskXml) {
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
            if(this.checkExistTaskIdOrName(this.activeTaskXml.id, activeModuleInfo.id, name)) {
                alert("存在相同模块名称的模块");
                this.isBusy = false;
                return;
            }

            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#taskWin').html(this.code);
            this.activeTaskXml.json = json;
            this.activeTaskXml.jsonStr = JSON.stringify(this.activeTaskXml.json);

            this.taskXmlService.update({
                data: {
                    id: this.activeTaskXml.id,
                    jsonStr: this.activeTaskXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeTaskXml.version
                },
                successCallback: (e: any)=> {
                    this.editting = false;
                    this.isBusy = false;
                    this.activeTaskXml.version = e.version;
                    this.activeTaskXml.downloadUrl = ServerUrl+"xmlForFu/taskXml/"+name+".xml";
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
        var moduleSTasks: any[] = fix2Array(module.tasks.taskResult);
        var moduleCTasks: any[] = fix2Array(module.tasks.task);

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
            html += `${space}TaskBase = ${moduleInfo.base};${newLine}${newLine}`;
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
        [moduleSTasks, moduleCTasks].forEach((commands, mIndex)=>
        {
            html += `${space}<span class="comment" >///////////////From${mIndex==ServerIndex?"task":"taskResult"}////////////////</span>${newLine}`;
            commands.forEach((obj)=> {
                let items: any[] = fix2Array(obj.item);
                let outputItems: any[] = [];
                if(obj.__) {
                    html += `<span class="comment" >${space}/*${newLine}`;
                    html += `${space}*${littlerSpace}${obj.__}${newLine}`;
                    html += `${space}*/</span>${newLine}`;
                }
                html += `${space}<span class="attribute">@Attribute(type = ${obj._.type})</span>${newLine}`;
                html += `${space}${obj._.http?'http'+littleSpace:''}<span class="fun">task</span>${littleSpace}<span class="fun1">${obj._.name}</span>${littlerSpace}:${littlerSpace}id(${obj._.id||""})${littlerSpace}{${newLine}`;
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
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('taskXml',\'${iObj._.type}\',\'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }else{
                            html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                        }
                    }
                });
                html += `${space}}${newLine}${newLine}`;
                html += `${space}${obj._.http?'http'+littleSpace:''}<span class="fun">taskResult</span>${littleSpace}<span class="fun1">${obj._.name}</span>${littlerSpace}:${littlerSpace}id(${obj._.id||""})${littlerSpace}{${newLine}`;
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
                        html += `<a class="type" target="showModeWin" href="javascript: toShowModel('taskXml',\'${iObj._.type}\',\'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                    }else{
                        html += `<span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                    }
                });
                html += `${space}}${newLine}${newLine}`;
            });
        });
        return html;
    }
}