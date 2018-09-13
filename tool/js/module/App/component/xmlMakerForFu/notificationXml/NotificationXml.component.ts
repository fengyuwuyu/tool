/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef } from '@angular/core';
import { NotificationXmlService } from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import { newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array } from '../util/Index';
@Component({
    selector: 'vwvo-xmlMakerForFu-notificationXml',
    templateUrl: './NotificationXml.html'
})
export class XmlMakerForFuNotificationXmlComponent implements OnInit {
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
                            notificationId: "",
                            name: "",
                            businessType: ""
                        }
                    }
                }
            }
        }
    };
    private notificationXmlList:any = [];
    private activeNotificationXml:any;
    private isBusy:boolean = true;
    private ele:any;
    private editor:any;

    constructor(private eventService:NotificationXmlService, private clientComponent: XmlMakerForFuComponent, el:ElementRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.eventService.list({
            successCallback: (list:any)=> {
                this.notificationXmlList = list;
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
                    me.saveNotificationXml();
                }
            }
        });
    }

    removeNotificationXmlById(id:string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let notificationXmlList = this.notificationXmlList;
        for (let i = 0, len = notificationXmlList.length; i < len; i++) {
            if (notificationXmlList[i].id == id) {
                notificationXmlList.splice(i, 1);
                return;
            }
        }
    }

    //checkExistEventIdOrName(id:string, nCategory:string, mName:string) {
    //    let notificationXmlList = this.notificationXmlList;
    //    for (let i = 0, len = notificationXmlList.length; i < len; i++) {
    //        let notificationXml = notificationXmlList[i];
    //        let mInfo = this.getNotificationXmlBaseInfo(notificationXml);
    //        let name:string = mInfo.moduleName;
    //        let category:string = mInfo.category;
    //        if (notificationXml.id !== id && (name == mName && category == nCategory)) {
    //            return true;
    //        }
    //    }
    //}

    getNotificationXmlBaseInfo(notificationXml:any) {
        return notificationXml.json.root.module._;
    }

    changeNotificationXml(notificationXml:any) {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.notificationXmlList.forEach((obj:any)=> {
            obj.active = obj.id == notificationXml.id;
        });
        this.activeNotificationXml = notificationXml;
        this.xml = $.json2Xml(this.activeNotificationXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editNotificationXml() {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeNotificationXml) {
            return;
        }

        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.eventService.checkVersion({
            data: {
                id: this.activeNotificationXml.id,
                version: this.activeNotificationXml.version
            },
            successCallback: (e:any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeNotificationXml.json);
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

    createNotificationXml() {
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
                e.notificationXml.json = JSON.parse(e.notificationXml.jsonStr);
                e.notificationXml.version = 0;
                this.notificationXmlList.push(e.notificationXml);
                this.changeNotificationXml(e.notificationXml);
            }
        });
    }

    removeNotificationXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeNotificationXml) {
            return;
        }
        if (!confirm("确定要删除该文件么?")) {
            return;
        }

        this.eventService.remove({
            data: {
                id: this.activeNotificationXml.id,
                name: this.getNotificationXmlBaseInfo(this.activeNotificationXml).service || this.getNotificationXmlBaseInfo(this.activeNotificationXml).name
            },
            successCallback: ()=> {
                this.removeNotificationXmlById(this.activeNotificationXml.id);
                this.isBusy = false;
                this.activeNotificationXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr:string = JSON.stringify($.xml2json(xml));
            if (jsonStr !== this.activeNotificationXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch (e) {
            alert("请检查格式");
        }
    }

    saveNotificationXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if (!this.activeNotificationXml) {
            return;
        }
        try {
            let xml = this.editor.getValue().trim();
            this.isBusy = true;
            this.code = this.calcJSON2Code(xml);
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
            this.activeNotificationXml.json = json;
            this.activeNotificationXml.jsonStr = JSON.stringify(this.activeNotificationXml.json);
            this.editting = false;
            this.eventService.update({
                data: {
                    id: this.activeNotificationXml.id,
                    jsonStr: this.activeNotificationXml.jsonStr,
                    name: name,
                    xml: xml,
                    version: this.activeNotificationXml.version
                },
                successCallback: (e:any)=> {
                    this.isBusy = false;
                    this.activeNotificationXml.downloadUrl = ServerUrl + "xmlForFu/notificationXml/" + name + ".xml";
                    this.activeNotificationXml.version = e.version;
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
        html += calcStructArray2CodeStruct(struts, 'command');

        html += `${space}${space}////////////////////////////Notification/////////////////////////////${newLine}${newLine}`;

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
            html += `${space}<span class="attribute">@Attribute(notificationId = ${event._.notificationId}, businessType = ${event._.businessType})</span>${newLine}`;
            html += `${space}<span class="cs">notification</span>${littleSpace}<span class="csName">${event._.name}Notification</span>${littlerSpace}{${newLine}`;

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
                html += `<span class="type">${iObj._.private?"private"+littleSpace:""}</span><span class="type">${iObj._.type}</span>${iObj._.attribute == "repeated"?"[]":""}${littleSpace}${iObj._.name};${newLine}`;
            });
            html += `${space}}`;
            html += `${newLine}${newLine}`;
        });

        return html;
    }
}