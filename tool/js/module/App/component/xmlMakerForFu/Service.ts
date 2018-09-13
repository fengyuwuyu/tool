import { Injectable } from '@angular/core';
import { ServerUrl, DBOpeType } from '../../../../config/Common';
@Injectable()
export class XmlForFuService {
    public menuList: any[] = [
        {
            key: "vwvo",
            text: "VWVO",
            active: true
        },
        {
            key: "wolverine",
            text: "Wolverine"
        }
       /* {
            key: "moduleXml",
            text: "RPC函数定义",
            active: true
        },
        {
            key: "commandXml",
            text: "客户端服务器Command定义"
        },
        {
            key: "httpCommandXml",
            text: "HttpCommand定义"
        },
        {
            key: "bridgeCommandXml",
            text: "BridgeCommand定义"
        },
        {
            key: "metaDataXml",
            text: "元数据定义"
        },
        {
            key: "eventXml",
            text: "Event定义"
        },
        //{
        //    key: "notificationXml",
        //    text: "Notification定义"
        //},
        {
            key: "recordXml",
            text: "Record定义"
        },
        {
            key: "jobsXml",
            text: "jobs"
        },
        {
            key: "taskXml",
            text: "task"
        }*/
    ];

    backup(e: any) {
        $.ajax({
            url: ServerUrl+"xmlForFu/"+DBOpeType.BackUp,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    updateCurrVersion(e: any){
        $.ajax({
            url: ServerUrl+"xmlForFu/"+DBOpeType.UpdateCurrVersion,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    getCurrVersion(e: any){
        $.ajax({
            url: ServerUrl+"xmlForFu/"+DBOpeType.GetCurrVersion,
            type: "post",
            contentType: "application/json",
            data: JSON.stringify({}),
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    versionList(e: any){
        $.ajax({
            url: ServerUrl+"xmlForFu/"+DBOpeType.VersionList,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }

    addVersion(e: any){
        $.ajax({
            url: ServerUrl+"xmlForFu/"+DBOpeType.AddVersion,
            type: "post",
            data: JSON.stringify(e.data),
            contentType: "application/json",
            xhrFields: {
                withCredentials: true
            },
            success: (resJson)=> {
                if(resJson.result) {
                    e.successCallback && e.successCallback(resJson);
                } else {
                    e.failCallback && e.failCallback(resJson);
                }
            },
            error: (e2)=> {
            }
        });
    }
}