/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import {WolverineEventXmlService} from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import {
    newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType, scriptCode
} from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: 'vwvo-xmlMakerForFu-wolverineEventXml',
    templateUrl: './WolveineEventXml.html'
})
export class XmlMakerForFuWolverineEventXmlComponent implements OnInit {
    @Input() active:boolean = false;
    private editting:boolean = false;
    private xml:string = ``;
    private code:string = ``;
    private now:Number = new Date().getTime();
    private emptyJson:any = {
        root: {
            imports: {
                import: {}
            },
            types: {},
            module: {
                _: {
                    id: 0,
                    name: ''
                },
                events: {
                    event: {
                        _: {
                            id: 1,
                            name: "",
                            type: 1,
                            level: "INFO",
                            ack: 0
                        }
                    }
                }
            }
        }
    };
    private eventXmlList:any = [];
    private eventXmlListBak:any = [];
    private activeEventXml:any;
    private isBusy:boolean = true;
    private ele:any;
    private editor:any;
    private timer: any;
    private xmlId: string;
    private xmlName: string = "wolverineEventXml";

    constructor(private sanitizer: DomSanitizer, private eventService: WolverineEventXmlService, private clientComponent: XmlMakerForFuComponent, el:ElementRef, private detectorRef: ChangeDetectorRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.eventService.list({
            successCallback: (list:any)=> {
                this.eventXmlList = list;
                this.eventXmlListBak = this.eventXmlList;
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
                    me.saveEventXml();
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
                me.eventXmlList = [];
                me.eventXmlListBak.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.eventXmlList.push(obj);
                    }
                });
                if(me.eventXmlList.length == 1){
                    me.changeEventXml(me.eventXmlList[0]);
                }
            }else{
                me.eventXmlList = me.eventXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }

    removeEventXmlById(id:string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let eventXmlList = this.eventXmlList;
        for (let i = 0, len = eventXmlList.length; i < len; i++) {
            if (eventXmlList[i].id == id) {
                eventXmlList.splice(i, 1);
                return;
            }
        }
    }

    getEventXmlBaseInfo(eventXml:any) {
        return eventXml.json.root.module._;
    }

