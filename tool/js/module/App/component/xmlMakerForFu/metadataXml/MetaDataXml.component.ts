/// <reference path="../../../../../util/jquery.d.ts" />
import { Component, Input, OnInit, EventEmitter, ElementRef } from '@angular/core';
import { MetaDataXmlService } from './Service';
import { XmlMakerForFuComponent } from '../Index';
import { ServerUrl } from '../../../../../config/Common';
import { newLine, space, littlerSpace, littleSpace, calcEnumArray2CodeEnum, calcStructArray2CodeStruct, fix2Array,
    scriptCode } from '../util/Index';
import { XmlForFuService } from './../Service';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: 'vwvo-xmlMakerForFu-metaDataXml',
    templateUrl: './MetaDataXml.html'
})
export class XmlMakerForFuMetaDataXmlComponent implements OnInit {
    @Input() active:boolean = false;
    private editting:boolean = false;
    private _list: any[];
    private activeMetaDataXml:any;
    private xml:string = ``;
    private code:string = ``;
    private now:Number = new Date().getTime();
    private emptyJson:any = {
        root: {
            imports: {
                import: {_: {path: "Base"}}
            },
            types: {
                __: 'category类型：Common, User, UserAsset, UserInteraction, Lbs, MoniStore, Dao, Wolverine 注意大小写',
                _: {category: '', moduleName: '', desc: ''},
                struct: {},
                enum: {}
            }
        }
    };
    //metaDataXmlList:any = [];
    private categoryList:string[] = ['Common', 'User', 'UserAsset', 'UserInteraction', 'Lbs', 'MoniStore', 'Dao', 'Wolverine', 'UnknownCategory'];
    private isBusy:boolean = true;
    private ele:any;
    private editor:any;
    private xmlId:string;

    constructor(private sanitizer: DomSanitizer, private metaDataService:MetaDataXmlService, private clientComponent: XmlMakerForFuComponent, el:ElementRef) {
        this.ele = jQuery(el.nativeElement);
    }

    ngOnInit() {
        this.metaDataService.list({
            successCallback: (list:any)=> {
                this._list = list;
                this.isBusy = false;
                this.metaDataService.setMetadataXmlComponent(this);
            }
        });
        var me = this;
        this.editor = CodeMirror.fromTextArea(this.ele.find("textarea").get(0), {
            lineNumbers: true,
            mode: "text/xml",
            matchBrackets: true,
            extraKeys: {
                'Ctrl-S': function(){
                    me.saveMetaDataXml();
                }
            }
        });
    }

    searchMetadata(name: string, xmlForFuService: XmlForFuService) {
        var temp = this;
        var exist =  null;
        this._list.forEach(function(ele){
            ele.active = ele.strutNames ? ele.strutNames.indexOf(name) != -1 : false;
            if(ele.strutNames && ele.strutNames.indexOf('-' + name + '-') != -1){
                temp.activeMetaDataXml = ele;
                exist = true;
            }
        });
        if(exist){
            xmlForFuService.menuList.forEach(function(menu: any){
                menu.active = menu.key == 'metaDataXml';
            });
            if(this.activeMetaDataXml){
                $('#' + this.activeMetaDataXml.category).children('ul').slideDown(0);
                this.changeMetaDataXml(this.activeMetaDataXml);
                $("html,body").stop(true);
                var el = this.ele;
                setTimeout(function(){
                    var scrollTop = el.find('.brush').scrollTop();
                    var offset = el.find('.'+name).offset().top;
                    el.find('.brush').animate({scrollTop:  offset + scrollTop - 90}, 0);
                    //el.find('.search').css('#2B91AF');
                    el.find('.search').removeClass('search');
                    el.find('.'+name).prev().addClass('search').css({color:'red'});
                }, 100)
            }
        }else{
            return '不存在的metadata';
        }

    }

    titleClickFn(ele: any) {
        $('#' + ele.target.getAttribute("id")).children('ul').slideToggle(100);
    }

