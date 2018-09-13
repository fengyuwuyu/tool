/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { JobsXmlService } from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import {
    newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    dataType, scriptCode
} from '../util/Index';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
    selector: 'vwvo-xmlMakerForFu-jobsXml',
    templateUrl: './jobsXml.html'
})
export class XmlMakerForFuJobsXmlComponent implements OnInit {
    @Input() active:boolean = false;
    private editting:boolean = false;
    private xml:string = ``;
    private code:string = ``;
    private now:Number = new Date().getTime();
    private emptyJson:any = {
        root: {
            imports: {
                import: {
                }
            },
            types: {},
            module: {
                _: {
                    id:'',
                    name: ''
                },
                jobs: {
                    job: {
                        _: {
                            id: "",
                            name: "",
                            type: "",
                            steps: "",
                            masks: ""
                        }
                    }
                }
            }
        }
    };
    private jobsXmlList:any = [];
    private jobsXmlListBak:any = [];
    private activeJobsXml:any;
    private isBusy:boolean = true;
    private ele:any;
    private editor:any;
    private timer: any;
    private xmlId: string;
    constructor(private sanitizer: DomSanitizer, private jobsService:JobsXmlService, private clientComponent: XmlMakerForFuComponent, el:ElementRef, private detectorRef: ChangeDetectorRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.jobsService.list({
            successCallback: (list:any)=> {
                this.jobsXmlList = list;
                this.jobsXmlListBak = list;
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
                    me.saveJobsXml();
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
                me.jobsXmlList = [];
                me.jobsXmlList.forEach(function(obj: any){
                    if(obj.json.root.module._.name && (obj.json.root.module._.name + '').toLocaleLowerCase().indexOf(str.trim().toLocaleLowerCase()) != -1){
                        me.jobsXmlList.push(obj);
                    }
                });
                if(me.jobsXmlList.length == 1){
                    me.changeJobsXml(me.jobsXmlList[0]);
                }
            }else{
                me.jobsXmlList = me.jobsXmlListBak;
            }
            me.detectorRef.detectChanges();
        }, 500)
    }

    removeJobsXmlById(id:string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let jobsXmlList = this.jobsXmlList;
        for (let i = 0, len = jobsXmlList.length; i < len; i++) {
            if (jobsXmlList[i].id == id) {
                jobsXmlList.splice(i, 1);
                return;
            }
        }
    }

    getJobsXmlBaseInfo(jobsXml:any) {
        return jobsXml.json.root.module._;
    }

    changeJobsXml(jobsXml:any) {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.jobsXmlList.forEach((obj:any)=> {
            obj.active = obj.id == jobsXml.id;
            if(obj.active){
                this.xmlId = jobsXml.id;
            }
        });
        this.activeJobsXml = jobsXml;
        this.xml = $.json2Xml(this.activeJobsXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#jobsWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#jobsDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editJobsXml() {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeJobsXml) {
            return;
        }

        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.jobsService.checkVersion({
            data: {
                id: this.activeJobsXml.id,
                version: this.activeJobsXml.version
            },
            successCallback: (e:any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeJobsXml.json);
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

    createJobsXml() {
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
        this.jobsService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e:any)=> {
                this.isBusy = false;
                e.jobsXml.json = JSON.parse(e.jobsXml.jsonStr);
                e.jobsXml.version = 0;
                this.jobsXmlList.push(e.jobsXml);
                this.changeJobsXml(e.jobsXml);
            }
        });
    }

    removeJobsXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeJobsXml) {
            return;
        }
        if (!confirm("确定要删除该文件么?")) {
            return;
        }

        this.jobsService.remove({
            data: {
                id: this.activeJobsXml.id,
                name: this.getJobsXmlBaseInfo(this.activeJobsXml).service || this.getJobsXmlBaseInfo(this.activeJobsXml).name
            },
            successCallback: ()=> {
                this.removeJobsXmlById(this.activeJobsXml.id);
                this.isBusy = false;
                this.activeJobsXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr:string = JSON.stringify($.xml2json(xml));
            if (jsonStr !== this.activeJobsXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch (e) {
            alert("请检查格式");
        }
    }

    saveJobsXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if (!this.activeJobsXml) {
            return;
        }
        try {
            let xml = this.editor.getValue().trim();
            this.isBusy = true;
            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#jobsWin').html(this.code);
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
            this.activeJobsXml.json = json;
            this.activeJobsXml.jsonStr = JSON.stringify(this.activeJobsXml.json);
            this.editting = false;
            this.jobsService.update({
                data: {
                    id: this.activeJobsXml.id,
                    jsonStr: this.activeJobsXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeJobsXml.version
                },
                successCallback: (e:any)=> {
                    this.isBusy = false;
                    this.activeJobsXml.downloadUrl = ServerUrl + "xmlForFu/jobsXml/" + name + ".xml";
                    this.activeJobsXml.version = e.version;
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
        html += `${space}${space}////////////////////////////jobs/////////////////////////////${newLine}${newLine}`;

        var jobs:any[] = fix2Array(module.jobs.job);
        if (module.jobs.__) {
            html += `<span class="comment" >${space}${space}/*${newLine}`;
            html += `${space}${space}*${littlerSpace}${module.jobs.__}${newLine}`;
            html += `${space}${space}*/</span>${newLine}`;
        }
        jobs.forEach((job, mIndex)=> {
            if (job.__) {
                html += `<span class="comment" >${space}${space}/*${newLine}`;
                html += `${space}${space}*${littlerSpace}${job.__}${newLine}`;
                html += `${space}${space}*/</span>${newLine}`;
            }
            html += `${space}<span class="attribute">@Attribute(type = ${job._.type}, steps = ${job._.steps}, masks = ${job._.masks})</span>${newLine}`;
            html += `${space}<span class="cs">job</span>${littleSpace}<span class="csName">${job._.name}:  id(${job._.id})</span>${littlerSpace}{${newLine}`;

            let items:any[] = fix2Array(job.item);
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
                    html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><a class="type" target="showModeWin" href="javascript: toShowModel('jobsXml',\'${iObj._.type}\',\'${this.xmlId}\')">${iObj._.type}</a>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
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