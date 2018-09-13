import {Component, Input, OnInit} from '@angular/core';
import {VWVOService} from "./Service";
import {XmlForFuService} from "../xmlMakerForFu/Service";


@Component({
    selector: 'vwvo-xmlMakerForFu-vwvo',
    templateUrl: './vwvoComponent.html'
})
export class VWVOComponent implements  OnInit{

    @Input() active:boolean = false;
    private menuListObj: any = {};
    private isBusy: boolean = false;
    private versionList: any = [];
    private currVersion: String;

   constructor(private vwvoService: VWVOService, private xmlForFuService : XmlForFuService) {
        this.vwvoService.menuList.forEach((menu: any)=> {
            this.menuListObj[menu.key] = menu;
        });
       this.getVersionList();
    }



    routePanel2(key: string) {
        this.vwvoService.menuList.forEach((menu: any)=> {
            menu.active = menu.key == key;
        });
    }

    getMenuList2(){
        return  this.vwvoService.menuList;
    }

    ngOnInit(): void {
    }

    checkCurrVersion = function() {
        return this.currVersion == this.versionList[this.versionList.length - 1];
    }

    updateVersion() {
        var me = this;
        this.xmlForFuService.updateCurrVersion({
            data: {currVersion: me.currVersion},
            successCallback: (data: any)=> {
                //me.currVersion = data.data;
                window.location.reload();
                console.log(me.currVersion);
            },
            failCallback: (e: any)=> {
                alert("更新当前版本失败！" + e.msg);
            }
        });
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
    /*
    private isBusy: boolean = false;
    private versionList: any = [];
    private currVersion: String;
    */

   /* */

    /*ngOnInit() {
    }




    checkCurrVersion = function() {
        return this.currVersion == this.versionList[this.versionList.length - 1];
    }

    updateVersion() {
        var me = this;
        this.vwvoService.updateCurrVersion({
            data: {currVersion: me.currVersion},
            successCallback: (data: any)=> {
                //me.currVersion = data.data;
                window.location.reload();
                console.log(me.currVersion);
            },
            failCallback: (e: any)=> {
                alert("更新当前版本失败！" + e.msg);
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
            this.vwvoService.addVersion({
                data: {version: version},
                successCallback: ()=> {
                    me.vwvoService.updateCurrVersion({
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

        this.vwvoService.backup({
            successCallback: ()=> {
                alert("备份成功");
                this.isBusy = false;
            },
            failCallback: (e: any)=> {
                alert(e.msg);
                this.isBusy = false;
            }
        });
    }*/
}