    getMetaDataXmlBaseInfo(metadataXml:any) {
        return metadataXml.json.root.types._;
    }

    getMetaDataXmlListByCategory(category:string) {
        //if(!this._list){
        //    this.metaDataService.list({successCallback: function(list:any){
        //        this._list = list;
        //    }});
        //}
        if (!this._list || this._list.length == 0) {
            return [];
        }
        let list:any[] = [];
        let me:any = this;
        let categoryListTemp: any[] = this.categoryList;
        this._list.forEach(function (metadataXml: any) {
            if(category == 'UnknownCategory'){
                let categorys: string = '-' + categoryListTemp.join('-');
                if(categorys.indexOf('-' + metadataXml.json.root.types._.category + '-') == -1){
                    list.push(metadataXml);
                }
            }else{
                if (category == me.getMetaDataXmlBaseInfo(metadataXml).category) {
                    list.push(metadataXml);
                }
            }
        });
        return list;
    }

    removeMetaDataXmlById(id:string) {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        let metaDataXmlList = this._list;
        for (let i = 0, len = metaDataXmlList.length; i < len; i++) {
            if (metaDataXmlList[i].id == id) {
                metaDataXmlList.splice(i, 1);
                return;
            }
        }
    }

    checkExistMetaDataIdOrName(id:string, nCategory:string, mName:string) {
        let metaDataXmlList = this._list;
        for (let i = 0, len = metaDataXmlList.length; i < len; i++) {
            let metaDataXml = metaDataXmlList[i];
            let mInfo = this.getMetaDataXmlBaseInfo(metaDataXml);
            let name:string = mInfo.moduleName;
            let category:string = mInfo.category;
            if (metaDataXml.id !== id && (name == mName && category == nCategory)) {
                return true;
            }
        }
    }

