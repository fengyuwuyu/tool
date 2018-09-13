/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { RecordXmlService } from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import { newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType,
    scriptCode } from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: 'vwvo-xmlMakerForFu-recordXml',
    templateUrl: './RecordXml.html'
})
export class XmlMakerForFuRecordXmlComponent implements OnInit {
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
                records: {
                    record: {
                        _: {
                            id: "",
                            name: ""
                        }
                    }
                }
            }
        }
    };
    private recordXmlList:any = [];
    private recordXmlListBak:any = [];
    private activeRecordXml:any;
    private isBusy:boolean = true;
    private ele:any;
    private editor:any;
    private timer: any;
    private xmlId: any;
    constructor(private sanitizer: DomSanitizer, private recordService:RecordXmlService, private clientComponent: XmlMakerForFuComponent, el:ElementRef, private detectorRef: ChangeDetectorRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.recordService.list({
            successCallback: (list:any)=> {
                this.recordXmlList = list;
                this.recordXmlListBak = list;
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
                    me.saveRecordXml();
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
                me.recordXmlList = [];
                me.recordXmlListBak.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.recordXmlList.push(obj);
                    }
                });
                if(me.recordXmlList.length == 1){
                    me.changeRecordXml(me.recordXmlList[0]);
                }
            }else{
                me.recordXmlList = me.recordXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }

    removeRecordXmlById(id:string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let recordXmlList = this.recordXmlList;
        for (let i = 0, len = recordXmlList.length; i < len; i++) {
            if (recordXmlList[i].id == id) {
                recordXmlList.splice(i, 1);
                return;
            }
        }
    }

    //checkExistEventIdOrName(id:string, nCategory:string, mName:string) {
    //    let recordXmlList = this.recordXmlList;
    //    for (let i = 0, len = recordXmlList.length; i < len; i++) {
    //        let recordXml = recordXmlList[i];
    //        let mInfo = this.getRecordXmlBaseInfo(recordXml);
    //        let name:string = mInfo.moduleName;
    //        let category:string = mInfo.category;
    //        if (recordXml.id !== id && (name == mName && category == nCategory)) {
    //            return true;
    //        }
    //    }
    //}

    getRecordXmlBaseInfo(recordXml:any) {
        return recordXml.json.root.module._;
    }

    changeRecordXml(recordXml:any) {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.recordXmlList.forEach((obj:any)=> {
            obj.active = obj.id == recordXml.id;
            if(obj.active){
                this.xmlId = recordXml.id;
            }
        });
        this.activeRecordXml = recordXml;
        this.xml = $.json2Xml(this.activeRecordXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#recordWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#recordDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editRecordXml() {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeRecordXml) {
            return;
        }

        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.recordService.checkVersion({
            data: {
                id: this.activeRecordXml.id,
                version: this.activeRecordXml.version
            },
            successCallback: (e:any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeRecordXml.json);
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

    createRecordXml() {
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
        this.recordService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e:any)=> {
                this.isBusy = false;
                e.recordXml.json = JSON.parse(e.recordXml.jsonStr);
                e.recordXml.version = 0;
                this.recordXmlList.push(e.recordXml);
                this.changeRecordXml(e.recordXml);
            }
        });
    }

    removeRecordXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeRecordXml) {
            return;
        }
        if (!confirm("确定要删除该文件么?")) {
            return;
        }

        this.recordService.remove({
            data: {
                id: this.activeRecordXml.id,
                name: this.getRecordXmlBaseInfo(this.activeRecordXml).service || this.getRecordXmlBaseInfo(this.activeRecordXml).name
            },
            successCallback: ()=> {
                this.removeRecordXmlById(this.activeRecordXml.id);
                this.isBusy = false;
                this.activeRecordXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr:string = JSON.stringify($.xml2json(xml));
            if (jsonStr !== this.activeRecordXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch (e) {
            alert("请检查格式");
        }
    }

    saveRecordXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if (!this.activeRecordXml) {
            return;
        }
        try {
            let xml = this.editor.getValue().trim();
            this.isBusy = true;
            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#recordWin').html(this.code);
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
            this.activeRecordXml.json = json;
            this.activeRecordXml.jsonStr = JSON.stringify(this.activeRecordXml.json);
            this.editting = false;
            this.recordService.update({
                data: {
                    id: this.activeRecordXml.id,
                    jsonStr: this.activeRecordXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeRecordXml.version
                },
                successCallback: (e:any)=> {
                    this.isBusy = false;
                    this.activeRecordXml.downloadUrl = ServerUrl + "xmlForFu/recordXml/" + name + ".xml";
                    this.activeRecordXml.version = e.version;
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

        html += `${space}${space}////////////////////////////Record/////////////////////////////${newLine}${newLine}`;

        var records:any[] = fix2Array(module.records.record);
        if (module.records.__) {
            html += `<span class="comment" >${space}${space}/*${newLine}`;
            html += `${space}${space}*${littlerSpace}${module.records.__}${newLine}`;
            html += `${space}${space}*/</span>${newLine}`;
        }
        records.forEach((record, mIndex)=> {
            if (record.__) {
                html += `<span class="comment" >${space}${space}/*${newLine}`;
                html += `${space}${space}*${littlerSpace}${record.__}${newLine}`;
                html += `${space}${space}*/</span>${newLine}`;
            }
            html += `${space}<span class="attribute">@Attribute(recordId = ${record._.id})</span>${newLine}`;
            html += `${space}<span class="cs">record</span>${littleSpace}<span class="csName">${record._.name}Record</span>${littlerSpace}{${newLine}`;

            let items:any[] = fix2Array(record.item);
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
                    html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('recordXml',\'${iObj._.type}\',\'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
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