    changeEventXml(eventXml:any) {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.eventXmlList.forEach((obj:any)=> {
            obj.active = obj.id == eventXml.id;
            if(obj.active){
                this.xmlId = obj.id;
            }
        });
        this.activeEventXml = eventXml;
        this.xml = $.json2Xml(this.activeEventXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#wolverienEventWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#wolverienEventDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editEventXml() {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeEventXml) {
            return;
        }

        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.eventService.checkVersion({
            data: {
                id: this.activeEventXml.id,
                version: this.activeEventXml.version
            },
            successCallback: (e:any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeEventXml.json);
                this.editor.setValue(this.xml);
                setTimeout(()=> {
                    this.editor.refresh();
                    this.editor.triggerOnKeyDown({});
                }, 10);
            },
            failCallback: (e:any)=> {
                alert(e.msg);
                return;
            }
        })
    }

    createEventXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.isBusy = true;
        let tmpTimespan = +new Date();
        //this.emptyJson.root.module._.id = tmpTimespan;
        //this.emptyJson.root.module._.name = tmpTimespan;
        this.eventService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e:any)=> {
                this.isBusy = false;
                e.eventXml.json = JSON.parse(e.eventXml.jsonStr);
                e.eventXml.version = 0;
                this.eventXmlList.push(e.eventXml);
                this.changeEventXml(e.eventXml);
            }
        });
    }

    removeEventXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeEventXml) {
            return;
        }
        if (!confirm("确定要删除该文件么?")) {
            return;
        }

        this.eventService.remove({
            data: {
                id: this.activeEventXml.id,
                name: this.getEventXmlBaseInfo(this.activeEventXml).service || this.getEventXmlBaseInfo(this.activeEventXml).name
            },
            successCallback: ()=> {
                this.removeEventXmlById(this.activeEventXml.id);
                this.isBusy = false;
                this.activeEventXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr:string = JSON.stringify($.xml2json(xml));
            if (jsonStr !== this.activeEventXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch (e) {
            alert("请检查格式");
        }
    }

    saveEventXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if (!this.activeEventXml) {
            return;
        }
        try {
            let xml = this.editor.getValue().trim();
            this.isBusy = true;
            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#wolverienEventWin').html(this.code);
            let json:any = $.xml2json(xml);
            let activeModuleInfo = json.root.module._;
            let name:string = activeModuleInfo.service || activeModuleInfo.name;
            let id:number = activeModuleInfo.id;
            if (id == 0) {
                alert('请修改module id！');
                this.isBusy = false;
                return;
            }
            if (!name || name == '') {
                alert('请修改module name！');
                this.isBusy = false;
                return;
            }


            if(this.checkExistCommandIdOrName(this.activeEventXml.id, activeModuleInfo.id, name)) {
                alert("存在相同模块名称的模块");
                this.isBusy = false;
                return;
            }

            if (json.root.imports) {
                let importEles:any[] = fix2Array(json.root.imports.import);
                if (importEles && importEles.length > 0) {
                    let notExistCategory:boolean;
                    importEles.forEach(function (importEle) {
                        if (!importEle._.category && importEle._.path) {
                            notExistCategory = true;
                        }
                    });
                    if (notExistCategory) {
                        alert("import的category属性不能为空！");
                        this.isBusy = false;
                        return;
                    }
                }
            }
            this.activeEventXml.json = json;
            this.activeEventXml.jsonStr = JSON.stringify(this.activeEventXml.json);
            this.editting = false;
            this.eventService.update({
                data: {
                    id: this.activeEventXml.id,
                    jsonStr: this.activeEventXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeEventXml.version
                },
                successCallback: (e:any)=> {
                    this.isBusy = false;
                    this.activeEventXml.downloadUrl = ServerUrl + "xmlForFu/wolverine/eventXml/" + name + ".xml";
                    this.activeEventXml.version = e.version;
                },
                failCallback: (e:any)=> {
                    this.isBusy = false;
                    alert(e.msg);
                }
            });
        } catch (e) {
            console.log(e);
            alert("操作发生错误，请检查xml是否正确或完整，或刷新页面即可操作");
            this.isBusy = false;
        }
    }

    checkExistCommandIdOrName(id: string, mId: number, mName: string) {
        let commandXmlList = this.eventXmlList;
        for(let i=0, len=commandXmlList.length; i<len; i++) {
            let commandXml = commandXmlList[i];
            let mInfo = this.getEventXmlBaseInfo(commandXml);
            let name: string = mInfo.service || mInfo.name;
            if(commandXml.id !== id && (mInfo.name.toLowerCase() == mName.toLowerCase())) {
                return true;
            }
        }
    }

    calcJSON2Code(xml:string) {
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

        html += `${space}${space}////////////////////////////Event/////////////////////////////${newLine}${newLine}`;

        var events:any[] = fix2Array(module.events.event);
        if (module.events.__) {
            html += `<span class="comment" >${space}${space}/*${newLine}`;
            html += `${space}${space}*${littlerSpace}${module.events.__}${newLine}`;
            html += `${space}${space}*/</span>${newLine}`;
        }
        events.forEach((event, mIndex)=> {
            if (event.__) {
                html += `<span class="comment" >${space}${space}/*${newLine}`;
                html += `${space}${space}*${littlerSpace}${event.__}${newLine}`;
                html += `${space}${space}*/</span>${newLine}`;
            }
            html += `${space}<span class="attribute">@Attribute(id = ${event._.id}, type = ${event._.type}, level = ${event._.level}, ack = ${event._.ack == 0 ? false : true })</span>${newLine}`;
            html += `${space}<span class="cs">event</span>${littleSpace}<span class="csName">${event._.name}Event</span>${littlerSpace}{${newLine}`;

            let items:any[] = fix2Array(event.item);
            items.forEach((iObj, iIndex)=> {
                if(iObj.__){
                    html += `<span class="comment" >${space}${space}/*${newLine}`;
                    html += `${space}${space}*${littlerSpace}${iObj.__}${newLine}`;
                    html += `${space}${space}*/</span>${newLine}`;
                }
                if((iObj._.required &&iObj._.required == '0') || (iObj._.attribute && iObj._.attribute === 'optional')){
                    html += `${space}${space}<span class='type'>optional</span>`+littleSpace;
                }else{
                    html += `${space}${space}<span class='type'>required</span>`+littleSpace;
                }
                if(dataType.indexOf(iObj._.type) == -1){
                    html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('WolverineEventXml', \'${iObj._.type}\', \'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                }else{
                    html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
                }
            });
            html += `${space}}`;
            html += `${newLine}${newLine}`;
        });

        return html;
    }
}