    changeMetaDataXml(metaDataXml:any) {
        this.categoryList.forEach(function(category : any){
            let test = $('#' + category).children('ul').children('li');
            for (let i = 0; i < test.length; i++) {
                $('#' +  test[i].getAttribute('id')).css('background-color','');
            }
        })
        let id = metaDataXml.category+ '-' + metaDataXml.name;
        $('#' +  id).css('background-color','#D5D5D5');
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }
        this._list.forEach((obj:any)=> {
            obj.active = obj.id == metaDataXml.id;
            if(obj.id == metaDataXml.id){
                this.xmlId = metaDataXml.id
            }
        });
        this.activeMetaDataXml = metaDataXml;
        this.xml = $.json2Xml(this.activeMetaDataXml.json);
        this.code = this.calcJSON2Code(this.xml);
        this.sanitizer.bypassSecurityTrustHtml(this.code);
        $('#metaDataWin').html(this.code);
        this.sanitizer.bypassSecurityTrustScript(scriptCode);
        $('#metaDataDiv').html(scriptCode);
        this.editor.setValue("");
        setTimeout(()=> {
            this.editor.refresh();
            this.editor.triggerOnKeyDown({});
        }, 10);
    }

    editMetaDataXml() {
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeMetaDataXml) {
            return;
        }

        if (this.editting) {
            alert("请先保存当前编辑的部分");
            return;
        }

        this.metaDataService.checkVersion({
            data: {
                id: this.activeMetaDataXml.id,
                version: this.activeMetaDataXml.version
            },
            successCallback: (e:any)=> {
                this.editting = true;
                this.xml = $.json2Xml(this.activeMetaDataXml.json);
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

    createMetaDataXml() {
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
        this.metaDataService.create({
            data: {
                jsonStr: JSON.stringify(this.emptyJson)
            },
            successCallback: (e:any)=> {
                this.isBusy = false;
                e.metaDataXml.json = JSON.parse(e.metaDataXml.jsonStr);
                e.metaDataXml.version = 0;
                this._list.push(e.metaDataXml);
                this.changeMetaDataXml(e.metaDataXml);
            }
        });
    }

    removeMetaDataXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }
        if (!this.activeMetaDataXml) {
            return;
        }
        if (!confirm("确定要删除该文件么?")) {
            return;
        }

        this.metaDataService.remove({
            data: {
                id: this.activeMetaDataXml.id,
                category: this.getMetaDataXmlBaseInfo(this.activeMetaDataXml).category,
                name: this.getMetaDataXmlBaseInfo(this.activeMetaDataXml).moduleName
            },
            successCallback: ()=> {
                this.removeMetaDataXmlById(this.activeMetaDataXml.id);
                this.isBusy = false;
                this.activeMetaDataXml = null;
                this.code = this.xml = null;
                this.editting = false;
            }
        });
    }

    cancelEditXml() {
        try {
            let xml = this.editor.getValue().trim();
            let jsonStr:string = JSON.stringify($.xml2json(xml));
            if (jsonStr !== this.activeMetaDataXml.jsonStr && !confirm("您已经修改过该文件，确定取消编辑操作?")) {
                return;
            }

            this.isBusy = false;
            this.editting = false;
        } catch (e) {
            alert("请检查格式");
        }
    }

    saveMetaDataXml() {
        if(!this.clientComponent.checkCurrVersion()){
            alert('当前版本不支持此操作!');
            return;
        }
        if (this.isBusy) {
            alert("当前存在同步操作，请稍后");
            return;
        }

        if (!this.activeMetaDataXml) {
            return;
        }
        try {
            let xml = this.editor.getValue().trim();
            this.isBusy = true;
            this.code = this.calcJSON2Code(xml);
            this.sanitizer.bypassSecurityTrustHtml(this.code);
            $('#metaDataWin').html(this.code);
            let json:any = $.xml2json(xml);
            let activeModuleInfo = json.root.types._;
            let name:string = activeModuleInfo.moduleName;
            let category:string = activeModuleInfo.category;
            if (!category || category == '') {
                alert('category不能为空！');
                return;
            }
            if (!name || name == '') {
                alert('moduleName不能为空！');
                return;
            }
            if (this.checkExistMetaDataIdOrName(this.activeMetaDataXml.id, category, name)) {
                alert("同一category下已存在该moduleName的定义");
                this.isBusy = false;
                return;
            }
            let types = json.root.types;
            let struts:any[] = fix2Array(types.struct);
            let enums:any[] = fix2Array(types.enum);
            let strutNames: string = '';
            strutNames += '-';
            struts.forEach(function(strut: any){
                strutNames += strut._.name + '-';
            });
            enums.forEach(function(eItem: any){
                strutNames += eItem._.name + '-';
            });
            this.activeMetaDataXml.json = json;
            this.activeMetaDataXml.jsonStr = JSON.stringify(this.activeMetaDataXml.json);
            this.editting = false;
            this.metaDataService.update({
                data: {
                    id: this.activeMetaDataXml.id,
                    jsonStr: this.activeMetaDataXml.jsonStr,
                    name: name,
                    category: category,
                    xml: xml,
                    version: this.activeMetaDataXml.version,
                    strutNames : strutNames
                },
                successCallback: (e:any)=> {
                    this.isBusy = false;
                    this.activeMetaDataXml.downloadUrl = ServerUrl + "xmlForFu/metadataXml/" + category + "/" + name + ".xml";
                    this.activeMetaDataXml.version = e.version;
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

        json = json.root;
        let importEles:any[] = fix2Array(json.imports.import);
        //let module: any = json.module;
        let types:any = json.types;
        let struts:any[] = fix2Array(types.struct);
        let enums:any[] = fix2Array(types.enum);
        //var moduleInfo: any = module._;
        var html:string = "";
        html += `${space}category = <span class="str">"${types._.category}"</span>;${newLine}`;
        html += `${space}module = <span class="str">"${types._.moduleName}"</span>;${newLine}`;
        if (types._.desc) {
          html += `${space}desc = <span class="str">"${types._.desc}"</span>;${newLine}${newLine}`;
        }
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
        html += calcStructArray2CodeStruct(struts, 'command', true, 'metadataXml', this.xmlId);
        return html;
    }
}