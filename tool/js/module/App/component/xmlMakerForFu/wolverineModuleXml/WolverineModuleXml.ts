/// <reference path="../../../../../util/jquery.d.ts" />
import {
    Component, Input, OnInit, ElementRef, ChangeDetectorRef, Renderer2
} from '@angular/core';
import {WolverineModuleXmlService} from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import { newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType,
    scriptCode } from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";


@Component({
    selector: 'vwvo-xmlMakerForFu-wolverineModuleXml',
    templateUrl: './wolverineModuleXml.html'
})
export class XmlMakerForFuWolverineModuleXmlComponent implements OnInit {

    @Input() active: boolean = false;
    private editting: boolean = false;
    private xmlName: string = "WolverineModuleXml";
    private currentXmlId: any;
    private xml: string = ``;
    private code: string = ``;
    private emptyJson: any = {
        root: {
            imports: {
                import: {}
            },
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
                }
            }
        }
    };
    private moduleXmlList: any = [];
    private moduleXmlListBak: any = [];
    private activeModuleXml: any;
    private isBusy: boolean = true;
    private ele: any;
    private editor: any;
    private timer: any;
    constructor(private sanitizer: DomSanitizer, private moduleXmlService: WolverineModuleXmlService, private clientComponent: XmlMakerForFuComponent, el: ElementRef, private detectorRef: ChangeDetectorRef) {
        this.sanitizer.bypassSecurityTrustHtml(this.code);

        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.moduleXmlService.list({
            successCallback: (list: any)=> {
                this.moduleXmlList = list;
                this.moduleXmlListBak = this.moduleXmlList;
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
                    me.saveModuleXml();
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
                me.moduleXmlList = [];
                me.moduleXmlListBak.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.moduleXmlList.push(obj);
                    }
                });
                if(me.moduleXmlList.length == 1){
                    me.changeModuleXml(me.moduleXmlList[0]);
                }
            }else{
                me.moduleXmlList = me.moduleXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }
    removeModuleXmlById(id: string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let moduleXmlList = this.moduleXmlList;
        for(let i=0, len=moduleXmlList.length; i<len; i++) {
            if(moduleXmlList[i].id == id) {
                moduleXmlList.splice(i, 1);
                return;
            }
        }
    }

    checkExistModuleIdOrName(id: string, mId: number, mName: string) {
        let moduleXmlList = this.moduleXmlList;
        for(let i=0, len=moduleXmlList.length; i<len; i++) {
            let moduleXml = moduleXmlList[i];
            let mInfo = this.getModuleXmlBaseInfo(moduleXml);
            let name: string = mInfo.service || mInfo.name;
            if(moduleXml.id !== id && (name.toLowerCase() == mName.toLowerCase())) {
                return true;
            }
        }
    }

    getModuleXmlBaseInfo(moduleXml: any) {
        return moduleXml.json.root.module._;
    }

    changeModuleXml(moduleXml: any) {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.moduleXmlList.forEach((obj: any)=> {
            obj.active = obj.id == moduleXml.id;
            if(obj.active){
                this.currentXmlId = obj.id;
            }
        });
        this.activeModuleXml = moduleXml;
        this.xml = $.json2Xml(this.activeModuleXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#wolverineModleWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#wolverineModleDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editModuleXml() {
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(!this.activeModuleXml) {
            return;
        }

        if(this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }
        this.moduleXmlService.checkVersion({
            data: {
                id: this.activeModuleXml.id,
                version: this.activeModuleXml.version
            },
            successCallback: (e: any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeModuleXml.json);
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
        })
    }

    createModuleXml() {
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
        this.moduleXmlService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e: any)=> {
                this.isBusy = false;
                e.moduleXml.json = JSON.parse(e.moduleXml.jsonStr);
                e.moduleXml.version = 0;
                this.moduleXmlList.push(e.moduleXml);
                this.changeModuleXml(e.moduleXml);
            }
        });
    }

    removeModuleXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if(!this.activeModuleXml) {
            return;
        }
        if(!confirm("确定要删除该文件么?")) {
            return;
        }

        this.moduleXmlService.remove({
            data: {
                id: this.activeModuleXml.id,
                name: this.getModuleXmlBaseInfo(this.activeModuleXml).service || this.getModuleXmlBaseInfo(this.activeModuleXml).name
            },
            successCallback: ()=> {
                this.removeModuleXmlById(this.activeModuleXml.id);
                this.isBusy = false;
                this.activeModuleXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr: string = JSON.stringify($.xml2json(xml));
            if(jsonStr !== this.activeModuleXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch(e) {
            alert("请检查格式");
        }
    }

    saveModuleXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if(this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if(!this.activeModuleXml) {
            return;
        }
        try {
            let xml = this.editor.getValue().trim();
            this.isBusy = true;
            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#wolverineModleWin').html(this.code);
            let json: any = $.xml2json(xml);
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
            if(this.checkExistModuleIdOrName(this.activeModuleXml.id, activeModuleInfo.id, name)) {
                alert("存在相同模块名称的模块");
                this.isBusy = false;
                return;
            }
            this.activeModuleXml.json = json;
            this.activeModuleXml.jsonStr = JSON.stringify(this.activeModuleXml.json);
            this.editting = false;
            this.moduleXmlService.update({
                data: {
                    id: this.activeModuleXml.id,
                    jsonStr: this.activeModuleXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeModuleXml.version
                },
                successCallback: (e: any)=> {
                    this.isBusy = false;
                    this.activeModuleXml.downloadUrl = ServerUrl+"xmlForFu/wolverine/rpcXml/"+name+".xml";
                    this.activeModuleXml.version = e.version;
                },
                failCallback: (e: any)=> {
                    this.isBusy = false;
                    alert(e.msg);
                }
            });
        } catch(e) {
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
        html += calcStructArray2CodeStruct(struts, "command", false, this.xmlName, this.currentXmlId);
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
                            html += `<a class="type" target="showModeWin" href="javascript: toShowModel(\'${this.xmlName}\', \'${iObj._.type}\', \'${this.currentXmlId}\')">${iObj._.type}</a>${iObj._.attribute==="repeated"?"[]":""}${littleSpace}${iObj._.name}`;
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
                                html += `<a class="type" target="showModeWin" href="javascript: toShowModel(\'${this.xmlName}\', \'${iObj._.type}\', \'${this.currentXmlId}\')">${iObj._.type}</a>${iObj._.attribute==="repeated"?"[]":""}${littleSpace}${iObj._.name}`;
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
}