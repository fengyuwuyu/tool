/// <reference path="./../../../../util/jquery.d.ts" />
import { Component, OnInit } from '@angular/core';
import { XmlForFuService } from './Service';
@Component({
    selector: 'vwvo-xmlMakerForFu',
    templateUrl: './index.html',
    styles: [require('./index.css').toString()]
})
export class XmlMakerForFuComponent implements OnInit{
    private isBusy: boolean = false;

    private menuListObj: any = {};
    private versionList: any = [];
    private currVersion: String;

    constructor(private xmlForFuService: XmlForFuService) {
        this.xmlForFuService.menuList.forEach((menu: any)=> {
            this.menuListObj[menu.key] = menu;
        });
        this.getVersionList();
    }

    ngOnInit() {
    }

    routePanel(key: string) {
        this.xmlForFuService.menuList.forEach((menu: any)=> {
            menu.active = menu.key == key;
        });
    }

    getMenuList(){
        return  this.xmlForFuService.menuList;
    }

    checkCurrVersion = function() {
        return this.currVersion == this.versionList[this.versionList.length - 1];
    }

    getVersionList() {
        var me = this;
        this.xmlForFuService.versionList({
            successCallback: (data: any)=> {
                me.versionList = [];
                if(data.list){
                    data.list.forEach(function(item: any){
                        me.versionList.push(item);
                    });

                    me.xmlForFuService.getCurrVersion({
                        successCallback: (data: any)=> {
                            me.currVersion = data.data;
                        },
                        failCallback: (e: any)=> {
                            alert("查询当前版本失败！" + e.msg);
                        }
                    });
                }
            },
            failCallback: (e: any)=> {
                alert("查询版本列表失败！" + e.msg);
            }
        });
    }

    addVersion() {
        if(this.isBusy) {
            alert("当前系统正忙，请稍后");
            return;
        }
        var me = this;
        var version = prompt("请输入版本号", "");
        if(version && version != ''){
            var v = this.versionList[this.versionList.length - 1];
            if(version <= v){
                alert('新增版本需比最新版本大！')
                return;
            }
            this.isBusy = true;
            var me = this;
            this.xmlForFuService.addVersion({
                data: {version: version},
                successCallback: ()=> {
                    me.xmlForFuService.updateCurrVersion({
                        data: {currVersion: version},
                        successCallback: ()=> {
                            this.isBusy = false;
                            window.location.reload();
                            alert("新增版本成功！");
                        },
                        failCallback: (e: any)=> {
                            alert("更新当前版本失败！" + e.msg);
                            this.isBusy = false;
                        }
                    });
                },
                failCallback: (e: any)=> {
                    alert("新增版本失败！" + e.msg);
                    this.isBusy = false;
                }
            })
        } else {
            alert('版本号不能为空');
            return;
        }
    }

    backup() {
        if(this.isBusy) {
            alert("当前系统正忙，请稍后");
            return;
        }

        this.xmlForFuService.backup({
            successCallback: ()=> {
                alert("备份成功");
                this.isBusy = false;
            },
            failCallback: (e: any)=> {
                alert(e.msg);
                this.isBusy = false;
            }
        });
    }
}
